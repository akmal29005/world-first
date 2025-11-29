import React, { useState, useEffect } from 'react';

interface DiscoveryPanelProps {
    onToggleTour?: () => void;
    isTourActive?: boolean;
}

const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({ onToggleTour, isTourActive }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        setIsExpanded(false);
    };

    const handleClick = () => {
        if (onToggleTour) onToggleTour();

        // Feedback animation
        setIsExpanded(true);
        if (timeoutId) clearTimeout(timeoutId);
        const id = setTimeout(() => {
            setIsExpanded(false);
        }, 3000);
        setTimeoutId(id);
    };

    useEffect(() => {
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [timeoutId]);

    return (
        <div className="absolute bottom-32 md:bottom-24 left-8 z-40 flex flex-col items-start gap-4 pointer-events-none">
            <button
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`pointer-events-auto backdrop-blur-md border h-12 rounded-full font-medium tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-500 ease-in-out flex items-center overflow-hidden will-change-transform ${isExpanded ? 'w-48 px-0' : 'w-12 px-0'
                    } ${isTourActive
                        ? 'bg-red-500/20 hover:bg-red-500/40 text-red-200 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border-purple-500/50'
                    }`}
                aria-label={isTourActive ? "Stop Journey" : "Start Journey"}
            >
                <div className={`flex items-center min-w-max transition-transform duration-500 ${isExpanded ? 'translate-x-0' : 'translate-x-0'}`}>
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        {isTourActive ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                        )}
                    </div>
                    <span className={`transition-opacity duration-300 pr-4 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        {isTourActive ? "Stop Journey" : "Start Journey"}
                    </span>
                </div>
            </button>
        </div>
    );
};

export default DiscoveryPanel;
