import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaTicketAlt, FaArrowRight } from 'react-icons/fa';

const PaymentSuccess = () => {
    const { state } = useLocation();

    return (
        <div className="relative z-10 min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
            <div className="neon-card relative overflow-hidden rounded-3xl max-w-md w-full p-8 sm:p-10 text-center border border-white/10 bg-obsidian-900/80 shadow-2xl backdrop-blur-2xl">
                
                {/* Background Ambient Glow Orbs */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-neon-cyan/20 blur-3xl" />

                {/* Status Verified Icon */}
                <div className="relative z-10 w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                    <FaCheckCircle className="text-emerald-400 text-4xl" />
                </div>

                {/* Telemetry Tag */}
                <div className="relative z-10 inline-block font-mono text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-1">
                    Settlement Verified / Confirmed
                </div>

                <h1 className="relative z-10 font-display text-3xl font-black text-white mb-2">
                    Pass <span className="text-emerald-400">Secured</span>
                </h1>
                <p className="relative z-10 text-slate-400 font-mono text-xs mb-6">
                    Digital access key logged. A confirmation receipt has been dispatched to your email.
                </p>

                {/* Digital Receipt Breakdown */}
                {state && (
                    <div className="relative z-10 rounded-2xl border border-white/10 bg-obsidian-950/70 p-4 mb-6 text-left font-mono text-xs space-y-2.5">
                        {state.eventTitle && (
                            <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
                                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Event</span>
                                <span className="text-white font-bold text-right truncate max-w-[210px]">{state.eventTitle}</span>
                            </div>
                        )}
                        {state.amount && (
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Fare Paid</span>
                                <span className="text-emerald-400 font-bold text-sm">₹{state.amount}</span>
                            </div>
                        )}
                        {state.paymentId && (
                            <div className="flex justify-between items-center pt-0.5">
                                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Razorpay Ref</span>
                                <span className="text-neon-cyan font-bold truncate max-w-[200px] text-[11px]">{state.paymentId}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="relative z-10 space-y-3 font-mono text-xs">
                    <Link 
                        to="/dashboard" 
                        className="neon-btn flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-white transition-all active:scale-[0.98]"
                    >
                        <FaTicketAlt className="text-xs" /> View My Digital Passes
                    </Link>

                    <Link 
                        to="/" 
                        className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 bg-obsidian-950/80 py-3.5 font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-white/20 hover:text-white hover:bg-obsidian-800"
                    >
                        Explore More Events <FaArrowRight className="text-xs" />
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default PaymentSuccess;