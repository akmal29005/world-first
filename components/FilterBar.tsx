import React, { useState, useEffect } from 'react';
import { Category, CATEGORY_ICONS } from '../types';

interface FilterBarProps {
  selected: Category | 'ALL';
  onSelect: (cat: Category | 'ALL') => void;
  onAddClick: () => void;
  isAddingMode: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRandomStory: () => void;
  isTimeTravelOpen: boolean;
  onToggleTimeTravel: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  onHover: (cat: Category | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selected,
  onSelect,
  onAddClick,
  isAddingMode,
  searchQuery,
  onSearchChange,
  onRandomStory,
  isTimeTravelOpen,
  onToggleTimeTravel,
  showHeatmap,
  onToggleHeatmap,
  onHover
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* MOBILE: Hamburger Menu (< 768px) */}
      <div className="md:hidden absolute top-6 right-4 z-50 pointer-events-auto">
        {/* Tooltip - Only show when menu is closed and timer hasn't expired */}
        {!isMenuOpen && showTooltip && (
          <div className="absolute -bottom-10 right-0 bg-slate-900/95 text-gray-300 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap backdrop-blur-md border border-white/10 shadow-lg pointer-events-none animate-pulse">
            Click to add stories
          </div>
        )}

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 bg-slate-900/90 backdrop-blur-md rounded-full border border-white/10 shadow-lg hover:bg-slate-800 transition-all relative group"
          aria-label="Toggle menu to add stories and search"
          title="Click to add stories"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        <div className={`absolute top-16 right-0 w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 space-y-4 transition-all duration-300 ease-out origin-top-right ${isMenuOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}>
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400 group-focus-within:text-neon-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search stories..."
              className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-slate-800/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-slate-900 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-sm"
            />
          </div>

          {/* Filter Buttons */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold px-1">Filters</p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              <FilterButton
                active={selected === 'ALL'}
                onClick={() => { onSelect('ALL'); setIsMenuOpen(false); }}
                label="All"
              />
              {Object.values(Category).map((cat) => (
                <FilterButton
                  key={cat}
                  active={selected === cat}
                  onClick={() => { onSelect(cat); setIsMenuOpen(false); }}
                  label={cat.replace('First ', '')}
                  icon={CATEGORY_ICONS[cat]}
                  onMouseEnter={() => onHover(cat)}
                  onMouseLeave={() => onHover(null)}
                />
              ))}
            </div>
          </div>

          {/* Heatmap Toggle (Mobile) */}
          <button
            onClick={() => { onToggleHeatmap(); setIsMenuOpen(false); }}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                ${showHeatmap
                ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-white/10'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            {showHeatmap ? 'HIDE HEATMAP' : 'SHOW HEATMAP'}
          </button>

          {/* Time Travel Button (Mobile) */}
          <button
            onClick={() => { onToggleTimeTravel(); setIsMenuOpen(false); }}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                ${isTimeTravelOpen
                ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-white/10'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isTimeTravelOpen ? 'CLOSE TIME TRAVEL' : 'TIME TRAVEL'}
          </button>

          {/* Random Story Button (Mobile) */}
          <button
            onClick={() => { onRandomStory(); setIsMenuOpen(false); }}
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2 border border-white/10"
          >
            <span>🎲</span>
            RANDOM STORY
          </button>

          {/* Add Story Button */}
          <button
            onClick={() => { onAddClick(); setIsMenuOpen(false); }}
            className={`
                w-full px-6 py-3 rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg
                flex items-center justify-center gap-2
                ${isAddingMode
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                : 'bg-white text-slate-900 hover:bg-gray-200 shadow-white/20'
              }`}
          >
            {isAddingMode ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                CANCEL
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                ADD STORY
              </>
            )}
          </button>
        </div>
      </div>

      {/* TABLET/IPAD: Top Bar (768px - 1024px) */}
      <div className="hidden md:block lg:hidden absolute top-6 left-4 right-4 z-40 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex flex-col gap-3">
            {/* Top Row: Search + Buttons */}
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 group-focus-within:text-neon-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search stories..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-lg leading-5 bg-slate-800/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-slate-900 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-sm"
                />
              </div>

              {/* Heatmap Button (Tablet) */}
              <button
                onClick={onToggleHeatmap}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10
                  ${showHeatmap
                    ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'}`}
                title="Toggle Heatmap"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </button>

              {/* Time Travel Button (Tablet) */}
              <button
                onClick={onToggleTimeTravel}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10
                  ${isTimeTravelOpen
                    ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'}`}
                title="Time Travel"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              <button
                onClick={onAddClick}
                className={`
                  px-5 py-2.5 rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg whitespace-nowrap
                  flex items-center gap-2
                  ${isAddingMode
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                    : 'bg-white text-slate-900 hover:bg-gray-200 shadow-white/20'
                  }`}
              >
                {isAddingMode ? "CANCEL" : "ADD STORY"}
              </button>
            </div>

            {/* Bottom Row: Filters */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Filters:</span>
              <FilterButton
                active={selected === 'ALL'}
                onClick={() => onSelect('ALL')}
                label="All"
              />
              <div className="w-px bg-white/10 h-4"></div>
              {Object.values(Category).map((cat) => (
                <FilterButton
                  key={cat}
                  active={selected === cat}
                  onClick={() => onSelect(cat)}
                  label={cat.replace('First ', '')}
                  icon={CATEGORY_ICONS[cat]}
                  onMouseEnter={() => onHover(cat)}
                  onMouseLeave={() => onHover(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP: Bottom Bar (> 1024px) */}
      <div className="hidden lg:block absolute bottom-6 left-4 right-4 z-40 pointer-events-none">
        <div className="pointer-events-auto max-w-5xl mx-auto flex items-center bg-slate-900/80 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl gap-3">
          {/* Add Button */}
          <button
            onClick={onAddClick}
            className={`
              px-6 py-2 rounded-full font-bold text-sm tracking-widest transition-all duration-300 shadow-lg whitespace-nowrap
              flex items-center gap-2
              ${isAddingMode
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                : 'bg-white text-slate-900 hover:bg-gray-200 shadow-white/20'
              }`}
          >
            {isAddingMode ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                CANCEL
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                ADD STORY
              </>
            )}
          </button>

          {/* Heatmap Button (Desktop) */}
          <button
            onClick={onToggleHeatmap}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10
              ${showHeatmap
                ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'}`}
            title="Toggle Heatmap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </button>

          {/* Time Travel Button (Desktop) */}
          <button
            onClick={onToggleTimeTravel}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10
              ${isTimeTravelOpen
                ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'}`}
            title="Time Travel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400 group-focus-within:text-neon-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search stories..."
              className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-slate-800/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-slate-900 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-sm"
            />
          </div>

          {/* Filters - Scrollable */}
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide flex-nowrap max-w-md">
            <FilterButton
              active={selected === 'ALL'}
              onClick={() => onSelect('ALL')}
              label="All"
            />
            <div className="w-px bg-white/10 h-4 flex-shrink-0"></div>
            {Object.values(Category).map((cat) => (
              <FilterButton
                key={cat}
                active={selected === cat}
                onClick={() => onSelect(cat)}
                label={cat.replace('First ', '')}
                icon={CATEGORY_ICONS[cat]}
                onMouseEnter={() => onHover(cat)}
                onMouseLeave={() => onHover(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label, icon, onMouseEnter, onMouseLeave }) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border border-transparent flex items-center gap-1
      ${active
        ? 'bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border-white/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
  >
    {icon && <span className="text-sm">{icon}</span>}
    {label}
  </button>
);

export default FilterBar;