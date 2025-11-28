import React, { useEffect, useRef, useState, useMemo } from 'react';
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

  // State
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [worldData, setWorldData] = useState<any>(null);
  const [countryNames, setCountryNames] = useState<Map<string, string>>(new Map());

  // Hover State
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

  // Refs for D3 interaction to avoid stale closures in event listeners
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const projectionRef = useRef(d3.geoOrthographic());
  const isDraggingRef = useRef(false);
  const isAddingModeRef = useRef(isAddingMode);

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

  // Setup Interactions (Drag & Zoom)
  useEffect(() => {
    if (!svgRef.current || !worldData) return;

    const svg = d3.select(svgRef.current);

    // Drag Behavior (Rotation)
    const drag = d3.drag<SVGSVGElement, unknown>()
      .subject(() => ({ x: 0, y: 0 }))
      .on("start", () => {
        isDraggingRef.current = false;
        if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
      })
      .on("drag", (event) => {
        // Threshold to differentiate click from drag
        if (Math.abs(event.dx) > 1 || Math.abs(event.dy) > 1) {
          isDraggingRef.current = true;
        }

        const rotate = rotationRef.current;
        // Rotation sensitivity adjusts with zoom scale to feel consistent
        const k = 75 / projectionRef.current.scale();

        const nextRotation: [number, number, number] = [
          rotate[0] + event.dx * k,
          rotate[1] - event.dy * k,
          rotate[2]
        ];

        rotationRef.current = nextRotation;
        setRotation(nextRotation);
      })
      .on("end", () => {
        if (wrapperRef.current) {
          wrapperRef.current.style.cursor = isAddingModeRef.current ? "crosshair" : "grab";
        }
      });

    // Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // Zoom levels: 1x to 8x
      .on("zoom", (event) => {
        setZoomLevel(event.transform.k);
      })
      .filter((event) => {
        // Allow wheel zoom, but prevent mousedown from hijacking drag
        // Also allow touchstart if needed, but keeping it simple for now
        return event.type === 'wheel';
      });

    svg.call(drag).call(zoom);

    // Disable double click to zoom (optional, often conflicts with rapid clicking)
    svg.on("dblclick.zoom", null);

    return () => {
      svg.on(".drag", null);
      svg.on(".zoom", null);
    };
  }, [worldData]); // Run once when world data loads

  // Render Globe (Draw Loop) - Geometry & Markers
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || !worldData) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;
    const baseScale = Math.min(width, height) / 2.5;

    // Update projection
    const projection = projectionRef.current
      .scale(baseScale * zoomLevel) // Apply zoom level
      .center([0, 0])
      .translate([width / 2, height / 2])
      .rotate(rotation);

    const pathGenerator = d3.geoPath().projection(projection);
    const svg = d3.select(svgRef.current);

    // Clear and Redraw
    svg.selectAll("*").remove();

    // 1. Draw Globe Background (Ocean)
    svg.append("circle")
      .attr("fill", "#0f172a")
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 2)
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projection.scale())
      .attr("class", "globe-bg");

    // 2. Draw Countries
    const countriesGroup = svg.append("g").attr("class", "countries-group");

    countriesGroup.selectAll("path")
      .data(worldData.features)
      .enter().append("path")
      .attr("d", pathGenerator as any)
      .attr("data-id", (d: any) => d.id) // Store ID for efficient selection later
      .attr("fill", "#1e293b") // Default fill
      .attr("stroke", "#334155") // Default stroke
      .attr("stroke-width", 0.5)
      .attr("class", "country-path transition-colors duration-150 ease-out");

    // 3. Graticules
    const graticule = d3.geoGraticule();
    svg.append("path")
      .datum(graticule())
      .attr("d", pathGenerator)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.05)");

    // 4. Calculate Visible Markers
    const visibleDots = stories.map(story => {
      const coords: [number, number] = [story.lng, story.lat];
      const projected = projection(coords);
      // Calculate visibility based on distance from center
      const center = projection.invert!([width / 2, height / 2]);
      const d = d3.geoDistance(coords, center as [number, number]);
      const isVisible = d < 1.57; // ~90 degrees

      return { ...story, projected, isVisible };
    }).filter(s => s.isVisible && s.projected);

    // 5. Draw Markers with Animation
    const markersGroup = svg.append("g");

    // Group for each marker to hold halo and core
    const markerNodes = markersGroup.selectAll("g")
      .data(visibleDots)
      .enter().append("g")
      .attr("transform", d => `translate(${d.projected![0]}, ${d.projected![1]})`)
      .attr("class", "cursor-pointer")
      .on("click", (event, d) => {
        if (!isDraggingRef.current) {
          event.stopPropagation();
          onStoryClick(d);
        }
      });

    // Pulsing Halo (Animation)
    markerNodes.append("circle")
      .attr("r", 5) // Base radius for halo
      .attr("fill", d => CATEGORY_COLORS[d.category])
      .attr("class", "pin-glow pointer-events-none")
      .style("will-change", "transform, opacity"); // Optimization hint

    // Solid Core
    markerNodes.append("circle")
      .attr("r", 3)
      .attr("fill", d => CATEGORY_COLORS[d.category])
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 0 4px rgba(255,255,255,0.5))");

    // 6. Interaction Overlay for Hover Logic
    svg.on("mousemove", (event) => {
      // Don't calculate hover during drag for performance
      if (isDraggingRef.current) return;

      const [x, y] = d3.pointer(event);
      const coords = projection.invert!([x, y]);

      setHoverPos({ x: event.clientX, y: event.clientY });

      if (!coords) {
        if (hoveredCountry) setHoveredCountry(null);
        return;
      }

      // Check which country contains the point
      const found = worldData.features.find((feature: any) => {
        return d3.geoContains(feature, coords);
      });

      if (found) {
        const name = countryNames.get(found.id);
        if (name !== hoveredCountry) setHoveredCountry(name || null);
      } else {
        if (hoveredCountry) setHoveredCountry(null);
      }
    });

    svg.on("mouseleave", () => {
      setHoveredCountry(null);
    });

    // Map Click Handler (Add Mode)
    svg.on("click", (event) => {
      if (isDraggingRef.current) return;

      if (isAddingMode) {
        const [x, y] = d3.pointer(event);
        const coords = projection.invert!([x, y]);
        if (coords) {
          const found = worldData.features.find((feature: any) => {
            return d3.geoContains(feature, coords);
          });
          const clickedCountry = found ? countryNames.get(found.id) : undefined;
          onMapClick(coords[1], coords[0], clickedCountry);
        }
      }
    });

  }, [worldData, rotation, zoomLevel, stories, isAddingMode, onStoryClick, onMapClick, countryNames]); // Removed hoveredCountry from deps

  // Separate Effect for Hover Styling (Performance Optimization)
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

  return (
    <div ref={wrapperRef} className={`w-full h-full relative ${isAddingMode ? 'cursor-crosshair' : 'cursor-grab'}`}>
      <style>{ANIMATION_STYLES}</style>
      <svg ref={svgRef} width="100%" height="100%" className="touch-none block" />

      {!worldData && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          Loading Map Data...
        </div>
      )}

      {/* Floating Neon Tooltip */}
      {hoveredCountry && hoverPos && !isDraggingRef.current && (
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