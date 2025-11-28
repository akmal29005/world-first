import React from 'react';

interface TimeSliderProps {
    minYear: number;
    maxYear: number;
    startYear: number;
    endYear: number;
    onChange: (start: number, end: number) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ minYear, maxYear, startYear, endYear, onChange }) => {
    // Calculate percentage for track background
    const minPercent = ((startYear - minYear) / (maxYear - minYear)) * 100;
    const maxPercent = ((endYear - minYear) / (maxYear - minYear)) * 100;

    return (
        <div className="absolute bottom-36 md:bottom-28 left-1/2 transform -translate-x-1/2 w-[90%] md:w-1/2 max-w-2xl bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl z-40 transition-all duration-300 hover:border-neon-blue/50">
            <div className="flex justify-between items-center mb-2 text-xs md:text-sm font-mono text-neon-blue tracking-widest uppercase">
                <span>Time Travel</span>
                <span className="text-white font-bold">{startYear} — {endYear}</span>
            </div>

            <div className="relative h-6 w-full">
                {/* Track Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 rounded-full -translate-y-1/2"></div>

                {/* Active Range Track */}
                <div
                    className="absolute top-1/2 h-1 bg-neon-blue rounded-full -translate-y-1/2 transition-all duration-100"
                    style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                ></div>

                {/* Range Inputs */}
                <input
                    type="range"
                    min={minYear}
                    max={maxYear}
                    value={startYear}
                    onChange={(e) => {
                        const val = Math.min(Number(e.target.value), endYear - 1);
                        onChange(val, endYear);
                    }}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)] hover:[&::-webkit-slider-thumb]:scale-125 transition-all z-20"
                />
                <input
                    type="range"
                    min={minYear}
                    max={maxYear}
                    value={endYear}
                    onChange={(e) => {
                        const val = Math.max(Number(e.target.value), startYear + 1);
                        onChange(startYear, val);
                    }}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)] hover:[&::-webkit-slider-thumb]:scale-125 transition-all z-20"
                />
            </div>

            {/* Era Label (Dynamic) */}
            <div className="text-center mt-2 text-xs text-gray-400 font-serif italic">
                {startYear < 1980 ? "The Analog Era" : startYear < 2000 ? "The Turn of the Millennium" : "The Digital Age"}
            </div>
        </div>
    );
};

export default TimeSlider;
