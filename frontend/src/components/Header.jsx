import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';

const Header = () => {
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
            <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-transform">
                    <ShieldAlert className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-100 to-indigo-200 tracking-tight">
                    Smart Campus Hub
                </h1>
            </Link>
            
            <div className="flex space-x-6 items-center">
                {user && <NotificationPanel />}
                {!user ? (
                    <Link to="/login" className="text-sm font-semibold text-indigo-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 shadow-lg relative z-20">
                        Sign In Portal
                    </Link>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-sm font-semibold text-purple-300 hover:text-white transition-colors bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20 relative z-20">
                            My Dashboard
                        </Link>
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
