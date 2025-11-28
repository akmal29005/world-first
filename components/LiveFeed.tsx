import React, { useEffect, useState } from 'react';
import { Story, CATEGORY_ICONS } from '../types';

interface LiveFeedProps {
    stories: Story[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ stories }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Filter for recent stories (e.g., last 5 added)
    // Since we don't have real-time updates yet, we just take the first 5 from the list
    // assuming the list is sorted or just random for now.
    // Ideally, we'd sort by createdAt.
    const recentStories = stories
        .filter(s => s.createdAt)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 5);

    useEffect(() => {
        if (recentStories.length === 0) return;

        const interval = setInterval(() => {
            setIsVisible(false); // Fade out
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % recentStories.length);
                setIsVisible(true); // Fade in
            }, 500);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [recentStories.length]);

    if (recentStories.length === 0) return null;

    const currentStory = recentStories[currentIndex];

    return (
        <div className="absolute top-24 md:top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none w-full max-w-lg px-4">
            <div className={`
        bg-slate-900/80 backdrop-blur-md border border-neon-blue/30 rounded-full py-1.5 px-4 
        flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(14,165,233,0.2)]
        transition-opacity duration-500
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                <span className="text-xs font-mono text-neon-blue uppercase tracking-widest">LIVE</span>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <span className="text-lg">{CATEGORY_ICONS[currentStory.category]}</span>
                    <span className="text-xs md:text-sm text-gray-200 font-medium truncate max-w-[200px] md:max-w-xs">
                        {currentStory.city}, {currentStory.country}: "{currentStory.text}"
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LiveFeed;
