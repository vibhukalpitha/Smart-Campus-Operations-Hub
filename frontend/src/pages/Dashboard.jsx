import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Search, Bell, ArrowRight, Package, Clock, Shield } from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
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
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col overflow-hidden font-sans relative">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <Header 
                showMenuButton={true} 
                onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                isSidebarOpen={sidebarOpen}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex flex-col bg-white/5 backdrop-blur-2xl border-r border-white/10 z-10 transition-all duration-300 overflow-hidden shrink-0`}>
                    <div className="w-64 flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                            <p className="px-4 text-xs font-semibold text-indigo-300/50 uppercase tracking-wider mb-2">Main Menu</p>
                            
                            <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all">
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Overview</span>
                            </Link>
                            
                            <Link to="/community" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-200/70 hover:bg-white/5 hover:text-white transition-all group">
                                <Users className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-medium">Community</span>
                            </Link>
                            
                            <Link to="/schedules" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-200/70 hover:bg-white/5 hover:text-white transition-all group">
                                <Calendar className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-medium">Schedules</span>
                            </Link>
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
                    </div>
                </aside>

                {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden z-10">

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
        </div>
    );
};

export default Dashboard;
