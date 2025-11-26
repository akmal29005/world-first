import React from 'react';
import { Category } from '../types';

interface FilterBarProps {
  selected: Category | 'ALL';
  onSelect: (cat: Category | 'ALL') => void;
  onAddClick: () => void;
  isAddingMode: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  selected, 
  onSelect, 
  onAddClick, 
  isAddingMode, 
  searchQuery, 
  onSearchChange 
}) => {
  return (
    <div className="absolute bottom-6 left-4 right-4 z-40 flex flex-col items-center pointer-events-none">
      
      {/* Container: Stacked on mobile, Row on desktop */}
      <div className="pointer-events-auto w-full max-w-5xl flex flex-col gap-3 md:flex-row md:items-center md:bg-slate-900/80 md:backdrop-blur-xl md:p-2 md:rounded-full md:border md:border-white/10 md:shadow-2xl transition-all">
        
        {/* 1. Add Button (Mobile: Top, Desktop: Left) */}
        <button
          onClick={onAddClick}
          className={`
            md:order-1 px-6 py-3 md:py-2 rounded-full font-bold text-sm tracking-widest transition-all duration-300 shadow-lg whitespace-nowrap
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

        {/* 2. Search Bar (Mobile: Middle, Desktop: Middle) */}
        <div className="md:order-2 flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400 group-focus-within:text-neon-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stories, cities, countries..."
            className="block w-full pl-10 pr-3 py-3 md:py-2 border border-white/10 rounded-full leading-5 bg-slate-900/90 md:bg-slate-800/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-slate-900 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue sm:text-sm backdrop-blur-md shadow-lg md:shadow-none transition-all"
          />
        </div>

        {/* 3. Filters (Mobile: Bottom, Desktop: Right) */}
        <div className="md:order-3 flex gap-2 overflow-x-auto pb-2 md:pb-0 pt-1 md:pt-0 max-w-full custom-scrollbar mask-linear-fade md:mask-none">
           {/* Mobile Background for Filters */}
           <div className="md:hidden absolute inset-0 bg-gradient-to-r from-slate-900/0 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>
           
           <div className="flex gap-2 px-1 md:px-0 bg-slate-900/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-2 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-none shadow-lg md:shadow-none">
              <FilterButton 
                active={selected === 'ALL'} 
                onClick={() => onSelect('ALL')} 
                label="All" 
              />
              <div className="w-px bg-white/10 mx-1 h-4 self-center hidden md:block"></div>
              {Object.values(Category).map((cat) => (
                <FilterButton 
                    key={cat}
                    active={selected === cat} 
                    onClick={() => onSelect(cat)} 
                    label={cat.replace('First ', '')} 
                />
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border border-transparent
      ${active 
        ? 'bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border-white/20' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
  >
    {label}
  </button>
);

export default FilterBar;