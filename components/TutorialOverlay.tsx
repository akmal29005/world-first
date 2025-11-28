import React, { useState, useEffect } from 'react';

interface TutorialStep {
    title: string;
    description: string;
    target?: string; // CSS selector for spotlight
    position: 'center' | 'top' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: '🌍 Welcome to The Map of Firsts',
        description: 'A geography of emotion where people share meaningful life moments from around the world.',
        position: 'center'
    },
    {
        title: '🔍 Explore Stories',
        description: 'Click on any glowing pin to read someone\'s story. Drag to rotate the globe and scroll to zoom.',
        position: 'center'
    },
    {
        title: '📍 Add Your Own Story',
        description: 'Click "ADD STORY", then tap any country on the globe to drop your pin and share your moment.',
        position: 'bottom'
    },
    {
        title: '🎯 Filter & Search',
        description: 'Use the filters to explore stories by category, or search for specific places and moments.',
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

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dark overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
                onClick={handleSkip}
            />

            {/* Tutorial content */}
            <div className={`absolute ${step.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                    step.position === 'top' ? 'top-24 left-1/2 -translate-x-1/2' :
                        'bottom-24 left-1/2 -translate-x-1/2'
                } pointer-events-auto`}>
                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-lg mx-4 shadow-2xl">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-white mb-3">{step.title}</h2>
                        <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
                    </div>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all ${index === currentStep
                                        ? 'w-8 bg-neon-blue'
                                        : 'w-2 bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSkip}
                            className="flex-1 px-6 py-3 text-gray-400 hover:text-white transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 px-6 py-3 bg-neon-blue hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
                        >
                            {isLastStep ? "Let's Go! 🚀" : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
