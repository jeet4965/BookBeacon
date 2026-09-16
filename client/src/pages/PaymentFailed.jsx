import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTimesCircle, FaRedo, FaArrowLeft } from 'react-icons/fa';

const PaymentFailed = () => {
    const { state } = useLocation();

    return (
        <div className="relative z-10 min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
            <div className="neon-card relative overflow-hidden rounded-3xl max-w-md w-full p-8 sm:p-10 text-center border border-white/10 bg-obsidian-900/80 shadow-2xl backdrop-blur-2xl">
                
                {/* Background Ambient Glow Orbs */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-neon-pink/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-rose-500/15 blur-3xl" />

                {/* Status Icon */}
                <div className="relative z-10 w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                    <FaTimesCircle className="text-rose-400 text-4xl" />
                </div>

                {/* Telemetry Tag */}
                <div className="relative z-10 inline-block font-mono text-[10px] font-extrabold uppercase tracking-widest text-rose-400 mb-1">
                    Gateway Error / Rejected
                </div>

                <h1 className="relative z-10 font-display text-3xl font-black text-white mb-4">
                    Transaction <span className="text-rose-400">Failed</span>
                </h1>
                
                {/* Error Box */}
                <div className="relative z-10 text-rose-300 font-mono text-xs font-semibold bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-8 leading-relaxed">
                    {state?.error || "We couldn't process your transaction telemetry. Check your payment credentials or bank limits and retry."}
                </div>

                {/* Actions */}
                <div className="relative z-10 space-y-3 font-mono text-xs">
                    <Link 
                        to="/dashboard" 
                        className="neon-btn flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-white transition-all active:scale-[0.98]"
                    >
                        <FaRedo className="text-xs" /> Retry From Dashboard
                    </Link>
                    
                    <Link 
                        to="/" 
                        className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 bg-obsidian-950/80 py-3.5 font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-white/20 hover:text-white hover:bg-obsidian-800"
                    >
                        <FaArrowLeft className="text-xs" /> Return To Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;