import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Story, Category, CATEGORY_ICONS } from '../types';
import ShareableCard from './ShareableCard';

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

const REACTIONS = [
  { emoji: '❤️', type: 'heart', label: 'Love' },
  { emoji: '🥺', type: 'metoo', label: 'Me Too' },
  { emoji: '🫂', type: 'hug', label: 'Hug' },
];

const StoryCard: React.FC<StoryCardProps> = ({ story, onClose, onReact }) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const startY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

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
  const handleCopyLink = () => {
    const url = `${window.location.origin}?story=${story.id}`;
    navigator.clipboard.writeText(url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (cardRef.current === null) return;
    setIsGenerating(true);

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = `story-${story.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reaction handler
  const handleReaction = (type: string) => {
    if (selectedReaction) return; // Prevent multiple reactions
    setSelectedReaction(type);
    if (onReact) {
      onReact(story.id, type);
    }
  };

  return (
    <>
      {/* Hidden Shareable Card for Generation */}
      <div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]">
        <ShareableCard ref={cardRef} story={story} />
      </div>

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
            <div className="flex gap-4">
              {REACTIONS.map(({ emoji, type, label }) => {
                // Get count from story object dynamically
                const count = (story as any)[`reaction_${type}`] || 0;

                return (
                  <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${selectedReaction === type ? 'scale-125 text-white' : 'text-gray-400 hover:text-white hover:scale-110'
                      }`}
                    title={label}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[10px] font-bold">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-all"
                title="Copy Link"
              >
                {showCopied ? (
                  <>✓</>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </button>

              {/* Download Image Button */}
              <button
                onClick={handleDownloadImage}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-all"
                title="Download Card"
              >
                {isGenerating ? (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoryCard;