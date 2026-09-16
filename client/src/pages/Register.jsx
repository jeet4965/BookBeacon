import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                await register(name, email, password);
                setShowOTP(true);
                setError('');
            } else {
                await verifyOTP(email, otp);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || err.response?.data?.error || 'Account registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 mx-auto mt-14 mb-16 max-w-md px-4">
            <div className="neon-card relative overflow-hidden rounded-3xl border border-white/10 bg-obsidian-900/80 p-8 shadow-2xl backdrop-blur-2xl">
                
                {/* Background Ambient Glow Orbs */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-neon-cyan/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-neon-violet/25 blur-3xl" />

                {/* Header Icon & Title */}
                <div className="relative z-10 text-center mb-8">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-neon-violet to-neon-cyan text-white text-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-4">
                        {showOTP ? <FaShieldAlt /> : <FaTicketAlt />}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan block mb-1">
                        New Attendee Access
                    </span>
                    <h2 className="font-display text-3xl font-extrabold text-white">
                        {showOTP ? 'Verify Identity' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 text-xs font-mono mt-1.5">
                        {showOTP 
                            ? 'Security code dispatched to your registered email' 
                            : 'Initialize your pass wallet on BookBeacon'}
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="relative z-10 mb-6 rounded-xl border border-neon-pink/40 bg-neon-pink/10 p-3.5 text-center font-mono text-xs font-semibold text-neon-pink">
                        {error}
                    </div>
                )}

                {/* Registration & OTP Forms */}
                <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                    {!showOTP ? (
                        <>
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Alex Mercer"
                                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-colors"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="agent@domain.com"
                                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <div className="rounded-xl border border-white/10 bg-obsidian-950/70 p-3.5 mb-4 text-center">
                                <p className="font-mono text-xs text-slate-300 leading-relaxed">
                                    A 6-digit confirmation pin has been sent to <span className="text-neon-cyan font-bold">{email}</span>.
                                </p>
                            </div>
                            
                            <label className="block font-mono text-xs uppercase tracking-wider text-neon-cyan mb-2 text-center">
                                6-Digit Security Code
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="0 0 0 0 0 0"
                                className="w-full rounded-xl border border-neon-cyan/40 bg-obsidian-950 px-4 py-3 font-mono text-center text-xl font-bold tracking-[0.4em] text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="6"
                            />
                        </div>
                    )}

                    {/* Action Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="neon-btn w-full rounded-xl py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading 
                            ? 'Processing Telemetry...' 
                            : (showOTP ? 'Verify & Access Dashboard ➔' : 'Create Attendee Pass ➔')
                        }
                    </button>
                </form>

                {/* Footer Link */}
                {!showOTP && (
                    <p className="relative z-10 text-center mt-8 font-mono text-xs text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-neon-cyan hover:text-white hover:underline transition-colors">
                            Sign in
                        </Link>
                    </p>
                )}

            </div>
        </div>
    );
};

export default Register;