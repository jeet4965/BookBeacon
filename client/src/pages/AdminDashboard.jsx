import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheck, FaTimes, FaPlus, FaUsers, FaClock, FaRupeeSign } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', imageUrl: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/login'); return; }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [eventsRes, bookingsRes] = await Promise.all([
                api.get('/events'),
                api.get('/bookings/all')
            ]);
            setEvents(eventsRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                totalSeats: Number(formData.totalSeats),
                availableSeats: Number(formData.totalSeats),
                ticketPrice: Number(formData.ticketPrice),
            };

            await api.post('/events', payload);
            setShowEventForm(false);
            setFormData({ 
                title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', imageUrl: '' 
            });
            fetchData();
        } catch (error) {
            console.error('Create Event Error:', error.response?.data || error.message);
            alert(error.response?.data?.error || error.response?.data?.message || 'Error creating event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting event');
            }
        }
    };

    const handleConfirmBooking = async (id) => {
        try {
            await api.put(`/bookings/${id}/confirm`, { paymentStatus: 'free' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Error confirming booking');
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm("Cancel this user's booking request?")) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) {
        return (
            <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-neon-cyan font-mono text-sm tracking-widest uppercase">
                    <span className="h-3 w-3 animate-ping rounded-full bg-neon-cyan" />
                    Loading Telemetry & Data...
                </div>
            </div>
        );
    }

    const totalRevenue = bookings.reduce((sum, b) => 
        b.paymentStatus === 'paid' && b.status === 'confirmed' ? sum + b.amount : sum, 0
    );

    const paidClientsCount = new Set(
        bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').map(b => b.userId?._id)
    ).size;

    const pendingRequestsCount = bookings.filter(b => b.status === 'pending').length;

    return (
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Top Deck Banner */}
            <div className="neon-card rounded-2xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10 bg-obsidian-900/80 backdrop-blur-xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Command Center</span>
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                        Admin <span className="text-neon-cyan">Deck</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Real-time event tracking, booking approvals, and revenue metrics.</p>
                </div>
                
                <button 
                    onClick={() => setShowEventForm(!showEventForm)} 
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200 ${
                        showEventForm 
                            ? 'border border-neon-pink/40 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20' 
                            : 'neon-btn'
                    }`}
                >
                    {showEventForm ? <><FaTimes /> Cancel Deploy</> : <><FaPlus /> Create New Event</>}
                </button>
            </div>

            {/* Metrics HUD Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="neon-card rounded-2xl p-6 border border-white/10 bg-obsidian-900/60 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-400 mb-1">Total Revenue</p>
                            <h3 className="font-display text-3xl font-extrabold text-white">
                                ₹{totalRevenue.toLocaleString()}
                            </h3>
                            <span className="font-mono text-[10px] text-emerald-400 mt-1 inline-block">● Razorpay Settled</span>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-lg shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                            <FaRupeeSign />
                        </div>
                    </div>
                </div>

                <div className="neon-card rounded-2xl p-6 border border-white/10 bg-obsidian-900/60 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-neon-cyan/10 rounded-full blur-2xl pointer-events-none group-hover:bg-neon-cyan/20 transition-colors" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-400 mb-1">Paid Attendees</p>
                            <h3 className="font-display text-3xl font-extrabold text-white">
                                {paidClientsCount}
                            </h3>
                            <span className="font-mono text-[10px] text-neon-cyan mt-1 inline-block">● Unique User IDs</span>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <FaUsers />
                        </div>
                    </div>
                </div>

                <div className="neon-card rounded-2xl p-6 border border-white/10 bg-obsidian-900/60 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-neon-amber/10 rounded-full blur-2xl pointer-events-none group-hover:bg-neon-amber/20 transition-colors" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-400 mb-1">Pending Passes</p>
                            <h3 className="font-display text-3xl font-extrabold text-white">
                                {pendingRequestsCount}
                            </h3>
                            <span className="font-mono text-[10px] text-neon-amber mt-1 inline-block">● Requires Action</span>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-amber/30 bg-neon-amber/10 text-neon-amber text-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <FaClock />
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Event Modal / Expandable Card */}
            {showEventForm && (
                <div className="neon-card rounded-2xl p-6 sm:p-8 mb-8 border border-neon-violet/30 bg-obsidian-900/90 shadow-neon-violet backdrop-blur-xl transition-all">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-neon-violet font-semibold">Deployment Form</span>
                            <h2 className="font-display text-xl font-bold text-white mt-0.5">Initialize New Event</h2>
                        </div>
                        <span className="rounded-full bg-neon-violet/10 border border-neon-violet/30 px-3 py-1 font-mono text-[10px] text-neon-violet uppercase">
                            Admin Scope
                        </span>
                    </div>

                    <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Event Title</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g., Apex Legends Arena 2026" 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan" 
                                value={formData.title} 
                                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Category</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g., Tournament / Tech Hackathon" 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan" 
                                value={formData.category} 
                                onChange={e => setFormData({ ...formData, category: e.target.value })} 
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Event Date</label>
                            <input 
                                required 
                                type="date" 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan" 
                                value={formData.date} 
                                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Location / Venue</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g., Cyber Hub Arena / Online" 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan" 
                                value={formData.location} 
                                onChange={e => setFormData({ ...formData, location: e.target.value })} 
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Total Capacity (Seats)</label>
                            <input 
                                required 
                                type="number" 
                                placeholder="100" 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan" 
                                value={formData.totalSeats} 
                                onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} 
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Ticket Price (INR)</label>
                            <input 
                                required 
                                type="number" 
                                placeholder="250 (0 for Free Pass)" 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan" 
                                value={formData.ticketPrice} 
                                onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} 
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Cover Image URL</label>
                            <input 
                                type="text" 
                                placeholder="https://images.unsplash.com/..." 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan" 
                                value={formData.imageUrl} 
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">Event Description</label>
                            <textarea 
                                required 
                                placeholder="Detailed briefing of rules, venue schedule, entry pass requirements..." 
                                className="w-full rounded-xl border border-white/10 bg-obsidian-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan h-28" 
                                value={formData.description} 
                                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="neon-btn md:col-span-2 rounded-xl py-3.5 font-bold tracking-wide text-sm mt-2"
                        >
                            Publish & Open Registrations ➔
                        </button>
                    </form>
                </div>
            )}

            {/* Split Data Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Active Events List */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                            <span>Active Tournaments & Events</span>
                        </h2>
                        <span className="font-mono text-xs rounded-lg border border-white/10 bg-obsidian-800 px-2.5 py-1 text-slate-400">
                            {events.length} TOTAL
                        </span>
                    </div>

                    <div className="neon-card rounded-2xl overflow-hidden border border-white/10 bg-obsidian-900/60 backdrop-blur-md">
                        <ul className="divide-y divide-white/5 max-h-[580px] overflow-y-auto">
                            {events.length === 0 ? (
                                <li className="p-8 text-center font-mono text-xs text-slate-500">
                                    No live events currently active on telemetry.
                                </li>
                            ) : (
                                events.map(event => (
                                    <li key={event._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-white text-base truncate">{event.title}</h4>
                                                <span className="font-mono text-[10px] rounded bg-white/5 border border-white/10 px-2 py-0.5 text-slate-400 shrink-0">
                                                    {event.category || 'General'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400 mt-2">
                                                <span>{new Date(event.date).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={event.availableSeats > 0 ? 'text-neon-cyan font-semibold' : 'text-neon-pink font-semibold'}>
                                                    {event.availableSeats}/{event.totalSeats} Slots
                                                </span>
                                                <span>•</span>
                                                <span className="font-semibold text-white">
                                                    {event.ticketPrice === 0 ? 'Free Entry' : `₹${event.ticketPrice}`}
                                                </span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleDeleteEvent(event._id)} 
                                            className="rounded-lg border border-neon-pink/40 bg-neon-pink/10 px-3 py-2 text-xs font-semibold text-neon-pink transition-all hover:bg-neon-pink/20 hover:border-neon-pink active:scale-95 flex items-center gap-1.5 shrink-0"
                                        >
                                            <FaTrash className="text-[10px]" /> Delete
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                {/* Booking Requests Feed */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                            <span>Telemetry Registrations</span>
                        </h2>
                        <span className="font-mono text-xs rounded-lg border border-white/10 bg-obsidian-800 px-2.5 py-1 text-slate-400">
                            {bookings.length} RECORDS
                        </span>
                    </div>

                    <div className="neon-card rounded-2xl overflow-hidden border border-white/10 bg-obsidian-900/60 backdrop-blur-md">
                        <ul className="divide-y divide-white/5 max-h-[580px] overflow-y-auto">
                            {bookings.length === 0 ? (
                                <li className="p-8 text-center font-mono text-xs text-slate-500">
                                    No registration transactions logged yet.
                                </li>
                            ) : (
                                bookings.map(booking => (
                                    <li key={booking._id} className="p-5 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex justify-between items-start gap-3 mb-3">
                                            <div>
                                                <h4 className="font-bold text-white text-base leading-tight">
                                                    {booking.eventId?.title || 'Archived / Deleted Event'}
                                                </h4>
                                                <span className="font-mono text-[10px] text-slate-500">
                                                    REF: {booking._id?.slice(-8).toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <span className={`px-2.5 py-0.5 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider border shrink-0 ${
                                                booking.status === 'confirmed' 
                                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                                    : booking.status === 'cancelled'
                                                    ? 'border-neon-pink/40 bg-neon-pink/10 text-neon-pink'
                                                    : 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        {/* User Details Box */}
                                        <div className="rounded-xl border border-white/5 bg-obsidian-950/60 p-3 mb-3 font-mono text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="truncate">
                                                <span className="text-slate-500 text-[10px] block">ATTENDEE</span>
                                                <span className="font-semibold text-white">{booking.userId?.name || 'Anonymous'}</span>
                                                <span className="text-slate-400 text-[11px] block truncate">{booking.userId?.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 text-[10px] block">PAYMENT STATE</span>
                                                <span className={`font-bold uppercase ${
                                                    booking.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-neon-pink'
                                                }`}>
                                                    {booking.paymentStatus || 'unpaid'}
                                                </span>
                                                <span className="text-slate-400 text-[11px] block">
                                                    {booking.amount === 0 ? 'Free Pass' : `₹${booking.amount}`}
                                                </span>
                                            </div>
                                            <div className="sm:col-span-2 text-[10px] text-slate-500 border-t border-white/5 pt-1.5 mt-1 flex justify-between">
                                                <span>LOGGED: {new Date(booking.bookedAt).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Action Bar for Pending Requests */}
                                        {booking.status === 'pending' && (
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                {booking.amount > 0 && booking.paymentStatus !== 'paid' ? (
                                                    <span className="flex-1 text-center font-mono text-[11px] font-semibold text-neon-pink border border-neon-pink/30 bg-neon-pink/10 py-2 px-3 rounded-lg">
                                                        Awaiting Razorpay Settlement
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleConfirmBooking(booking._id)} 
                                                        className="flex-1 min-w-[120px] rounded-lg border border-emerald-500/40 bg-emerald-500/15 py-2 px-3 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/25 flex items-center justify-center gap-1.5"
                                                    >
                                                        <FaCheck /> Confirm Pass
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => handleCancelBooking(booking._id)} 
                                                    className="w-[80px] rounded-lg border border-neon-pink/40 bg-neon-pink/15 py-2 px-3 text-xs font-bold text-neon-pink transition-all hover:bg-neon-pink/25 flex items-center justify-center gap-1"
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;