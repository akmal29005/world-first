import React from 'react';

// Loading skeleton for globe
export const GlobeLoader: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
            {/* Spinning globe skeleton */}
            <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border-4 border-slate-800 border-t-neon-blue animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-sm animate-pulse">Loading globe...</p>
                </div>
            </div>
        </div>
    </div>
);

// Empty state when no stories match
interface EmptyStateProps {
    hasFilters: boolean;
    onReset: () => void;
    onAddStory: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, onReset, onAddStory }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-6 max-w-md pointer-events-auto">
            <div className="mb-6">
                {/* Animated empty icon */}
                <div className="inline-block text-6xl animate-bounce opacity-50">🌍</div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
                {hasFilters ? 'No Stories Found' : 'Be the First!'}
            </h3>
            <p className="text-gray-400 mb-6">
                {hasFilters
                    ? "No stories match your current filters. Try adjusting your search or explore all stories."
                    : "This globe is waiting for its first story. Share a meaningful moment from your life."
                }
            </p>
            <div className="flex gap-3 justify-center">
                {hasFilters && (
                    <button
                        onClick={onReset}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all border border-white/10"
                    >
                        Clear Filters
                    </button>
                )}
                <button
                    onClick={onAddStory}
                    className="px-6 py-3 bg-white hover:bg-gray-200 text-slate-900 rounded-lg font-semibold transition-all shadow-lg"
                >
                    Add Your Story
                </button>
            </div>
        </div>
    </div>
);

// Shimmer effect for loading stories
export const StoryListLoader: React.FC = () => (
    <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-full"></div>
            </div>
        ))}
    </div>
);
