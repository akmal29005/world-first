import React from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-slate-900/90 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🌍</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-white">The Map of Firsts</h2>
                        <p className="text-gray-400 italic">A geography of emotion.</p>
                    </div>

                    <div className="space-y-4 text-sm text-gray-300">
                        <p>
                            This is a collective atlas of human beginnings. Every light on the globe represents a memory—a first job, a first heartbreak, a first journey.
                        </p>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-lg">👆</span>
                                <div>
                                    <strong className="text-white block">Explore</strong>
                                    Tap any light to read a story. Drag to rotate the world.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-lg">✍️</span>
                                <div>
                                    <strong className="text-white block">Contribute</strong>
                                    Click "Add Story" to pin your own memory to the map.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-lg">⏳</span>
                                <div>
                                    <strong className="text-white block">Time Travel</strong>
                                    Use the Time Travel filter to see stories from specific years.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-center">
                        <p className="text-xs text-gray-500">
                            Designed & Built by Akmal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
