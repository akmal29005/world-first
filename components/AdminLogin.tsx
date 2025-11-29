import React, { useState, useEffect } from 'react';

interface AdminLoginProps {
    onLogin: () => void;
    onClose: () => void;
}

const LOCKOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ATTEMPTS = 5;

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        checkLockout();
        const interval = setInterval(checkLockout, 1000);
        return () => clearInterval(interval);
    }, []);

    const checkLockout = () => {
        const lockoutUntil = localStorage.getItem('admin_lockout_until');
        if (lockoutUntil) {
            const remaining = parseInt(lockoutUntil) - Date.now();
            if (remaining > 0) {
                setIsLocked(true);
                // Format remaining time
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setIsLocked(false);
                localStorage.removeItem('admin_lockout_until');
                localStorage.removeItem('admin_failed_attempts');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;

        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '551300Akmal@';

        if (password === adminPassword) {
            onLogin();
            localStorage.removeItem('admin_failed_attempts');
            localStorage.removeItem('admin_lockout_until');
        } else {
            setError(true);
            setPassword('');

            // Handle Failed Attempts
            const currentAttempts = parseInt(localStorage.getItem('admin_failed_attempts') || '0') + 1;
            localStorage.setItem('admin_failed_attempts', currentAttempts.toString());

            if (currentAttempts >= MAX_ATTEMPTS) {
                const lockoutUntil = Date.now() + LOCKOUT_DURATION;
                localStorage.setItem('admin_lockout_until', lockoutUntil.toString());
                setIsLocked(true);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center">Admin Access</h2>

                {isLocked ? (
                    <div className="text-center space-y-4">
                        <div className="text-red-400 font-bold text-lg">Account Locked</div>
                        <p className="text-gray-400 text-sm">
                            Too many failed attempts. Please try again in:
                        </p>
                        <div className="font-mono text-xl text-white bg-slate-800 py-2 rounded-lg border border-white/5">
                            {timeLeft}
                        </div>
                        <button
                            onClick={onClose}
                            className="mt-4 w-full px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                placeholder="Enter password"
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center animate-pulse">
                                Incorrect password. {MAX_ATTEMPTS - parseInt(localStorage.getItem('admin_failed_attempts') || '0')} attempts remaining.
                            </p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminLogin;
