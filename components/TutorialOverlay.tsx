import React, { useState, useEffect } from 'react';

interface TutorialStep {
    title: string;
    description: string;
    target?: string; // CSS selector for spotlight
    position: 'center' | 'top' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: 'The Map of Firsts',
        description: 'A collective geography of human memory. This is a space to anonymously record the significant milestones that shape our lives—from first loves to first losses.',
        position: 'center'
    },
    {
        title: 'Explore the Archive',
        description: 'Navigate the globe to discover stories from around the world. Each light represents a shared memory waiting to be witnessed.',
        position: 'center'
    },
    {
        title: 'Share Your Story',
        description: 'Your experiences matter. Select "Add Story" to drop a pin and contribute your own milestone to the map.',
        position: 'bottom'
    },
    {
        title: 'Find Resonance',
        description: 'Use filters to explore specific categories or search for stories that echo your own experiences.',
        position: 'bottom'
    }
];

const TutorialOverlay: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has seen tutorial
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleSkip = () => {
        handleClose();
    };

    const handleClose = () => {
        localStorage.setItem('hasSeenTutorial', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    // Dynamic positioning classes
    // Mobile: Always centered (top-1/2 -translate-y-1/2)
    // Desktop: Respects step.position
    const positionClasses = {
        center: 'top-1/2 -translate-y-1/2',
        top: 'top-1/2 -translate-y-1/2 md:top-24 md:translate-y-0',
        bottom: 'top-1/2 -translate-y-1/2 md:bottom-24 md:translate-y-0'
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dark overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-500"
                onClick={handleSkip}
            />

            {/* Tutorial content */}
            <div className={`absolute left-1/2 -translate-x-1/2 ${positionClasses[step.position]} pointer-events-auto w-full max-w-lg px-4 transition-all duration-500 ease-in-out`}>
                <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 tracking-tight">{step.title}</h2>
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light">{step.description}</p>
                    </div>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-8">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentStep
                                    ? 'w-8 bg-neon-blue shadow-[0_0_10px_rgba(14,165,233,0.5)]'
                                    : 'w-1.5 bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSkip}
                            className="flex-1 px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 px-6 py-3 bg-neon-blue hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] text-sm tracking-widest uppercase"
                        >
                            {isLastStep ? "Enter Map" : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
