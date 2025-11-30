import React, { useEffect, useState } from 'react';

interface PassportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PassportModal: React.FC<PassportModalProps> = ({ isOpen, onClose }) => {
    const [visitedCountries, setVisitedCountries] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Load from local storage
            const stored = localStorage.getItem('visited_countries');
            if (stored) {
                setVisitedCountries(JSON.parse(stored));
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                            <svg className="w-8 h-8 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Passport
                        </h2>
                        <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">
                            Traveler Log
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Stats */}
                <div className="p-6 bg-slate-800/30 border-b border-white/5 flex justify-around text-center">
                    <div>
                        <div className="text-3xl font-bold text-neon-blue">{visitedCountries.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Countries</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-purple-400">
                            {visitedCountries.length > 5 ? 'Globetrotter' : 'Tourist'}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Rank</div>
                    </div>
                </div>

                {/* Stamps Grid */}
                <div className="p-6 overflow-y-auto flex-1">
                    {visitedCountries.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">
                            <p className="mb-2">No stamps yet.</p>
                            <p className="text-xs">Explore the map to collect them!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {visitedCountries.map((country) => (
                                <div key={country} className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center p-2 hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow-inner mb-2 group-hover:scale-110 transition-transform">
                                        ✈️
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 text-center uppercase leading-tight group-hover:text-white">
                                        {country}
                                    </span>
                                    <span className="text-[8px] text-gray-600 mt-1">
                                        {new Date().getFullYear()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-slate-950/50 text-center">
                    <p className="text-[10px] text-gray-500">
                        The Map of Firsts • Official Document
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PassportModal;
