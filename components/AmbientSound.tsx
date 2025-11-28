import React, { useState, useEffect, useRef } from 'react';

const AmbientSound: React.FC = () => {
    const [isMuted, setIsMuted] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        // Initialize Audio Context on user interaction (handled by toggle)
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const toggleSound = () => {
        if (isMuted) {
            // Start Sound
            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext();

                // Create Pink Noise (Wind/Space texture)
                const bufferSize = 2 * audioContextRef.current.sampleRate;
                const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5;
                }

                const noise = audioContextRef.current.createBufferSource();
                noise.buffer = noiseBuffer;
                noise.loop = true;

                // Filter to make it deep and ambient
                const filter = audioContextRef.current.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 400; // Deep rumble

                // Gain (Volume)
                const gain = audioContextRef.current.createGain();
                gain.gain.value = 0.05; // Very subtle

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(audioContextRef.current.destination);

                noise.start();
                gainNodeRef.current = gain;
            } else {
                audioContextRef.current.resume();
                if (gainNodeRef.current) {
                    gainNodeRef.current.gain.setTargetAtTime(0.05, audioContextRef.current.currentTime, 0.5);
                }
            }
            setIsMuted(false);
        } else {
            // Mute
            if (audioContextRef.current && gainNodeRef.current) {
                // Fade out
                gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.5);
                setTimeout(() => {
                    audioContextRef.current?.suspend();
                }, 500);
            }
            setIsMuted(true);
        }
    };

    return (
        <button
            onClick={toggleSound}
            className={`fixed bottom-8 left-8 z-50 p-3 rounded-full border transition-all duration-300 backdrop-blur-md ${isMuted
                    ? 'bg-slate-900/50 border-slate-700 text-gray-400 hover:text-white'
                    : 'bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                }`}
            aria-label={isMuted ? "Unmute Ambient Sound" : "Mute Ambient Sound"}
        >
            {isMuted ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
            ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            )}
        </button>
    );
};

let lastOut = 0; // For pink noise generation

export default AmbientSound;
