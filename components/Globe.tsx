import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Story, Category, CATEGORY_COLORS } from '../types';

interface GlobeProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
  onMapClick: (lat: number, lng: number, country?: string) => void;
  isAddingMode: boolean;
  showHeatmap?: boolean;
}

const Globe: React.FC<GlobeProps> = ({ stories, onStoryClick, onMapClick, isAddingMode, showHeatmap = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<[number, number] | null>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // Load TopoJSON data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        setWorldData(topojson.feature(topology, topology.objects.countries));
      });
  }, []);

  // D3 Render Logic
  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Projection
    const projection = d3.geoOrthographic()
      .scale(Math.min(width, height) / 2.5)
      .translate([width / 2, height / 2])
      .rotate([rotation[0], rotation[1], 0]);

    const pathGenerator = d3.geoPath().projection(projection);

    // --- 1. Water (Ocean) ---
    svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projection.scale())
      .attr("fill", "#0f172a")
      .attr("class", "cursor-move")
      .on("click", (event) => {
        if (!isDraggingRef.current && isAddingMode) {
          const [x, y] = d3.pointer(event);
          const coords = projection.invert!([x, y]);
          if (coords) onMapClick(coords[1], coords[0]);
        }
      });

    // --- 2. Day/Night Cycle (Solar Terminator) ---
    const now = new Date();
    const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const sunLon = -(hours - 12) * 15;
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const sunLat = 23.5 * Math.sin(2 * Math.PI * (dayOfYear - 80) / 365);
    const nightCenter: [number, number] = [sunLon + 180, -sunLat];
    const nightCircle = d3.geoCircle().center(nightCenter).radius(90);

    let nightGroup = svg.select(".night-group");
    if (nightGroup.empty()) {
      nightGroup = svg.append("g").attr("class", "night-group");
    }
    nightGroup.raise();

    const nightPath = nightGroup.selectAll("path")
      .data([nightCircle()]);

    nightPath.enter().append("path")
      .merge(nightPath as any)
      .attr("d", pathGenerator as any)
      .attr("fill", "#272323ed")
      .attr("fill-opacity", 0.4)
      .attr("pointer-events", "none");

    // --- 3. Land ---
    const landGroup = svg.append("g");

    landGroup.selectAll("path")
      .data((worldData as any).features)
      .enter().append("path")
      .attr("d", pathGenerator as any)
      .attr("fill", "#1e293b")
      .attr("stroke", "#334155")
      .attr("stroke-width", 0.5)
      .attr("class", isAddingMode ? "cursor-crosshair hover:fill-slate-600 transition-colors" : "cursor-move")
      .on("click", (event, d: any) => {
        if (!isDraggingRef.current && isAddingMode) {
          const [x, y] = d3.pointer(event);
          const coords = projection.invert!([x, y]);
          if (coords) onMapClick(coords[1], coords[0], d.properties.name);
        }
      });

    // --- 4. Constellations ---
    const visibleDots = stories.map(story => {
      const projected = projection([story.lng, story.lat]);
      const isVisible = projected && d3.geoDistance([story.lng, story.lat], projection.invert!([width / 2, height / 2])!) < 1.57;
      return { ...story, projected, isVisible };
    }).filter(d => d.isVisible && d.projected);

    const constellationsGroup = svg.append("g").attr("class", "constellations-group");

    const storiesByCategory: { [key: string]: typeof visibleDots } = {};
    visibleDots.forEach(d => {
      if (!storiesByCategory[d.category]) storiesByCategory[d.category] = [];
      storiesByCategory[d.category].push(d);
    });

    Object.entries(storiesByCategory).forEach(([category, dots]) => {
      if (dots.length > 1) {
        const lineGenerator = d3.line()
          .x((d: any) => d.projected[0])
          .y((d: any) => d.projected[1])
          .curve(d3.curveLinear);

        const pathData = lineGenerator(dots as any);

        if (pathData) {
          constellationsGroup.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", CATEGORY_COLORS[category as Category] || "#ffffff")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.3)
            .attr("stroke-dasharray", "2,4")
            .style("pointer-events", "none");
        }
      }
    });

    if (!constellationsGroup.empty()) {
      constellationsGroup.raise();
    }

    // --- 5. Heatmap (Optional) ---
    let heatmapGroup = svg.select(".heatmap-group");
    if (showHeatmap) {
      if (heatmapGroup.empty()) {
        heatmapGroup = svg.append("g").attr("class", "heatmap-group");
      }
      heatmapGroup.raise();

      const densityData = d3.contourDensity()
        .x((d: any) => d.projected[0])
        .y((d: any) => d.projected[1])
        .size([width, height])
        .bandwidth(20)
        .thresholds(10)
        (visibleDots as any);

      const colorScale = d3.scaleSequential(d3.interpolateInferno)
        .domain([0, d3.max(densityData, (d: any) => d.value) || 0]);

      const heatmapPaths = heatmapGroup.selectAll("path")
        .data(densityData);

      heatmapPaths.enter().append("path")
        .merge(heatmapPaths as any)
        .attr("d", d3.geoPath())
        .attr("fill", (d: any) => colorScale(d.value))
        .attr("fill-opacity", 0.3)
        .attr("stroke", "none")
        .style("pointer-events", "none");

      heatmapPaths.exit().remove();

    } else {
      if (!heatmapGroup.empty()) {
        heatmapGroup.remove();
      }
    }

    // --- 6. Markers ---
    let markersGroup = svg.select(".markers-group");
    if (markersGroup.empty()) {
      markersGroup = svg.append("g").attr("class", "markers-group");
    }
    markersGroup.raise();

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

    // Clear existing marker elements before re-appending based on showHeatmap
    markers.merge(markersEnter as any).selectAll("*").remove();

    if (!showHeatmap) {
      markersEnter.append("circle")
        .attr("r", 5)
        .attr("class", "pulse-circle pointer-events-none");

      markersEnter.append("circle")
        .attr("r", 3)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0 0 4px rgba(255,255,255,0.5))");
    } else {
      markersEnter.append("circle")
        .attr("r", 1.5)
        .attr("fill", "white")
        .attr("fill-opacity", 0.5);
    }

    markers.merge(markersEnter as any)
      .attr("transform", d => `translate(${d.projected![0]}, ${d.projected![1]})`);

    if (!showHeatmap) {
      const markersUpdate = markers.merge(markersEnter as any);

      markersUpdate.select(".pulse-circle")
        .attr("fill", d => CATEGORY_COLORS[d.category])
        .attr("class", d => {
          const isNew = d.createdAt && (Date.now() - new Date(d.createdAt).getTime() < 24 * 60 * 60 * 1000);
          return `pulse-circle pointer-events-none ${isNew ? 'pin-glow' : 'opacity-0'}`;
        });

      markersUpdate.select("circle:not(.pulse-circle)")
        .attr("fill", d => CATEGORY_COLORS[d.category]);
    }

    markers.exit().remove();

  }, [worldData, stories, onStoryClick, rotation, isAddingMode, showHeatmap]);

  // Setup Interactions (Drag & Zoom)
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const drag = d3.drag()
      .on("start", (event) => {
        isDraggingRef.current = false;
        lastPosRef.current = [event.x, event.y];
      })
      .on("drag", (event) => {
        if (!lastPosRef.current) return;
        const dx = event.x - lastPosRef.current[0];
        const dy = event.y - lastPosRef.current[1];

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          isDraggingRef.current = true;
        }

        const sensitivity = 0.25;
        setRotation(prev => [prev[0] + dx * sensitivity, prev[1] - dy * sensitivity]);
        lastPosRef.current = [event.x, event.y];
      })
      .on("end", () => {
        lastPosRef.current = null;
        // Reset dragging flag after a short delay to prevent click triggering
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 50);
      });

    svg.call(drag as any);

    return () => {
      svg.on(".drag", null);
    };
  }, []);

  // Handlers for manual event binding if needed (mostly handled by d3.drag)
  const handleMouseDown = () => { };
  const handleMouseMove = () => { };
  const handleMouseUp = () => { };
  const handleTouchStart = () => { };
  const handleTouchMove = () => { };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full block"
    />
  );
};

export default Globe;