import { useCallback } from 'react';

export const useHaptics = () => {
    const triggerImpact = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
        if (navigator.vibrate) {
            switch (style) {
                case 'light':
                    navigator.vibrate(50); // Increased from 10
                    break;
                case 'medium':
                    navigator.vibrate(100); // Increased from 20
                    break;
                case 'heavy':
                    navigator.vibrate(200); // Increased from 40
                    break;
            }
        }
    }, []);

    const triggerSuccess = useCallback(() => {
        if (navigator.vibrate) {
            navigator.vibrate([10, 30, 10]);
        }
    }, []);

    const triggerError = useCallback(() => {
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50, 30, 50]);
        }
    }, []);

    return { triggerImpact, triggerSuccess, triggerError };
};
