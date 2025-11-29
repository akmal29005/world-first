import React, { useState, useEffect, useMemo } from 'react';
import { Story, Category, CATEGORY_COLORS } from '../types';

interface AdminDashboardProps {
    onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await fetch('/api/stories');
            if (res.ok) {
                const data = await res.json();
                // Fix: Map created_at to createdAt for frontend consistency
                const mappedStories = data.map((s: any) => ({
                    ...s,
                    createdAt: s.created_at || s.createdAt // Handle both cases
                }));

                // Sort by date desc
                const sorted = mappedStories.sort((a: Story, b: Story) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                setStories(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch stories', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this story? This cannot be undone.')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/stories?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setStories(prev => prev.filter(s => s.id !== id));
            } else {
                alert('Failed to delete story');
            }
        } catch (error) {
            console.error('Error deleting story', error);
            alert('Error deleting story');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredStories = useMemo(() => {
        return stories.filter(story => {
            const matchesSearch =
                story.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (story.city && story.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (story.country && story.country.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = filterCategory === 'ALL' || story.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [stories, searchQuery, filterCategory]);

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-hidden flex flex-col font-sans">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Admin Dashboard
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {filteredStories.length} stories found
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search stories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 md:w-64 bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 transition-colors text-sm font-medium"
                    >
                        Exit
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStories.map(story => (
                            <div
                                key={story.id}
                                className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Header: Category & Date */}
                                <div className="flex justify-between items-start mb-3">
                                    <span
                                        className="px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border"
                                        style={{
                                            color: CATEGORY_COLORS[story.category],
                                            borderColor: `${CATEGORY_COLORS[story.category]}33`, // 20% opacity
                                            backgroundColor: `${CATEGORY_COLORS[story.category]}1A` // 10% opacity
                                        }}
                                    >
                                        {story.category.replace('FIRST_', '')}
                                    </span>
                                    <span className="text-gray-500 text-xs font-mono">
                                        {story.createdAt ? new Date(story.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'Unknown Date'}
                                    </span>
                                </div>

                                {/* Story Text */}
                                <p className="text-gray-200 text-sm leading-relaxed mb-4 flex-grow font-light">
                                    "{story.text}"
                                </p>

                                {/* Footer: Location & Actions */}
                                <div className="pt-4 border-t border-white/5 flex flex-col gap-3 mt-auto">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <span className="text-purple-400">📍</span>
                                                {story.city ? `${story.city}, ` : ''}{story.country || 'Unknown'}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-0.5 ml-4">
                                                Year: {story.year}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(story.id)}
                                            disabled={deletingId === story.id}
                                            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-xs font-medium disabled:opacity-50"
                                        >
                                            {deletingId === story.id ? '...' : 'Delete'}
                                        </button>
                                    </div>

                                    {/* Reaction Stats */}
                                    <div className="flex gap-3 text-xs text-gray-500 bg-black/20 p-2 rounded-lg">
                                        <span className="flex items-center gap-1" title="Hearts">
                                            ❤️ {story.reaction_heart || 0}
                                        </span>
                                        <span className="flex items-center gap-1" title="Me Too">
                                            🥺 {story.reaction_metoo || 0}
                                        </span>
                                        <span className="flex items-center gap-1" title="Hugs">
                                            🫂 {story.reaction_hug || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
