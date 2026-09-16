import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaTimesCircle, FaCreditCard, FaCheckCircle, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/mybookings');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = async (booking) => {
        try {
            setPayingId(booking._id);

            // 1. Fetch Razorpay Public Key
            const { data: keyData } = await api.get('/payment/key');
            const resolvedKey = keyData?.key || keyData?.razorpayKey || keyData?.keyId;

            // 2. Create Order on backend
            const { data: orderData } = await api.post('/payment/create-order', {
                bookingId: booking._id,
            });

            const resolvedOrderId = orderData?.orderId || orderData?.id;

            console.log('Razorpay Public Key:', resolvedKey);
            console.log('Razorpay Order ID:', resolvedOrderId);

            if (!resolvedKey) {
                alert('Razorpay key is missing. Check server .env and /payment/key endpoint.');
                return;
            }

            if (!resolvedOrderId) {
                alert('Razorpay order ID is missing. Check /payment/create-order endpoint.');
                return;
            }

            // 3. Configure Razorpay modal
            const options = {
                key: resolvedKey,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'BookBeacon',
                description: `Payment for ${booking.eventId?.title || 'Event'}`,
                order_id: resolvedOrderId,
                handler: async (response) => {
                    try {
                        // 4. Verify payment signature on backend
                        await api.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: booking._id,
                        });

                        navigate('/payment-success', {
                            state: {
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                eventTitle: booking.eventId?.title,
                                amount: booking.amount,
                            },
                        });
                    } catch (err) {
                        navigate('/payment-failed', {
                            state: {
                                error: err.response?.data?.error || 'Payment verification failed',
                                bookingId: booking._id,
                            },
                        });
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#8B5CF6',
                },
            };

            const razorpayInstance = new window.Razorpay(options);

            // 5. Handle modal dismiss or declined payment
            razorpayInstance.on('payment.failed', function (response) {
                navigate('/payment-failed', {
                    state: {
                        error: response.error.description || 'Transaction declined',
                        reason: response.error.reason,
                        paymentId: response.error.metadata?.payment_id,
                        bookingId: booking._id,
                    },
                });
            });

            razorpayInstance.open();
        } catch (error) {
            console.error('Pay error:', error);
            alert(error.response?.data?.error || 'Could not initiate payment');
        } finally {
            setPayingId(null);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) {
        return (
            <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-neon-cyan">
                    <span className="h-3 w-3 animate-ping rounded-full bg-neon-cyan" />
                    Synchronizing Passes & Telemetry...
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Top User Profile HUD Card */}
            <div className="neon-card relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-10 border border-white/10 bg-obsidian-900/80 backdrop-blur-xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6">
                
                {/* Ambient glow orbs */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-neon-cyan/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-neon-violet/20 blur-3xl" />

                {/* Avatar */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-neon-violet to-neon-cyan text-3xl font-extrabold uppercase text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0 font-display">
                    {user?.name?.charAt(0) || 'U'}
                </div>

                {/* Info */}
                <div className="relative z-10 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Authenticated Agent</span>
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                        Welcome back, <span className="text-neon-cyan">{user?.name}</span>
                    </h1>
                    <p className="font-mono text-xs text-slate-400 mt-1">
                        Registered ID: <span className="text-slate-300">{user?.email}</span>
                    </p>
                </div>

                <div className="relative z-10 hidden md:flex flex-col items-end justify-center font-mono">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Active Passes</span>
                    <span className="text-2xl font-black text-white">{bookings.length}</span>
                </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <FaTicketAlt className="text-neon-cyan text-lg" />
                    <span>My Digital Entry Passes</span>
                </h2>
                <span className="font-mono text-xs rounded-full border border-white/10 bg-obsidian-800/80 px-3.5 py-1 text-slate-400">
                    {bookings.length} TOTAL
                </span>
            </div>

            {/* Bookings Feed */}
            {bookings.length === 0 ? (
                <div className="neon-card rounded-3xl p-12 text-center border border-white/10 bg-obsidian-900/60 backdrop-blur-xl">
                    <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan text-2xl mx-auto mb-4">
                        <FaTicketAlt />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-2">No passes acquired yet</h3>
                    <p className="font-mono text-xs text-slate-400 mb-6 max-w-sm mx-auto">
                        Your pass telemetry is empty. Browse live events and secure entry to tournaments, scrims, and summits.
                    </p>
                    <Link 
                        to="/" 
                        className="neon-btn inline-block rounded-xl px-6 py-3 font-mono text-xs uppercase tracking-wider text-white"
                    >
                        Explore Events Feed ➔
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => {
                        const isConfirmed = booking.status === 'confirmed';
                        const isCancelled = booking.status === 'cancelled';
                        const isPaid = booking.paymentStatus === 'paid';

                        return (
                            <div 
                                key={booking._id} 
                                className="neon-card relative rounded-2xl overflow-hidden flex flex-col border border-white/10 bg-obsidian-900/75 backdrop-blur-xl transition-all duration-300 hover:border-neon-violet/40 hover:shadow-neon-violet"
                            >
                                <div className="p-6 flex-grow flex flex-col">
                                    {booking.eventId ? (
                                        <>
                                            {/* Pass Head */}
                                            <div className="flex justify-between items-start gap-2 mb-3">
                                                <div>
                                                    <span className="font-mono text-[10px] text-slate-500 block uppercase tracking-wider">
                                                        REF #{booking._id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <h3 className="font-display text-lg font-bold text-white leading-tight mt-0.5 line-clamp-1">
                                                        {booking.eventId.title}
                                                    </h3>
                                                </div>
                                                
                                                <span className={`px-2.5 py-0.5 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider border shrink-0 ${
                                                    isConfirmed
                                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                                        : isCancelled
                                                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                                                        : 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            {/* Telemetry Details */}
                                            <div className="my-4 rounded-xl border border-white/5 bg-obsidian-950/60 p-3.5 space-y-2 font-mono text-xs">
                                                <div className="flex items-center justify-between text-slate-300">
                                                    <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                                                        <FaCalendarAlt className="text-neon-cyan" /> Schedule
                                                    </span>
                                                    <span>{new Date(booking.eventId.date).toLocaleDateString()}</span>
                                                </div>

                                                <div className="flex items-center justify-between text-slate-300">
                                                    <span className="text-slate-500 text-[11px]">Pass Fee</span>
                                                    <span className="font-bold text-white">
                                                        {booking.amount === 0 ? 'Free Pass' : `₹${booking.amount}`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                                    <span className="text-slate-500 text-[11px]">Settlement</span>
                                                    <span className={`font-bold uppercase text-[11px] ${
                                                        isPaid ? 'text-emerald-400' : 'text-neon-pink'
                                                    }`}>
                                                        {booking.paymentStatus || 'unpaid'}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 text-center font-mono text-xs text-rose-400">
                                            Event record archived or removed
                                        </div>
                                    )}

                                    {/* Action Zone for Pending Payments */}
                                    <div className="mt-auto pt-2">
                                        {booking.status === 'pending' && booking.amount > 0 && !isPaid ? (
                                            <button
                                                onClick={() => handlePayNow(booking)}
                                                disabled={payingId === booking._id}
                                                className="neon-btn w-full rounded-xl py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                                            >
                                                <FaCreditCard />
                                                {payingId === booking._id ? 'Connecting Gateway...' : `Pay ₹${booking.amount} with Razorpay ➔`}
                                            </button>
                                        ) : isPaid || isConfirmed ? (
                                            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                                                <FaCheckCircle className="text-xs" /> Verified Pass Active
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Footer Controls */}
                                <div className="p-3.5 border-t border-white/10 bg-obsidian-950/40 flex justify-between items-center font-mono text-xs">
                                    {booking.eventId && !isCancelled ? (
                                        <>
                                            <Link 
                                                to={`/events/${booking.eventId._id}`} 
                                                className="text-slate-300 transition-colors hover:text-neon-cyan font-medium"
                                            >
                                                Inspect Event ➔
                                            </Link>
                                            <button 
                                                onClick={() => cancelBooking(booking._id)} 
                                                className="text-rose-400/80 hover:text-rose-400 transition-colors font-medium flex items-center gap-1.5 text-[11px]"
                                            >
                                                <FaTimesCircle /> Cancel Pass
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full text-center text-[11px] text-slate-500 italic">
                                            Booking Terminated
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default UserDashboard;