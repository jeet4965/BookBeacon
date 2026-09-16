import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) { navigate('/login'); return; }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('Verification OTP dispatched to your registered email.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp });
                setSuccessMsg('Booking requested! Telemetry confirmed. Awaiting final authorization.');
                setShowOTP(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking transmission failed');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-neon-cyan">
                    <span className="h-3 w-3 animate-ping rounded-full bg-neon-cyan" />
                    Fetching Event Telemetry...
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="relative z-10 mx-auto max-w-xl px-4 py-20 text-center">
                <div className="neon-card rounded-2xl border border-neon-pink/30 p-8">
                    <p className="font-mono text-base font-bold text-neon-pink">{error || 'Event not found'}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="neon-btn mt-6 rounded-xl px-6 py-2.5 text-xs uppercase tracking-wider"
                    >
                        Return to Deck
                    </button>
                </div>
            </div>
        );
    }

    const isSoldOut = event.availableSeats <= 0;
    const isDone = successMsg && !showOTP;

    return (
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Hero Banner / Cover Display */}
            <div className="neon-card rounded-3xl overflow-hidden mb-10 border border-white/10 bg-obsidian-900/60 backdrop-blur-xl group">
                {event.imageUrl ? (
                    <div className="relative h-72 md:h-[420px] w-full overflow-hidden">
                        <img 
                            src={event.imageUrl} 
                            alt={event.title} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />
                        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 flex flex-wrap items-center gap-3">
                            <span className="neon-badge-cyan rounded-full px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider">
                                {event.category || 'Championship'}
                            </span>
                            <span className="rounded-full border border-white/15 bg-obsidian-900/80 px-3.5 py-1 font-mono text-xs text-slate-300 backdrop-blur-md">
                                REF: {event._id?.slice(-6).toUpperCase()}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative flex h-72 md:h-96 w-full items-center justify-center bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-[#0c1427]">
                        <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-neon-violet/20 blur-3xl" />
                        <span className="font-display text-4xl md:text-6xl font-black uppercase tracking-widest text-white/20">
                            {event.category || 'VIP PASS'}
                        </span>
                    </div>
                )}
            </div>

            {/* Split Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                
                {/* Left: Event Briefing */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="neon-card rounded-2xl p-6 sm:p-8 border border-white/10 bg-obsidian-900/70 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#06b6d4]" />
                            <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Briefing & Overview</span>
                        </div>
                        
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
                            {event.title}
                        </h1>

                        <p className="text-slate-300 text-base leading-relaxed font-normal whitespace-pre-line">
                            {event.description}
                        </p>
                    </div>

                    {/* Operational Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                        <div className="neon-card rounded-xl p-4 border border-white/5 bg-obsidian-900/40">
                            <span className="text-slate-500 block text-[10px] uppercase">Protocol</span>
                            <span className="text-neon-cyan font-bold mt-0.5 block">Instant RSVP</span>
                        </div>
                        <div className="neon-card rounded-xl p-4 border border-white/5 bg-obsidian-900/40">
                            <span className="text-slate-500 block text-[10px] uppercase">Security</span>
                            <span className="text-emerald-400 font-bold mt-0.5 block flex items-center gap-1">
                                <FaShieldAlt className="text-[10px]" /> OTP Guarded
                            </span>
                        </div>
                        <div className="neon-card rounded-xl p-4 border border-white/5 bg-obsidian-900/40 col-span-2 sm:col-span-1">
                            <span className="text-slate-500 block text-[10px] uppercase">Pass Type</span>
                            <span className="text-neon-violet font-bold mt-0.5 block">Digital QR / RFID</span>
                        </div>
                    </div>
                </div>

                {/* Right: Esports Deck Ticket Stub Pass */}
                <div className="lg:col-span-2 w-full">
                    <div className="neon-card relative rounded-3xl overflow-hidden border border-white/15 bg-obsidian-900/90 shadow-2xl backdrop-blur-2xl">
                        
                        {/* Ambient glow orbs inside card */}
                        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-neon-cyan/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-neon-violet/20 blur-3xl" />

                        {/* Pass Header */}
                        <div className="relative border-b border-white/10 bg-obsidian-950/80 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-neon-cyan flex items-center gap-1.5">
                                    <FaTicketAlt /> Esports Pass
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                    #PASS-{id.slice(-4).toUpperCase()}
                                </span>
                            </div>
                            <p className="font-display text-white text-lg font-bold mt-2 truncate">
                                {event.title}
                            </p>
                        </div>

                        {/* Telemetry Metrics List */}
                        <div className="relative p-6 space-y-4">
                            
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
                                    <FaMoneyBillWave />
                                </div>
                                <div className="flex-1">
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Pass Fare</p>
                                    <p className="font-mono text-lg font-extrabold text-white">
                                        {event.ticketPrice === 0 ? (
                                            <span className="text-emerald-400 font-black uppercase text-base">Free Pass</span>
                                        ) : (
                                            `₹${event.ticketPrice}`
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-violet/30 bg-neon-violet/10 text-neon-violet">
                                    <FaChair />
                                </div>
                                <div className="flex-1">
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Capacity & Quota</p>
                                    <p className="font-mono text-sm font-bold text-white">
                                        <span className={event.availableSeats > 0 ? 'text-neon-cyan font-bold' : 'text-neon-pink font-bold'}>
                                            {event.availableSeats}
                                        </span>
                                        <span className="text-slate-500"> / {event.totalSeats} Slots Available</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-pink/30 bg-neon-pink/10 text-neon-pink">
                                    <FaCalendarAlt />
                                </div>
                                <div className="flex-1">
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Event Date</p>
                                    <p className="font-mono text-sm font-semibold text-white">
                                        {new Date(event.date).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-amber/30 bg-neon-amber/10 text-neon-amber">
                                    <FaMapMarkerAlt />
                                </div>
                                <div className="flex-1">
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Venue / Terminal</p>
                                    <p className="font-mono text-sm font-semibold text-white truncate">
                                        {event.location}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Perforated Stub Divider */}
                        <div className="relative my-1 border-t border-dashed border-white/20">
                            <div className="absolute -left-3.5 -top-3 h-6 w-6 rounded-full bg-[#030712] border-r border-white/20" />
                            <div className="absolute -right-3.5 -top-3 h-6 w-6 rounded-full bg-[#030712] border-l border-white/20" />
                        </div>

                        {/* Interactive Verification / Action Form */}
                        <div className="relative p-6 pt-5">
                            {showOTP && (
                                <div className="mb-4">
                                    <label className="block font-mono text-xs text-neon-cyan uppercase tracking-wider mb-2">
                                        Security Verification Code
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
                                    <span className="block mt-2 font-mono text-[10px] text-slate-400 text-center">
                                        Check your inbox for the 6-digit confirmation pin.
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={isSoldOut || bookingLoading || (showOTP && !otp) || isDone}
                                className={`w-full py-4 px-6 rounded-xl font-mono text-xs uppercase tracking-widest font-extrabold transition-all duration-200 ${
                                    isSoldOut || isDone
                                        ? 'border border-white/10 bg-obsidian-800 text-slate-500 cursor-not-allowed'
                                        : 'neon-btn active:scale-[0.98]'
                                }`}
                            >
                                {bookingLoading 
                                    ? 'Transmitting...' 
                                    : (showOTP 
                                        ? 'Verify & Confirm Pass ➔' 
                                        : (isDone 
                                            ? '✓ Request Dispatched' 
                                            : (isSoldOut 
                                                ? 'Pass Sold Out' 
                                                : (user ? 'Reserve Entry Pass ➔' : 'Login to Claim Pass ➔')
                                            )
                                        )
                                    )
                                }
                            </button>

                            {/* Notifications & System Alerts */}
                            {error && (
                                <div className="mt-4 rounded-xl border border-neon-pink/40 bg-neon-pink/10 p-3 font-mono text-xs font-semibold text-neon-pink text-center">
                                    {error}
                                </div>
                            )}

                            {successMsg && (
                                <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 font-mono text-xs font-semibold text-emerald-400 text-center">
                                    {successMsg}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default EventDetail;