import React, { useState, useRef, useEffect } from 'react';
import { Story, Category, CATEGORY_ICONS } from '../types';

interface StoryCardProps {
  story: Story | null;
  onClose: () => void;
  onReact?: (storyId: string, reaction: string) => void;
}

const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FIRST_HEARTBREAK]: 'text-red-500 border-red-500',
  [Category.FIRST_JOB]: 'text-neon-yellow border-neon-yellow',
  [Category.FIRST_OCEAN]: 'text-neon-blue border-neon-blue',
  [Category.FIRST_TRAVEL]: 'text-neon-green border-neon-green',
  [Category.FIRST_HOME]: 'text-orange-500 border-orange-500',
  [Category.FIRST_LOSS]: 'text-gray-400 border-gray-400',
  [Category.FIRST_ACHIEVEMENT]: 'text-yellow-400 border-yellow-400',
  [Category.OTHER]: 'text-gray-400 border-gray-400',
};

const REACTIONS = ['❤️', '🥺', '😊', '🔥'];

const StoryCard: React.FC<StoryCardProps> = ({ story, onClose, onReact }) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const startY = useRef(0);

  if (!story) return null;

  const locationString = [story.city, story.state, story.country]
    .filter(Boolean)
    .join(', ') || `${story.lat.toFixed(2)}, ${story.lng.toFixed(2)}`;

  // Touch handlers for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) { // Only allow downward drag
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) { // Threshold to close
      onClose();
    }
    setDragY(0);
  };

  // Share functionality
  const handleShare = () => {
    const url = `${window.location.origin}?story=${story.id}`;
    navigator.clipboard.writeText(url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Reaction handler
  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    if (onReact) {
      onReact(story.id, reaction);
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm w-full z-50 p-4 pointer-events-none">
      <div
        className="glass-panel rounded-xl p-6 shadow-2xl relative animate-[fadeIn_0.3s_ease-out] pointer-events-auto"
        style={{
          transform: `translateY(${dragY}px)`,
          opacity: 1 - (dragY / 300),
          transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Indicator (Mobile) */}
        <div className="md:hidden w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className={`text-xs font-bold uppercase tracking-wider mb-2 border-l-2 pl-2 flex items-center gap-1.5 ${CATEGORY_COLORS[story.category]}`}>
          <span>{CATEGORY_ICONS[story.category]}</span>
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

        <p className="text-lg text-starlight leading-relaxed font-serif mb-6">
          "{story.text}"
        </p>

        {/* Reactions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-2">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className={`text-2xl hover:scale-125 transition-transform ${selectedReaction === reaction ? 'scale-125' : ''
                  }`}
                title={`React with ${reaction}`}
              >
                {reaction}
              </button>
            ))}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-all"
            title="Share story"
          >
            {showCopied ? (
              <>✓ Copied</>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </>
            )}
          </button>
        </div>

        {/* Reaction count display */}
        {story.reactionCount && story.reactionCount > 0 && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            {story.reactionCount} {story.reactionCount === 1 ? 'reaction' : 'reactions'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard;