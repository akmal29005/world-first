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
  onOpenSettings: () => void;
  onOpenAbout: () => void;
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
  onHover,
  onOpenSettings,
  onOpenAbout
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

          {/* GitHub Button (Mobile) */}
          <a
            href="https://github.com/akmal29005"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2 border border-white/10"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GITHUB
          </a>

          {/* About Button (Mobile) */}
          <button
            onClick={() => { onOpenAbout(); setIsMenuOpen(false); }}
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2 border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ABOUT
          </button>

          {/* Settings Button (Mobile) */}
          <button
            onClick={() => { onOpenSettings(); setIsMenuOpen(false); }}
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg font-bold text-sm tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2 border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            SETTINGS
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