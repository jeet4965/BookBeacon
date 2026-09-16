import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTicketAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-obsidian-950/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center py-3.5 gap-4">
                    
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-white group">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-neon-violet to-neon-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform duration-200 group-hover:scale-105">
                            <FaTicketAlt className="text-sm" />
                        </span>
                        <span>
                            Book<span className="text-neon-cyan">Beacon</span>
                        </span>
                    </Link>

                    {/* Nav Items */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-medium">
                        <Link 
                            to="/" 
                            className="text-slate-300 transition-colors hover:text-neon-cyan"
                        >
                            Events
                        </Link>

                        {user ? (
                            <>
                                <Link 
                                    to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                                    className="text-slate-300 transition-colors hover:text-neon-cyan"
                                >
                                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                                </Link>

                                <button 
                                    onClick={handleLogout} 
                                    className="rounded-lg border border-white/10 bg-obsidian-800/80 px-4 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-neon-pink/40 hover:bg-neon-pink/10 hover:text-neon-pink"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-slate-300 transition-colors hover:text-neon-cyan"
                                >
                                    Login
                                </Link>
                                
                                <Link 
                                    to="/register" 
                                    className="neon-btn rounded-xl px-4 py-2 text-xs font-bold tracking-wide uppercase"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;