import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';

interface AmbientSoundProps {
    category?: Category;
}

const AmbientSound: React.FC<AmbientSoundProps> = ({ category }) => {
    const [isMuted, setIsMuted] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const isPlayingRef = useRef(false);

    // Sequencer State
    const nextNoteTimeRef = useRef(0);
    const current16thNoteRef = useRef(0);
    const timerIDRef = useRef<number | null>(null);
    const tempo = 80.0;
    const lookahead = 25.0; // ms
    const scheduleAheadTime = 0.1; // s

    useEffect(() => {
        return () => {
            if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const initAudio = () => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.gain.value = 0.4; // Master volume
        masterGainRef.current.connect(audioContextRef.current.destination);
    };

    // --- Sound Synthesis ---

    const playKick = (time: number) => {
        const ctx = audioContextRef.current!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(masterGainRef.current!);

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.start(time);
        osc.stop(time + 0.5);
    };

    const playSnare = (time: number) => {
        const ctx = audioContextRef.current!;
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(1, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGainRef.current!);
        noise.start(time);
    };

    const playHiHat = (time: number, velocity: number = 1) => {
        const ctx = audioContextRef.current!;
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 10000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        noise.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(masterGainRef.current!);
        noise.start(time);
    };

    const playChord = (time: number, notes: number[]) => {
        const ctx = audioContextRef.current!;

        notes.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            // Slight detune for "lofi" feel
            osc.detune.value = Math.random() * 10 - 5;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1, time + 0.1); // Attack
            gain.gain.exponentialRampToValueAtTime(0.01, time + 2); // Decay

            // Tremolo
            const tremolo = ctx.createOscillator();
            tremolo.frequency.value = 4; // Hz
            const tremoloGain = ctx.createGain();
            tremoloGain.gain.value = 0.2; // Depth

            // Connect Tremolo
            // Note: This is a simplified tremolo. For true tremolo we modulate gain.
            // osc -> gain -> master
            // We'll skip complex tremolo for CPU safety and just use the detune for vibe.

            osc.connect(gain);
            gain.connect(masterGainRef.current!);
            osc.start(time);
            osc.stop(time + 2.5);
        });
    };

    const startVinylCrackle = () => {
        const ctx = audioContextRef.current!;
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            if (Math.random() > 0.999) {
                data[i] = Math.random() * 0.5; // Pop
            } else {
                data[i] = Math.random() * 0.02; // Hiss
            }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.15;

        noise.connect(gain);
        gain.connect(masterGainRef.current!);
        noise.start();
        return noise;
    };

    // --- Scheduler ---

    const scheduleNote = (beatNumber: number, time: number) => {
        // Simple Boom-Bap Beat
        // 16th notes: 0 1 2 3 | 4 5 6 7 | 8 9 10 11 | 12 13 14 15

        // Kick: 0, 10
        if (beatNumber === 0 || beatNumber === 10) {
            playKick(time);
        }

        // Snare: 4, 12
        if (beatNumber === 4 || beatNumber === 12) {
            playSnare(time);
        }

        // HiHat: Every even note, plus some syncopation
        if (beatNumber % 2 === 0 || beatNumber === 15) {
            // Randomize velocity for swing feel
            const velocity = Math.random() * 0.5 + 0.5;
            playHiHat(time, velocity);
        }

        // Chords: Every 16 beats (1 bar)
        if (beatNumber === 0) {
            // Cmaj9: C E G B D
            // Am9: A C E G B
            // Dm9: D F A C E
            // G13: G B D F E

            // Simple progression loop
            const now = Date.now();
            const bar = Math.floor(now / (60000 / tempo * 4)) % 4;

            let chord: number[] = [];
            if (bar === 0) chord = [261.63, 329.63, 392.00, 493.88]; // Cmaj7
            if (bar === 1) chord = [220.00, 261.63, 329.63, 392.00]; // Am7
            if (bar === 2) chord = [293.66, 349.23, 440.00, 523.25]; // Dm7
            if (bar === 3) chord = [196.00, 246.94, 293.66, 349.23]; // G7

            playChord(time, chord);
        }
    };

    const nextNote = () => {
        const secondsPerBeat = 60.0 / tempo;
        nextNoteTimeRef.current += 0.25 * secondsPerBeat; // Advance 16th note
        current16thNoteRef.current = (current16thNoteRef.current + 1) % 16;
    };

    const scheduler = () => {
        if (!isPlayingRef.current) return;

        while (nextNoteTimeRef.current < audioContextRef.current!.currentTime + scheduleAheadTime) {
            scheduleNote(current16thNoteRef.current, nextNoteTimeRef.current);
            nextNote();
        }
        timerIDRef.current = window.setTimeout(scheduler, lookahead);
    };

    const toggleSound = () => {
        if (isMuted) {
            if (!audioContextRef.current) {
                initAudio();
            }
            audioContextRef.current?.resume();

            isPlayingRef.current = true;
            nextNoteTimeRef.current = audioContextRef.current!.currentTime + 0.1;

            startVinylCrackle();
            scheduler();

            setIsMuted(false);
        } else {
            isPlayingRef.current = false;
            if (timerIDRef.current) window.clearTimeout(timerIDRef.current);

            if (masterGainRef.current && audioContextRef.current) {
                const now = audioContextRef.current.currentTime;
                masterGainRef.current.gain.setTargetAtTime(0, now, 0.5);
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
            aria-label={isMuted ? "Play Lofi Radio" : "Pause Lofi Radio"}
        >
            {isMuted ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            ) : (
                <div className="flex gap-1 items-end h-6 w-6 justify-center pb-1">
                    <div className="w-1 bg-neon-blue animate-[bounce_1s_infinite] h-3"></div>
                    <div className="w-1 bg-neon-blue animate-[bounce_1.2s_infinite] h-5"></div>
                    <div className="w-1 bg-neon-blue animate-[bounce_0.8s_infinite] h-4"></div>
                </div>
            )}
        </button>
    );
};

export default AmbientSound;
