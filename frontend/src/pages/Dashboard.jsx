import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationPanel from '../components/NotificationPanel';
import Footer from '../components/Footer';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Search, Bell, ArrowRight, Package, Clock, Shield } from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (!token || !storedUser) {
                navigate('/login');
            } else {
                setUser(JSON.parse(storedUser));
            }
        };

        loadUser();

        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-300 mt-4 font-medium tracking-widest uppercase">Initializing Hub...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex overflow-hidden font-sans relative">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            {/* Sidebar */}
            <aside className="w-64 hidden lg:flex flex-col bg-white/5 backdrop-blur-2xl border-r border-white/10 z-10 transition-all">
                <div className="p-6 flex items-center space-x-3 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <LayoutDashboard className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-indigo-200 tracking-tight">Smart Campus</h1>
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <p className="px-4 text-xs font-semibold text-indigo-300/50 uppercase tracking-wider mb-2">Main Menu</p>
                    
                    <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Overview</span>
                    </a>
                    
                    <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-200/70 hover:bg-white/5 hover:text-white transition-all group">
                        <Users className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                        <span className="font-medium">Community</span>
                    </a>
                    
                    <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-200/70 hover:bg-white/5 hover:text-white transition-all group">
                        <Calendar className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                        <span className="font-medium">Schedules</span>
                    </a>
                </div>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden z-10">
                {/* Topbar */}
                <header className="h-20 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 relative z-50">
                    <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/5 w-96 focus-within:bg-white/10 focus-within:border-indigo-500/50 transition-all">
                        <Search className="w-5 h-5 text-indigo-200/50" />
                        <input 
                            type="text" 
                            placeholder="Search modules, events, members..." 
                            className="bg-transparent border-none outline-none ml-3 text-sm text-white placeholder-indigo-200/40 w-full"
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <NotificationPanel />
                        </div>
                        
                        <div className="h-8 w-px bg-white/10"></div>
                        
                        <Link to="/profile" className="flex items-center space-x-3 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-indigo-300/70 capitalize">{user.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20 overflow-hidden relative">
                                {user.profilePicture ? (
                                    <img src={`http://localhost:8080/uploads/profile-pictures/${user.profilePicture}`} alt="Avatar" className="w-full h-full rounded-full object-cover relative z-10" />
                                ) : (
                                    <div className="w-full h-full bg-[#0a0f1c] rounded-full flex items-center justify-center text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Dashboard Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                                Welcome back, {user.firstName}! 👋
                            </h2>
                            <p className="mt-2 text-indigo-200/70">Here's what's happening on campus today.</p>
                        </div>
                        
                        {/* Stats / Widgets Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users className="w-16 h-16 text-indigo-400" />
                                </div>
                                <h3 className="text-indigo-200/50 text-sm font-semibold uppercase tracking-wider">Your Role Status</h3>
                                <p className="text-3xl font-bold mt-2 text-white capitalize">{user.role}</p>
                                <p className="text-sm text-emerald-400 mt-2 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                                    System configured
                                </p>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Calendar className="w-16 h-16 text-blue-400" />
                                </div>
                                <h3 className="text-indigo-200/50 text-sm font-semibold uppercase tracking-wider">Upcoming Events</h3>
                                <p className="text-3xl font-bold mt-2 text-white">0 Moduels</p>
                                <p className="text-sm text-blue-300/70 mt-2">Ready to be integrated</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-3xl relative overflow-hidden shadow-xl shadow-indigo-500/20 group hover:shadow-indigo-500/40 transition-all duration-300 flex flex-col justify-end">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">System Analytics</h3>
                                <p className="text-xl font-bold text-white">All systems operational.</p>
                                <p className="text-sm text-indigo-100/70 mt-1">Campus Hub is running smoothly.</p>
                            </div>
                        </div>

                        {/* Recent Activity Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Quick Access Modules</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Book a Resource */}
                                <div 
                                    onClick={() => navigate('/resources/catalog')}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full group-hover:bg-blue-500/20 transition-all duration-500"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Package className="text-blue-400 w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Resource Hub</h3>
                                    <p className="text-white/40 text-sm leading-relaxed mb-6">Browse and request campus facilities, laboratories, and common areas.</p>
                                    <div className="flex items-center text-blue-400 font-bold text-sm">
                                        Explore Catalog <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* My Bookings */}
                                <div 
                                    onClick={() => navigate('/my-bookings')}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full group-hover:bg-purple-500/20 transition-all duration-500"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Clock className="text-purple-400 w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">My Bookings</h3>
                                    <p className="text-white/40 text-sm leading-relaxed mb-6">Track your active requests, view approvals, or cancel your upcoming bookings.</p>
                                    <div className="flex items-center text-purple-400 font-bold text-sm">
                                        Manage Requests <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Support / Ticketing */}
                                <div 
                                    onClick={() => navigate('/tickets')}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Shield className="text-indigo-400 w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Service Hub</h3>
                                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                                        {user?.role === 'USER' ? 'Log maintenance requests and report campus issues directly to our team.' : 'Manage, track, and update all campus maintenance requests and issues.'}
                                    </p>
                                    <div className="flex items-center text-indigo-400 font-bold text-sm">
                                        {user?.role === 'USER' ? 'Open Ticket' : 'Manage Tickets'} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <Footer />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
