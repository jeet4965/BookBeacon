import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaBolt, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => { fetchEvents(); }, 400);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get(`/events?search=${search}`);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">

            {/* Hero Command Deck */}
            <div className="neon-card rounded-3xl overflow-hidden mb-12 relative border border-white/10 bg-obsidian-900/80 backdrop-blur-xl">
                {/* Ambient glow orbs */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-neon-cyan/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-neon-violet/25 blur-3xl" />

                <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-bold text-emerald-400 hidden sm:flex">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    RADAR ACTIVE
                </div>

                <div className="p-8 md:p-14 relative z-10">
                    <div className="inline-block mb-3 font-mono text-xs font-bold uppercase tracking-widest text-neon-cyan">
                        Discovery & Arena Entry Passes
                    </div>
                    <h1 className="font-display text-white text-4xl md:text-6xl font-extrabold leading-[1.08] mb-6 max-w-3xl">
                        Every ticket starts <span className="bg-gradient-to-r from-neon-violet via-neon-pink to-neon-cyan bg-clip-text text-transparent">with a signal.</span>
                    </h1>
                    <p className="text-slate-300 text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-normal">
                        BookBeacon tracks esports showdowns, hackathons, and premier tech events—then guarantees your verified pass directly to your dashboard.
                    </p>

                    {/* Search Bar HUD */}
                    <div className="w-full max-w-lg relative flex items-center group">
                        <FaSearch className="absolute left-5 text-slate-500 text-base group-focus-within:text-neon-cyan transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter events by title, keyword, or venue..."
                            className="w-full rounded-2xl border border-white/10 bg-obsidian-950/90 pl-13 pr-5 py-4 text-sm text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Feature Strip HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                <div className="neon-card rounded-2xl p-6 border border-white/5 bg-obsidian-900/50 backdrop-blur-md">
                    <div className="w-11 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <FaBolt />
                    </div>
                    <h3 className="font-display text-base font-bold text-white mb-1">Instant Checkout</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">Direct Razorpay test gateway with real-time signature verification.</p>
                </div>

                <div className="neon-card rounded-2xl p-6 border border-white/5 bg-obsidian-900/50 backdrop-blur-md">
                    <div className="w-11 h-11 rounded-xl bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center text-neon-violet mb-4 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <FaTicketAlt />
                    </div>
                    <h3 className="font-display text-base font-bold text-white mb-1">Digital Telemetry Pass</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">Unique ticket IDs and live quota tracking in your user dashboard.</p>
                </div>

                <div className="neon-card rounded-2xl p-6 border border-white/5 bg-obsidian-900/50 backdrop-blur-md">
                    <div className="w-11 h-11 rounded-xl bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center text-neon-pink mb-4 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                        <FaShieldAlt />
                    </div>
                    <h3 className="font-display text-base font-bold text-white mb-1">Guarded Confirmation</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">OTP-verified registrations preventing spoofed reservations.</p>
                </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1">Live Feed</span>
                    <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Featured Showcases</h2>
                </div>
                <div className="font-mono text-xs rounded-full border border-white/10 bg-obsidian-800/80 px-4 py-1.5 text-slate-300">
                    {events.length} EVENTS LOCATED
                </div>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div className="flex min-h-[30vh] items-center justify-center">
                    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neon-cyan">
                        <span className="h-2.5 w-2.5 animate-ping rounded-full bg-neon-cyan" />
                        Scanning Event Telemetry...
                    </div>
                </div>
            ) : events.length === 0 ? (
                <div className="neon-card rounded-2xl p-12 text-center font-mono text-sm text-slate-500 border border-white/5 bg-obsidian-900/40">
                    No active events found matching your search parameters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {events.map(event => {
                        const seatPercentage = Math.max(0, Math.min(100, (event.availableSeats / (event.totalSeats || 1)) * 100));
                        const isSoldOut = event.availableSeats <= 0;

                        return (
                            <div 
                                key={event._id} 
                                className="neon-card rounded-2xl overflow-hidden flex flex-col border border-white/10 bg-obsidian-900/70 backdrop-blur-xl group hover:border-neon-violet/50 hover:shadow-neon-violet transition-all duration-300"
                            >
                                {/* Event Banner */}
                                <div className="h-44 overflow-hidden relative border-b border-white/10 bg-obsidian-950">
                                    {event.imageUrl ? (
                                        <img 
                                            src={event.imageUrl} 
                                            alt={event.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-obsidian-900 to-obsidian-950 text-white font-display font-bold text-lg text-white/30 uppercase tracking-widest">
                                            {event.category || 'EVENT PASS'}
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />

                                    {/* Fare Badge */}
                                    <div className="absolute top-3 right-3 font-mono text-xs font-bold rounded-lg border border-white/15 bg-obsidian-950/80 px-3 py-1 text-white backdrop-blur-md">
                                        {event.ticketPrice === 0 ? (
                                            <span className="text-emerald-400 font-extrabold uppercase">FREE</span>
                                        ) : (
                                            `₹${event.ticketPrice}`
                                        )}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="text-[10px] font-mono font-bold text-neon-cyan uppercase tracking-wider mb-1.5">
                                        {event.category || 'General Access'}
                                    </div>

                                    <h3 className="font-display text-lg font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors line-clamp-1">
                                        {event.title || 'Untitled Showcase'}
                                    </h3>

                                    {/* Venue & Schedule */}
                                    <div className="flex flex-col gap-2 text-xs font-mono text-slate-400 mb-5">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-neon-pink shrink-0" />
                                            <span>
                                                {event.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Schedule Pending'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-neon-amber shrink-0" />
                                            <span className="truncate">{event.location || 'Location TBA'}</span>
                                        </div>
                                    </div>

                                    {/* Availability & Progress Bar */}
                                    <div className="mt-auto">
                                        <div className="w-full bg-white/5 border border-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isSoldOut ? 'bg-slate-600' : 'bg-gradient-to-r from-neon-violet to-neon-cyan'
                                                }`} 
                                                style={{ width: `${seatPercentage}%` }} 
                                            />
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-4">
                                            <span>
                                                <strong className={isSoldOut ? 'text-neon-pink' : 'text-emerald-400'}>
                                                    {event.availableSeats}
                                                </strong> / {event.totalSeats} Available
                                            </span>
                                            <span className="text-slate-500">{Math.round(seatPercentage)}% Capacity</span>
                                        </div>

                                        <Link 
                                            to={`/events/${event._id}`} 
                                            className="neon-btn block w-full text-center rounded-xl py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-all active:scale-[0.98]"
                                        >
                                            Inspect Pass ➔
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modern Footer */}
            <footer className="neon-card rounded-2xl mt-auto p-6 text-center border border-white/5 bg-obsidian-900/40">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-neon-violet to-neon-cyan text-white text-xs">
                        <FaTicketAlt />
                    </span>
                    <span className="font-display text-sm font-bold text-white">
                        Book<span className="text-neon-cyan">Beacon</span>
                    </span>
                </div>
                <p className="text-slate-500 text-xs font-mono">Telemetry-first event dispatch and booking portal.</p>
            </footer>

        </div>
    );
};

export default Home;