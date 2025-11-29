import { useState, useEffect, useCallback } from 'react';

interface GyroscopeData {
    x: number; // Gamma (left/right tilt)
    y: number; // Beta (front/back tilt)
    isAvailable: boolean;
    requestPermission: () => Promise<void>;
}

export const useGyroscope = (): GyroscopeData => {
    const [data, setData] = useState({ x: 0, y: 0 });
    const [isAvailable, setIsAvailable] = useState(false);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        // Gamma: Left/Right tilt (-90 to 90)
        // Beta: Front/Back tilt (-180 to 180)
        const x = event.gamma || 0;
        const y = event.beta || 0;
        setData({ x, y });
    }, []);

    const requestPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    setIsAvailable(true);
                }
            } catch (error) {
                console.error('Gyroscope permission denied:', error);
            }
        } else {
            // Non-iOS 13+ devices
            window.addEventListener('deviceorientation', handleOrientation);
            setIsAvailable(true);
        }
    };

    useEffect(() => {
        // Check if device orientation is supported
        if (window.DeviceOrientationEvent) {
            // For non-iOS 13+ devices, we can listen immediately (or check if we get data)
            // But usually best to wait for explicit request if possible, or just try adding listener
            // Note: Chrome requires HTTPS for this.
            if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
                window.addEventListener('deviceorientation', handleOrientation);
                setIsAvailable(true);
            }
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [handleOrientation]);

    return { ...data, isAvailable, requestPermission };
};
