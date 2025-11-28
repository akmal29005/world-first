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
        <div className="absolute bottom-24 left-8 z-40 flex flex-col items-start gap-4 pointer-events-none">
            <button
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`pointer-events-auto backdrop-blur-md border h-12 rounded-full font-medium tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-500 ease-in-out flex items-center overflow-hidden ${isExpanded ? 'w-48 px-0' : 'w-12 px-0'
                    } ${isTourActive
                        ? 'bg-red-500/20 hover:bg-red-500/40 text-red-200 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border-purple-500/50'
                    }`}
                aria-label={isTourActive ? "Stop Journey" : "Start Journey"}
            >
                <div className={`flex items-center gap-3 min-w-max pl-3.5 transition-transform duration-500 ${isExpanded ? 'translate-x-0' : 'translate-x-0'}`}>
                    {isTourActive ? (
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 1 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        {isTourActive ? "Stop Journey" : "Start Journey"}
                    </span>
                </div>
            </button>
        </div>
    );
};

export default DiscoveryPanel;
