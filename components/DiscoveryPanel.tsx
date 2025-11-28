import React from 'react';
import { Story } from '../types';

interface DiscoveryPanelProps {
    stories: Story[];
    onRandomStory: () => void;
    showRecent: boolean;
    onToggleRecent: () => void;
}

const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({
    stories,
    onRandomStory,
    showRecent,
    onToggleRecent
}) => {
    // Calculate statistics
    const totalStories = stories.length;
    const countries = new Set(stories.map(s => s.country).filter(Boolean)).size;

    return (
        <div className="absolute top-24 right-4 z-40 pointer-events-none hidden lg:block">
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 w-64">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Discover</h3>

                {/* Statistics */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Total Stories</span>
                        <span className="text-white font-bold">{totalStories}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Countries</span>
                        <span className="text-white font-bold">{countries}</span>
                    </div>
                </div>

                {/* Random Story Button */}
                <button
                    onClick={onRandomStory}
                    disabled={totalStories === 0}
                    className="w-full px-4 py-3 bg-neon-blue hover:bg-neon-blue/80 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
                >
                    <span>🎲</span>
                    Random Story
                </button>

                {/* Recent Toggle */}
                <button
                    onClick={onToggleRecent}
                    className={`w-full px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-between ${showRecent
                        ? 'bg-white/20 text-white border border-white/20'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                        }`}
                >
                    <span>Show Recent</span>
                    <span>{showRecent ? '✓' : ''}</span>
                </button>
            </div>
        </div>
    );
};

export default DiscoveryPanel;
