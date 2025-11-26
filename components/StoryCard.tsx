import React from 'react';
import { Story, Category } from '../types';

interface StoryCardProps {
  story: Story | null;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FIRST_HEARTBREAK]: 'text-red-500 border-red-500',
  [Category.FIRST_JOB]: 'text-neon-yellow border-neon-yellow',
  [Category.FIRST_OCEAN]: 'text-neon-blue border-neon-blue',
  [Category.FIRST_TRAVEL]: 'text-neon-green border-neon-green',
  [Category.OTHER]: 'text-gray-400 border-gray-400',
};

const StoryCard: React.FC<StoryCardProps> = ({ story, onClose }) => {
  if (!story) return null;

  const locationString = [story.city, story.state, story.country]
    .filter(Boolean)
    .join(', ') || `${story.lat.toFixed(2)}, ${story.lng.toFixed(2)}`;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm w-full z-50 p-4">
      <div className="glass-panel rounded-xl p-6 shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <div className={`text-xs font-bold uppercase tracking-wider mb-2 border-l-2 pl-2 ${CATEGORY_COLORS[story.category]}`}>
          {story.category}
        </div>
        
        <h3 className="text-3xl font-serif font-bold text-white mb-1">{story.year}</h3>
        <p className="text-gray-400 text-sm mb-4 italic flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {locationString}
        </p>
        
        <p className="text-lg text-starlight leading-relaxed font-serif">
          "{story.text}"
        </p>
      </div>
    </div>
  );
};

export default StoryCard;