import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../components/NotificationPanel';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!token || !storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation */}
            <nav className="bg-blue-600 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-white text-xl font-bold">Smart Campus Ops Hub</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <NotificationPanel />
                            
                            <div className="text-white text-sm hidden md:block">
                                <span className="font-semibold">{user.firstName} {user.lastName}</span>
                                <span className="ml-2 px-2 py-1 bg-blue-500 rounded-full text-xs">
                                    {user.role}
                                </span>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-md text-sm transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Dashboard!</h2>
                        <p className="text-gray-500">
                            Your role is: <strong className="text-blue-600">{user.role}</strong>
                        </p>
                        <p className="mt-4 text-sm text-gray-400">
                            Other team members will add modules like Issue Reporting and Resource Booking here.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
