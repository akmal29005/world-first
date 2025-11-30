import React from 'react';

interface ShameScreenProps {
    onClose: () => void;
    reason?: string;
}

const ShameScreen: React.FC<ShameScreenProps> = ({ onClose, reason }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.3s_ease-out]">
            <div className="max-w-md w-full bg-slate-800 border-2 border-red-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] transform hover:scale-105 transition-transform duration-300">

                <div className="text-6xl mb-6 animate-bounce">
                    🤡
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                    VIBE CHECK <span className="text-red-500">FAILED</span>
                </h2>

                <p className="text-lg text-gray-300 mb-6 font-medium leading-relaxed">
                    Our AI read your story and... <span className="italic text-red-400">yikes</span>.
                </p>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
                    <p className="text-sm text-red-200 uppercase tracking-widest font-bold text-xs mb-1">
                        DETECTED NAUGHTINESS
                    </p>
                    <p className="text-white font-mono text-sm">
                        {reason || "Unspeakable acts of cringe"}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 group"
                >
                    <span className="group-hover:hidden">I Promise To Be Good 🥺</span>
                    <span className="hidden group-hover:inline">Try Again (Wholesome Edition) 😇</span>
                </button>

                <p className="mt-6 text-xs text-gray-500">
                    (We still love you, just not that story.)
                </p>
            </div>
        </div>
    );
};

export default ShameScreen;
