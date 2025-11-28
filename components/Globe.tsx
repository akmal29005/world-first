import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Story, Category } from '../types';

interface GlobeProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
  onMapClick: (lat: number, lng: number, country?: string) => void;
  isAddingMode: boolean;
}

const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FIRST_HEARTBREAK]: '#ef4444', // Red
  [Category.FIRST_JOB]: '#eab308', // Yellow
  [Category.FIRST_OCEAN]: '#0ea5e9', // Blue
  [Category.FIRST_TRAVEL]: '#22c55e', // Green
  [Category.FIRST_HOME]: '#f97316', // Orange
  [Category.FIRST_LOSS]: '#94a3b8', // Gray
  [Category.FIRST_ACHIEVEMENT]: '#facc15', // Yellow-400
  [Category.OTHER]: '#cbd5e1', // Slate-300
};

const ANIMATION_STYLES = `
  @keyframes pin-pulse {
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(2.5); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
  }
  .pin-glow {
    animation: pin-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
`;

const Globe: React.FC<GlobeProps> = ({ stories, onStoryClick, onMapClick, isAddingMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Data State (Keep in React state as it changes infrequently)
  const [worldData, setWorldData] = useState<any>(null);
  const [countryNames, setCountryNames] = useState<Map<string, string>>(new Map());

  // Animation State (Refs for performance - NO RE-RENDERS on drag)
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const zoomLevelRef = useRef<number>(1);
  const projectionRef = useRef(d3.geoOrthographic());

  // Interaction Refs
  const isDraggingRef = useRef(false);
  const isPressingRef = useRef(false); // Track mouse down state
  const isAddingModeRef = useRef(isAddingMode);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const momentumTimerRef = useRef<d3.Timer | null>(null);
  const velocityRef = useRef<{ x: number, y: number, time: number }>({ x: 0, y: 0, time: 0 });
  const lastDrawTimeRef = useRef<number>(0);

  // Hover State (React state is fine here as it only updates when hovering NEW country)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

  // Sync isAddingMode ref
  useEffect(() => {
    isAddingModeRef.current = isAddingMode;
  }, [isAddingMode]);

  // Load TopoJSON and Country Names
  useEffect(() => {
    Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json()),
      fetch('https://unpkg.com/world-atlas@1.1.4/world/110m.tsv').then(r => r.text())
    ]).then(([topology, tsvText]) => {
      const countries = feature(topology, topology.objects.countries);
      setWorldData(countries);

      const tsv = d3.tsvParse(tsvText);
      const names = new Map(tsv.map((d: any) => [d.iso_n3, d.name]));
      setCountryNames(names);
    })
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  // Core Draw Function - Reads from Refs
  const drawGlobe = useCallback(() => {
    if (!svgRef.current || !wrapperRef.current || !worldData) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;
    const baseScale = Math.min(width, height) / 2.5;

    // Update projection from Refs
    const projection = projectionRef.current
      .scale(baseScale * zoomLevelRef.current)
      .center([0, 0])
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current);

    const pathGenerator = d3.geoPath().projection(projection);
    const svg = d3.select(svgRef.current);

    // --- 1. Background ---
    // Check if background exists, if not create it
    let bg = svg.select(".globe-bg");
    if (bg.empty()) {
      bg = svg.append("circle")
        .attr("class", "globe-bg")
        .attr("fill", "#0f172a")
        .attr("stroke", "#1e293b")
        .attr("stroke-width", 2);
    }
    bg.attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projection.scale());

    // --- 2. Countries ---
    let countriesGroup = svg.select<SVGGElement>(".countries-group");
    if (countriesGroup.empty()) {
      countriesGroup = svg.append("g").attr("class", "countries-group");
    }

    // Join data
    const paths = countriesGroup.selectAll("path")
      .data(worldData.features);

    // Enter
    paths.enter().append("path")
      .attr("class", "country-path transition-colors duration-150 ease-out")
      .attr("stroke-width", 0.5)
      .merge(paths as any) // Update
      .attr("d", pathGenerator as any)
      .attr("fill", function (this: any, d: any) {
        // Optimization: Read hover state directly if needed, or rely on React effect for styling
        // For pure performance, we keep styling in the separate effect, 
        // but we need to ensure 'd' attribute is updated for rotation.
        return "#1e293b";
      })
      .attr("stroke", "#334155");

    paths.exit().remove();

    // --- 3. Graticules ---
    let graticulePath = svg.select(".graticule");
    if (graticulePath.empty()) {
      graticulePath = svg.append("path")
        .attr("class", "graticule")
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.05)");
    }
    const graticule = d3.geoGraticule();
    graticulePath.datum(graticule()).attr("d", pathGenerator);

    // --- 4. Markers ---
    // Calculate visibility
    const visibleDots = stories.map(story => {
      const coords: [number, number] = [story.lng, story.lat];
      const projected = projection(coords);
      const center = projection.invert!([width / 2, height / 2]);
      const d = d3.geoDistance(coords, center as [number, number]);
      const isVisible = d < 1.57; // ~90 degrees
      return { ...story, projected, isVisible };
    }).filter(s => s.isVisible && s.projected);

    let markersGroup = svg.select(".markers-group");
    if (markersGroup.empty()) {
      markersGroup = svg.append("g").attr("class", "markers-group");
    }

    const markers = markersGroup.selectAll("g.marker")
      .data(visibleDots, (d: any) => d.id);

    const markersEnter = markers.enter().append("g")
      .attr("class", "marker cursor-pointer")
      .on("click", (event, d) => {
        if (!isDraggingRef.current) {
          event.stopPropagation();
          onStoryClick(d);
        }
      });

    markersEnter.append("circle")
      .attr("r", 5)
      .attr("class", "pin-glow pointer-events-none");

    markersEnter.append("circle")
      .attr("r", 3)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 0 4px rgba(255,255,255,0.5))");

    // Update positions
    markers.merge(markersEnter as any)
      .attr("transform", d => `translate(${d.projected![0]}, ${d.projected![1]})`);

    // Update colors (in case category changes or new stories)
    markers.merge(markersEnter as any).select(".pin-glow")
      .attr("fill", d => CATEGORY_COLORS[d.category]);

    markers.merge(markersEnter as any).select("circle:not(.pin-glow)")
      .attr("fill", d => CATEGORY_COLORS[d.category]);

    markers.exit().remove();

  }, [worldData, stories, onStoryClick]); // Dependencies that require a full redraw structure

  // Setup Interactions (Drag & Zoom)
  useEffect(() => {
    if (!svgRef.current || !worldData) return;

    const svg = d3.select(svgRef.current);

    // Initial Draw
    drawGlobe();

    // Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        zoomLevelRef.current = event.transform.k;
        drawGlobe(); // Direct draw
      })
      .filter((event) => {
        return event.type === 'wheel';
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Drag Behavior
    const drag = d3.drag<SVGSVGElement, unknown>()
      .subject(() => ({ x: 0, y: 0 }))
      .on("start", () => {
        isDraggingRef.current = false;
        isPressingRef.current = true;
        if (momentumTimerRef.current) {
          momentumTimerRef.current.stop();
          momentumTimerRef.current = null;
        }
        velocityRef.current = { x: 0, y: 0, time: Date.now() };
        if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
      })
      .on("drag", (event) => {
        if (Math.abs(event.dx) > 1 || Math.abs(event.dy) > 1) {
          isDraggingRef.current = true;
        }

        const rotate = rotationRef.current;
        const k = 75 / projectionRef.current.scale();

        // Calculate Velocity
        const now = Date.now();
        const dt = now - velocityRef.current.time;
        if (dt > 0) {
          velocityRef.current = { x: event.dx, y: event.dy, time: now };
        }

        const nextRotation: [number, number, number] = [
          rotate[0] + event.dx * k,
          rotate[1] - event.dy * k,
          rotate[2]
        ];

        rotationRef.current = nextRotation;
        drawGlobe(); // Direct draw
      })
      .on("end", () => {
        isPressingRef.current = false;
        if (wrapperRef.current) {
          wrapperRef.current.style.cursor = isAddingModeRef.current ? "crosshair" : "grab";
        }

        // Momentum Logic
        if (isDraggingRef.current) {
          const { x, y } = velocityRef.current;
          const v = Math.sqrt(x * x + y * y);

          if (v > 2) {
            const friction = 0.95;
            let vx = x;
            let vy = y;

            momentumTimerRef.current = d3.timer(() => {
              vx *= friction;
              vy *= friction;

              if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
                if (momentumTimerRef.current) momentumTimerRef.current.stop();
                return;
              }

              const k = 75 / projectionRef.current.scale();
              const rotate = rotationRef.current;
              const nextRotation: [number, number, number] = [
                rotate[0] + vx * k,
                rotate[1] - vy * k,
                rotate[2]
              ];

              rotationRef.current = nextRotation;
              drawGlobe(); // Direct draw
            });
          }
        }
      });

    svg.call(drag);
    svg.on("dblclick.zoom", null);

    // Hover Logic (Optimized)
    svg.on("mousemove", (event) => {
      // Skip if dragging or pressing (performance)
      if (isDraggingRef.current || isPressingRef.current) return;

      // Throttle hover checks (every 50ms)
      const now = Date.now();
      if (now - lastDrawTimeRef.current < 50) return;
      lastDrawTimeRef.current = now;

      const [x, y] = d3.pointer(event);
      const coords = projectionRef.current.invert!([x, y]);

      setHoverPos({ x: event.clientX, y: event.clientY });

      if (!coords) {
        if (hoveredCountry) setHoveredCountry(null);
        return;
      }

      const found = worldData.features.find((feature: any) => {
        return d3.geoContains(feature, coords);
      });

      if (found) {
        const name = countryNames.get(found.id);
        // Only update state if changed
        setHoveredCountry(prev => (prev !== name ? (name || null) : prev));
      } else {
        setHoveredCountry(prev => (prev ? null : prev));
      }
    });

    svg.on("mouseleave", () => {
      setHoveredCountry(null);
    });

    // Click Handler
    svg.on("click", (event) => {
      if (isDraggingRef.current) return;

      if (isAddingModeRef.current) {
        const [x, y] = d3.pointer(event);
        const coords = projectionRef.current.invert!([x, y]);
        if (coords) {
          const found = worldData.features.find((feature: any) => {
            return d3.geoContains(feature, coords);
          });
          const clickedCountry = found ? countryNames.get(found.id) : undefined;
          onMapClick(coords[1], coords[0], clickedCountry);
        }
      }
    });

    return () => {
      svg.on(".drag", null);
      svg.on(".zoom", null);
      if (momentumTimerRef.current) momentumTimerRef.current.stop();
    };
  }, [worldData, drawGlobe, countryNames]); // Re-bind if data changes

  // Separate Effect for Hover Styling (Performance Optimization)
  // This runs when hoveredCountry changes, but doesn't redraw the whole globe geometry
  useEffect(() => {
    if (!svgRef.current || !worldData) return;
    const svg = d3.select(svgRef.current);

    svg.selectAll(".country-path")
      .attr("fill", function (this: any, d: any) {
        const name = countryNames.get(d.id);
        return name === hoveredCountry ? "#334155" : "#1e293b";
      })
      .attr("stroke", function (this: any, d: any) {
        const name = countryNames.get(d.id);
        return name === hoveredCountry ? "#60a5fa" : "#334155";
      })
      .attr("stroke-width", function (this: any, d: any) {
        const name = countryNames.get(d.id);
        return name === hoveredCountry ? 1 : 0.5;
      });

  }, [hoveredCountry, countryNames, worldData]);

  // Manual Zoom Handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition().duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition().duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.66);
    }
  };

  return (
    <div ref={wrapperRef} className={`w-full h-full relative ${isAddingMode ? 'cursor-crosshair' : 'cursor-grab'}`}>
      <style>{ANIMATION_STYLES}</style>
      <svg ref={svgRef} width="100%" height="100%" className="touch-none block" />

      {!worldData && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          Loading Map Data...
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-slate-800/80 backdrop-blur text-white rounded-full border border-gray-600 flex items-center justify-center hover:bg-slate-700 hover:border-neon-blue transition-all shadow-lg active:scale-95"
          aria-label="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-slate-800/80 backdrop-blur text-white rounded-full border border-gray-600 flex items-center justify-center hover:bg-slate-700 hover:border-neon-blue transition-all shadow-lg active:scale-95"
          aria-label="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Floating Neon Tooltip */}
      {hoveredCountry && hoverPos && !isDraggingRef.current && !isPressingRef.current && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center transition-opacity duration-200"
          style={{
            left: hoverPos.x,
            top: hoverPos.y,
            transform: 'translate(-50%, -150%)'
          }}
        >
          <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-neon-blue shadow-[0_0_15px_rgba(14,165,233,0.4)]">
            <span className="text-neon-blue font-bold text-sm uppercase tracking-widest whitespace-nowrap drop-shadow-[0_0_5px_rgba(14,165,233,0.8)]">
              {hoveredCountry}
            </span>
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-neon-blue mt-[-1px] filter drop-shadow-[0_0_5px_rgba(14,165,233,0.4)]"></div>
        </div>
      )}
    </div>
  );
};

export default Globe;