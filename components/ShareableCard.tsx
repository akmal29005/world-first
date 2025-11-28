import React, { forwardRef } from 'react';
import { Story, CATEGORY_COLORS } from '../types';

interface ShareableCardProps {
    story: Story;
}

const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(({ story }, ref) => {
    return (
        <div
            ref={ref}
            className="w-[1080px] h-[1080px] bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-20 text-center"
            style={{
                background: `radial-gradient(circle at center, ${CATEGORY_COLORS[story.category]}40, #0f172a 70%)`
            }}
        >
            {/* Decorative Border */}
            <div className="absolute inset-8 border border-white/20 rounded-3xl pointer-events-none" />

            {/* Category Icon/Label */}
            <div
                className="mb-12 px-6 py-2 rounded-full border border-white/30 text-white/90 text-2xl font-medium tracking-widest uppercase"
                style={{ backgroundColor: `${CATEGORY_COLORS[story.category]}20` }}
            >
                {story.category.replace('FIRST_', 'FIRST ')}
            </div>

            {/* Story Text */}
            <h1 className="text-6xl font-serif font-bold text-white leading-tight mb-16 max-w-4xl drop-shadow-2xl">
                "{story.text}"
            </h1>

            {/* Location & Year */}
            <div className="flex flex-col items-center gap-4 text-white/80">
                <div className="text-4xl font-bold tracking-wide">
                    {story.city}, {story.country}
                </div>
                <div className="text-3xl font-light opacity-80">
                    {story.year}
                </div>
                <div className="text-2xl font-mono opacity-50 mt-4">
                    {story.lat.toFixed(4)}° N, {story.lng.toFixed(4)}° E
                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-16 text-white/40 text-xl tracking-[0.5em] font-light uppercase">
                The Map of Firsts
            </div>
        </div>
    );
});

export default ShareableCard;
