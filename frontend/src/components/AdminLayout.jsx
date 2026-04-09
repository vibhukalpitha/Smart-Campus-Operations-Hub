import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import { Shield, Users as UsersIcon, Package, Menu, X as XClose, ShieldAlert } from 'lucide-react';

const AdminLayout = ({ children, activeSection = 'users' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[140px] mix-blend-screen pointer-events-none animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse duration-7000"></div>

            {/* Navbar */}
            <header className="h-20 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 relative z-50 shrink-0">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
                    >
                        {sidebarOpen ? <XClose className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ShieldAlert className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-100 to-indigo-200 tracking-tight">Admin Console</h1>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                        <Link to="/profile" className="text-right hover:opacity-80 transition-opacity">
                            <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-purple-300 w-full flex justify-end font-bold items-center uppercase"><Shield className="w-3 h-3 mr-1" /> {user.role}</p>
                        </Link>
                        <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-all ml-4">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} lg:w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 transition-all duration-300 overflow-y-auto z-40 lg:z-10`}>
                    <nav className="p-6 space-y-4">
                        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest px-4 mb-6">Administration</h2>
                        
                        {/* User Management */}
                        <Link
                            to="/admin"
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                }
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                activeSection === 'users' 
                                    ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-white border border-blue-500/30' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <UsersIcon className="w-5 h-5" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">User Management</p>
                                <p className="text-xs text-white/50">Manage users</p>
                            </div>
                        </Link>

                        {/* Facilities & Assets */}
                        <Link
                            to="/admin/resources"
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                }
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                activeSection === 'facilities' 
                                    ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-white border border-purple-500/30' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Package className="w-5 h-5" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">Facilities & Assets</p>
                                <p className="text-xs text-white/50">Manage resources</p>
                            </div>
                        </Link>

                        {/* Divider */}
                        <div className="my-4 px-4 border-t border-white/10"></div>

                        {/* Profile */}
                        <Link
                            to="/profile"
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-white/60 hover:text-white hover:bg-white/5"
                        >
                            <Shield className="w-5 h-5" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">My Profile</p>
                                <p className="text-xs text-white/50">Account settings</p>
                            </div>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0f1c] to-[#0f1428]">
                    <div className="h-full w-full px-4 md:px-12 py-10 z-10 relative flex flex-col">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AdminLayout;
