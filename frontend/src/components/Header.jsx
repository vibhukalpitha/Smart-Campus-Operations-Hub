import { ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

    return (
        <header className="w-full bg-white/5 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-4 md:px-8 relative z-50 shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-transform">
                    <ShieldAlert className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-100 to-indigo-200 tracking-tight">
                    Smart Campus Hub
                </h1>
            </Link>
            
            <div className="flex space-x-6 items-center">
                {!user ? (
                    <Link to="/login" className="text-sm font-semibold text-indigo-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 shadow-lg relative z-20">
                        Sign In Portal
                    </Link>
                ) : (
                    <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-sm font-semibold text-purple-300 hover:text-white transition-colors bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20 relative z-20">
                        My Dashboard
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
