import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Story, Category, CATEGORY_COLORS } from '../types';
import { useGyroscope } from '../hooks/useGyroscope';
import { useHaptics } from '../hooks/useHaptics';

interface GlobeProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
  onMapClick: (lat: number, lng: number, country?: string) => void;
  isAddingMode: boolean;
  showHeatmap?: boolean;
  showDayNight?: boolean;
  showConstellations?: boolean;
  enableGyro?: boolean;
  hoveredCategory: Category | null;
  selectedCategory: Category | null;
  selectedStory: Story | null;
}

const Globe: React.FC<GlobeProps> = (props) => {
  const {
    stories,
    onStoryClick,
    onMapClick,
    isAddingMode,
    showHeatmap = false,
    showDayNight = true,
    showConstellations = true,
    enableGyro = false,
    hoveredCategory,
    selectedCategory,
    selectedStory
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Keep latest props in a ref to access them in the d3 timer without re-running the effect
  const propsRef = useRef(props);
  propsRef.current = props;

  // Hooks
  const { x: gyroX, y: gyroY, requestPermission: requestGyroPermission } = useGyroscope();
  const gyroRef = useRef({ x: 0, y: 0 });
  gyroRef.current = { x: gyroX || 0, y: gyroY || 0 };

  const { triggerImpact } = useHaptics();

  // Refs for animation state
  const rotationRef = useRef<[number, number]>([0, 0]);
  const targetRotationRef = useRef<[number, number] | null>(null);
  const scaleRef = useRef<number>(0);
  const velocityRef = useRef<[number, number]>([0, 0]);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<[number, number] | null>(null);
  const startPosRef = useRef<[number, number] | null>(null);

  // Visual Effects Refs
  const particlesRef = useRef<any[]>([]);
  const activeCategoryRef = useRef<Category | null>(null);
  const categoryHoverStartTimeRef = useRef<number>(0);

  const [worldData, setWorldData] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  const hoveredCountryRef = useRef<any>(null); // Ref for loop access

  // Sync hoveredCountry state to ref
  useEffect(() => {
    hoveredCountryRef.current = hoveredCountry;
  }, [hoveredCountry]);

  // Load TopoJSON data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        setWorldData(topojson.feature(topology, topology.objects.countries));
      });
  }, []);

  // Initialize Scale
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    scaleRef.current = Math.min(width, height) / 2.5;
  }, []);

  // Handle Selected Story Rotation
  useEffect(() => {
    if (selectedStory) {
      targetRotationRef.current = [-selectedStory.lng, -selectedStory.lat];
    } else {
      targetRotationRef.current = null;
    }
  }, [selectedStory]);

  // Main D3 Render Loop
  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select(svgRef.current);

    // Clear previous render
    svg.selectAll("*").remove();

    // Groups
    const waterGroup = svg.append("g").attr("class", "water-group");
    const nightGroup = svg.append("g").attr("class", "night-group");
    const landGroup = svg.append("g").attr("class", "land-group");
    const constellationsGroup = svg.append("g").attr("class", "constellations-group");
    const particlesGroup = svg.append("g").attr("class", "particles-group");
    const heatmapGroup = svg.append("g").attr("class", "heatmap-group");
    const markersGroup = svg.append("g").attr("class", "markers-group");
    const labelsGroup = svg.append("g").attr("class", "labels-group");

    // Projection setup
    const projection = d3.geoOrthographic()
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // --- Static Elements Setup ---

    // 1. Water
    waterGroup.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("fill", "#0f172a")
      .attr("class", "cursor-move")
      .on("click", (event) => {
        if (!isDraggingRef.current) {
          setHoveredCountry(null); // Update state to trigger re-render of overlay if needed
          hoveredCountryRef.current = null;

          const { isAddingMode, onMapClick } = propsRef.current;
          if (isAddingMode) {
            triggerImpact('medium');
            const [x, y] = d3.pointer(event);
            const coords = projection.invert!([x, y]);
            if (coords) onMapClick(coords[1], coords[0]);
          }
        }
      });

    // 2. Land
    landGroup.selectAll("path")
      .data((worldData as any).features)
      .enter().append("path")
      .attr("fill", "#1e293b")
      .attr("stroke", "#334155")
      .attr("stroke-width", 0.5)
      .attr("class", "cursor-move hover:fill-slate-700 transition-colors")
      .on("mouseover", (event, d: any) => {
        if (!isDraggingRef.current && window.matchMedia("(hover: hover)").matches) {
          hoveredCountryRef.current = d;
          setHoveredCountry(d);
        }
      })
      .on("mouseout", () => {
        if (window.matchMedia("(hover: hover)").matches) {
          hoveredCountryRef.current = null;
          setHoveredCountry(null);
        }
      })
      .on("click", (event, d: any) => {
        if (!isDraggingRef.current) {
          const { isAddingMode, onMapClick } = propsRef.current;

          if (!isAddingMode) {
            const newVal = (hoveredCountryRef.current === d) ? null : d;
            hoveredCountryRef.current = newVal;
            setHoveredCountry(newVal);
          }

          if (isAddingMode) {
            triggerImpact('medium');
            const [x, y] = d3.pointer(event);
            const coords = projection.invert!([x, y]);
            if (coords) onMapClick(coords[1], coords[0], d.properties.name);
          }
        }
      });

    // 3. Night Cycle Setup (Static Path, updated in loop)
    const nightPath = nightGroup.append("path")
      .attr("fill", "#272323ed")
      .attr("fill-opacity", 0.4)
      .attr("pointer-events", "none");


    // --- Animation Loop ---
    const timer = d3.timer(() => {
      const {
        stories, showHeatmap, showDayNight, showConstellations, enableGyro,
        hoveredCategory, selectedCategory, selectedStory, onStoryClick
      } = propsRef.current;

      const { x: gX, y: gY } = gyroRef.current;

      // Logic: 
      if (isDraggingRef.current) {
        // Handled by drag behavior
      } else if (targetRotationRef.current) {
        // Smoothly interpolate to target
        const [currentLon, currentLat] = rotationRef.current;
        const [targetLon, targetLat] = targetRotationRef.current;

        const k = 0.05;
        let dLon = targetLon - currentLon;
        let dLat = targetLat - currentLat;

        if (dLon > 180) dLon -= 360;
        if (dLon < -180) dLon += 360;

        rotationRef.current[0] += dLon * k;
        rotationRef.current[1] += dLat * k;

        velocityRef.current = [0, 0];
      } else {
        // Gyroscope
        const gyroSensitivity = 0.05;
        if (enableGyro && (Math.abs(gX) > 2 || Math.abs(gY) > 2)) {
          rotationRef.current[0] += gX * gyroSensitivity;
          rotationRef.current[1] += gY * gyroSensitivity;
        }

        // Momentum
        velocityRef.current[0] *= 0.95;
        velocityRef.current[1] *= 0.95;

        if (Math.abs(velocityRef.current[0]) < 0.001) velocityRef.current[0] = 0;
        if (Math.abs(velocityRef.current[1]) < 0.001) velocityRef.current[1] = 0;

        rotationRef.current[0] += velocityRef.current[0];
        rotationRef.current[1] += velocityRef.current[1];
      }

      // Update Projection
      projection.scale(scaleRef.current);
      projection.rotate([rotationRef.current[0], rotationRef.current[1], 0]);

      // Update Water
      waterGroup.select("circle").attr("r", projection.scale());

      // Redraw Paths
      landGroup.selectAll("path").attr("d", pathGenerator as any);

      // Update Night
      if (showDayNight) {
        const now = new Date();
        const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
        const sunLon = -(hours - 12) * 15;
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        const sunLat = 23.5 * Math.sin(2 * Math.PI * (dayOfYear - 80) / 365);
        const nightCircle = d3.geoCircle().center([sunLon + 180, -sunLat]).radius(90);

        nightPath.datum(nightCircle()).attr("d", pathGenerator as any).attr("display", null);
      } else {
        nightPath.attr("display", "none");
      }

      // Calculate Visible Dots
      const visibleDots = stories.map(story => {
        const projected = projection([story.lng, story.lat]);
        const isVisible = projected && d3.geoDistance([story.lng, story.lat], projection.invert!([width / 2, height / 2])!) < 1.57;
        return { ...story, projected, isVisible };
      }).filter(d => d.isVisible && d.projected);

      // Draw Constellations
      const activeCategory = hoveredCategory || selectedCategory;
      if (activeCategory !== activeCategoryRef.current) {
        activeCategoryRef.current = activeCategory;
        categoryHoverStartTimeRef.current = Date.now();
      }

      constellationsGroup.selectAll("*").remove();

      if (showConstellations && activeCategory) {
        const categoryDots = stories.filter(d => d.category === activeCategory);
        if (categoryDots.length > 1) {
          // Create a GeoJSON LineString from the coordinates
          const lineString = {
            type: "LineString",
            coordinates: categoryDots.map(d => [d.lng, d.lat])
          };

          // Use the existing pathGenerator (d3.geoPath) to render the geodesic line
          const pathData = pathGenerator(lineString as any);

          if (pathData) {
            const path = constellationsGroup.append("path")
              .attr("d", pathData)
              .attr("fill", "none")
              .attr("stroke", CATEGORY_COLORS[activeCategory] || "#ffffff")
              .attr("stroke-width", 1.5)
              .attr("stroke-opacity", 0.6)
              .style("pointer-events", "none");

            const totalLength = (path.node() as SVGPathElement).getTotalLength();
            const elapsed = Date.now() - categoryHoverStartTimeRef.current;
            const duration = 1500;
            const progress = Math.min(1, elapsed / duration);

            path
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength * (1 - progress));
          }
        }
      }

      // Particles
      particlesGroup.selectAll("*").remove();
      if (selectedStory) {
        if (Math.random() < 0.2) {
          const storyDot = visibleDots.find(d => d.id === selectedStory.id);
          if (storyDot && storyDot.projected) {
            particlesRef.current.push({
              x: storyDot.projected[0],
              y: storyDot.projected[1],
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              life: 1.0,
              color: CATEGORY_COLORS[selectedStory.category] || "#ffffff"
            });
          }
        }
      }
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
      });
      if (particlesRef.current.length > 0) {
        particlesGroup.selectAll("circle")
          .data(particlesRef.current)
          .enter().append("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", d => 2 * d.life)
          .attr("fill", d => d.color)
          .attr("opacity", d => d.life)
          .style("pointer-events", "none");
      }

      // Heatmap
      heatmapGroup.selectAll("*").remove();
      if (showHeatmap && visibleDots.length > 0) {
        // Throttle heatmap? For now, just render.
        const densityData = d3.contourDensity()
          .x((d: any) => d.projected![0])
          .y((d: any) => d.projected![1])
          .size([width, height])
          .bandwidth(20)
          .thresholds(10)
          (visibleDots as any);

        const colorScale = d3.scaleSequential(d3.interpolateInferno)
          .domain([0, d3.max(densityData, (d: any) => d.value) || 0]);

        heatmapGroup.selectAll("path")
          .data(densityData)
          .enter().append("path")
          .attr("d", d3.geoPath())
          .attr("fill", (d: any) => colorScale(d.value))
          .attr("fill-opacity", 0.3)
          .attr("stroke", "none")
          .style("pointer-events", "none");
      }

      // Markers
      const markers = markersGroup.selectAll("g.marker")
        .data(visibleDots, (d: any) => d.id);

      markers.exit().remove();

      const markersEnter = markers.enter().append("g")
        .attr("class", "marker cursor-pointer")
        .on("click", (event, d) => {
          if (!isDraggingRef.current) {
            event.stopPropagation();
            triggerImpact('light');
            // Use ref to get latest callback
            propsRef.current.onStoryClick(d);
          }
        });

      if (!showHeatmap) {
        markersEnter.append("circle")
          .attr("r", 5)
          .attr("class", "pulse-circle pointer-events-none");
        markersEnter.append("circle")
          .attr("r", 3)
          .attr("class", "core-circle")
          .attr("stroke", "white")
          .attr("stroke-width", 1);
      } else {
        markersEnter.append("circle")
          .attr("r", 1.5)
          .attr("fill", "white")
          .attr("fill-opacity", 0.5);
      }

      const markersUpdate = markers.merge(markersEnter as any)
        .attr("transform", d => `translate(${d.projected![0]}, ${d.projected![1]})`);

      if (!showHeatmap) {
        markersUpdate.select(".pulse-circle")
          .attr("fill", d => CATEGORY_COLORS[d.category])
          .attr("r", d => (selectedStory?.id === d.id ? 15 : 5))
          .attr("opacity", d => (selectedStory?.id === d.id ? 0.5 : 1))
          .attr("class", d => {
            const isSelected = selectedStory?.id === d.id;
            const isNew = d.createdAt && (Date.now() - new Date(d.createdAt).getTime() < 24 * 60 * 60 * 1000);
            return `pulse-circle pointer-events-none ${isSelected || isNew ? 'pin-glow' : ''}`;
          });

        markersUpdate.select(".core-circle")
          .attr("fill", d => CATEGORY_COLORS[d.category])
          .attr("r", d => (selectedStory?.id === d.id ? 6 : 3));
      }

      // Labels
      labelsGroup.selectAll("*").remove();
      if (hoveredCountryRef.current) {
        const center = d3.geoCentroid(hoveredCountryRef.current);
        const dist = d3.geoDistance(center, projection.invert!([width / 2, height / 2])!);

        if (dist < 1.57) {
          const centroid = pathGenerator.centroid(hoveredCountryRef.current);
          if (centroid[0] && centroid[1]) {
            const labelGroup = labelsGroup.append("g")
              .attr("transform", `translate(${centroid[0]}, ${centroid[1]})`)
              .style("pointer-events", "none");

            const text = hoveredCountryRef.current.properties.name;
            const approxWidth = text.length * 8 + 20;

            labelGroup.append("rect")
              .attr("x", -approxWidth / 2)
              .attr("y", -15)
              .attr("width", approxWidth)
              .attr("height", 30)
              .attr("rx", 15)
              .attr("fill", "#0f172a")
              .attr("fill-opacity", 0.8)
              .attr("stroke", "#38bdf8")
              .attr("stroke-width", 1);

            labelGroup.append("text")
              .text(text)
              .attr("text-anchor", "middle")
              .attr("dy", "0.35em")
              .attr("fill", "#ffffff")
              .attr("font-size", "14px")
              .attr("font-weight", "bold")
              .style("text-shadow", "0 2px 4px rgba(0,0,0,0.5)");
          }
        }
      }
    });

    // Drag Behavior
    const drag = d3.drag()
      .on("start", (event) => {
        velocityRef.current = [0, 0];
        lastPosRef.current = [event.x, event.y];
        startPosRef.current = [event.x, event.y];
        targetRotationRef.current = null;
        triggerImpact('light');
        requestGyroPermission();
      })
      .on("drag", (event) => {
        if (!lastPosRef.current || !startPosRef.current) return;
        const dx = event.x - lastPosRef.current[0];
        const dy = event.y - lastPosRef.current[1];
        const totalDx = event.x - startPosRef.current[0];
        const totalDy = event.y - startPosRef.current[1];
        const dist = Math.sqrt(totalDx * totalDx + totalDy * totalDy);

        if (!isDraggingRef.current && dist > 6) {
          isDraggingRef.current = true;
        }

        if (isDraggingRef.current) {
          const sensitivity = 0.25;
          rotationRef.current[0] += dx * sensitivity;
          rotationRef.current[1] -= dy * sensitivity;
          velocityRef.current = [dx * sensitivity, -dy * sensitivity];
        }
        lastPosRef.current = [event.x, event.y];
      })
      .on("end", () => {
        lastPosRef.current = null;
        startPosRef.current = null;
        setTimeout(() => { isDraggingRef.current = false; }, 50);
      });

    svg.call(drag as any);

    return () => {
      timer.stop();
      svg.on(".drag", null);
    };

  }, [worldData]); // Only re-run if worldData changes (basically once)

  // Zoom Handlers
  const handleZoom = useCallback((delta: number) => {
    scaleRef.current = Math.max(100, Math.min(2000, scaleRef.current + delta));
    triggerImpact('light');
  }, [triggerImpact]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="w-full h-full block touch-none cursor-move"
        style={{ touchAction: 'none' }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-28 right-4 flex flex-col gap-2 z-20 pointer-events-auto">
        <button
          onClick={() => handleZoom(50)}
          className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
          aria-label="Zoom In"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => handleZoom(-50)}
          className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
          aria-label="Zoom Out"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Globe;
