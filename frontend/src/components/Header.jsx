import { useState, useEffect } from 'react';
import { ShieldAlert, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';

const Header = ({ onMenuClick, showMenuButton = false, isSidebarOpen = false }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr && userStr !== "undefined") {
                setUser(JSON.parse(userStr));
            } else {
                setUser(null);
            }
        };

        loadUser();

        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, []);

    return (
        <header className="w-full bg-white/5 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-4 md:px-8 relative z-50 shrink-0">
            <div className="flex items-center space-x-4">
                {showMenuButton && (
                    <button 
                        onClick={onMenuClick}
                        className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                )}
                <Link to="/" className="flex items-center space-x-3 group text-decoration-none">
                <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <img src="/assets/edunexus-logo.png" alt="EduNexus" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight leading-none">
                        EduNexus
                    </h1>
                    <span className="text-[10px] text-blue-200/40 uppercase tracking-[0.2em] font-semibold mt-1">Connect • Manage • Elevate</span>
                </div>
            </Link>
            </div>
            <div className="flex space-x-6 items-center">
                {user && (
                    <nav className="hidden lg:flex items-center space-x-8 mr-4 border-r border-white/10 pr-8">
                        <Link to="/resources/catalog" className="text-sm font-semibold text-white/60 hover:text-blue-400 hover:translate-y-[-1px] transition-all duration-300">Resources</Link>
                        <Link to="/my-bookings" className="text-sm font-semibold text-white/60 hover:text-blue-400 hover:translate-y-[-1px] transition-all duration-300">Bookings</Link>
                        <Link to="/tickets" className="text-sm font-semibold text-white/60 hover:text-blue-400 hover:translate-y-[-1px] transition-all duration-300">Support</Link>
                        <Link to="/contact-us" className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm font-bold text-blue-300 hover:bg-blue-500/20 hover:text-white transition-all duration-300">Contact Us</Link>
                    </nav>
                )}
                {user && <NotificationPanel />}
                {!user ? (
                    <Link to="/login" className="text-sm font-semibold text-indigo-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 shadow-lg relative z-20">
                        Sign In Portal
                    </Link>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 overflow-hidden ring-2 ring-white/10 hover:ring-indigo-400 transition-all z-20">
                            {user.profilePicture ? (
                                <img src={`http://localhost:8080/uploads/profile-pictures/${user.profilePicture}`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-sm">
                                    {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                                </span>
                            )}
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
