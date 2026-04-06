import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/api';
import Footer from '../components/Footer';
import { Shield, Users as UsersIcon, Wrench, Trash2, Edit, Check, X, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('USERS'); // 'USERS' or 'TECHNICIANS'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Edit Role State
    const [editingUserId, setEditingUserId] = useState(null);
    const [editRoleValue, setEditRoleValue] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!token || !storedUser) {
            navigate('/login');
            return;
        } 
        
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'ADMIN') {
            navigate('/dashboard'); // Kick non-admins out
            return;
        }
        
        setUser(parsedUser);
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Failed to load users. Backend may be down or you lack permissions.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        
        try {
            await userService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Error deleting user.");
        }
    };

    const handleSaveRole = async (id) => {
        try {
            const response = await userService.updateUserRole(id, editRoleValue);
            // Replace user in state with updated response
            setUsers(users.map(u => u.id === id ? response.data : u));
            setEditingUserId(null);
        } catch (err) {
            console.error("Failed to update role", err);
            alert("Error updating role.");
        }
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-300 mt-4 font-medium tracking-widest uppercase">Authorizing...</p>
            </div>
        </div>
    );

    // Filter logic for tabs
    const displayedUsers = users.filter((u) => {
        if (activeTab === 'USERS') {
            return u.role === 'USER';
        } else if (activeTab === 'TECHNICIANS') {
             return u.role === 'TECHNICIAN';
        }
        return true;
    });

    const adminsCount = users.filter(u => u.role === 'ADMIN').length;
    const techniciansCount = users.filter(u => u.role === 'TECHNICIAN').length;
    const basicUsersCount = users.filter(u => u.role === 'USER').length;

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col overflow-hidden font-sans relative">
            {/* Background Animations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[140px] mix-blend-screen pointer-events-none animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse duration-7000"></div>

            {/* Navbar */}
            <header className="h-20 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 relative z-50 shrink-0">
                <div className="flex items-center space-x-3">
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

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto px-4 md:px-12 py-10 z-10">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Stats Header */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                           <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                           <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Total System Users</p>
                           <h3 className="text-4xl font-bold text-white">{users.length}</h3>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                           <UsersIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                           <p className="text-blue-300/60 text-sm font-semibold uppercase tracking-wider mb-2">Basic Users</p>
                           <h3 className="text-4xl font-bold text-white">{basicUsersCount}</h3>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                           <Wrench className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                           <p className="text-orange-300/60 text-sm font-semibold uppercase tracking-wider mb-2">Technicians</p>
                           <h3 className="text-4xl font-bold text-white">{techniciansCount}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600/80 to-indigo-600/80 backdrop-blur-md border border-purple-500/30 rounded-3xl p-6 shadow-xl shadow-purple-500/20 relative overflow-hidden">
                           <ShieldAlert className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
                           <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">Administrators</p>
                           <h3 className="text-4xl font-bold text-white">{adminsCount}</h3>
                        </div>
                    </div>

                    {/* Manage Users Card */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        
                        {/* Tabs */}
                        <div className="flex border-b border-white/10 bg-black/20">
                            <button 
                                onClick={() => setActiveTab('USERS')}
                                className={`flex-1 py-5 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center ${activeTab === 'USERS' ? 'text-white border-b-2 border-indigo-400 bg-white/5' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                            >
                                <UsersIcon className="w-5 h-5 mr-2" /> Basic Users ({basicUsersCount})
                            </button>
                            <button 
                                onClick={() => setActiveTab('TECHNICIANS')}
                                className={`flex-1 py-5 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center ${activeTab === 'TECHNICIANS' ? 'text-white border-b-2 border-orange-400 bg-white/5' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                            >
                                <Wrench className="w-5 h-5 mr-2" /> Technicians ({techniciansCount})
                            </button>
                        </div>

                        {/* List */}
                        <div className="p-6">
                            {error && <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">{error}</div>}
                            
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : displayedUsers.length === 0 ? (
                                <div className="text-center py-20 text-white/40 font-medium">
                                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    No {activeTab.toLowerCase()} found in the system.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
                                                <th className="pb-4 font-semibold pl-4">Name</th>
                                                <th className="pb-4 font-semibold">Email</th>
                                                <th className="pb-4 font-semibold">Role</th>
                                                <th className="pb-4 font-semibold text-right pr-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedUsers.map((u) => (
                                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 pl-4">
                                                        <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                                                    </td>
                                                    <td className="py-4 text-white/70">{u.email}</td>
                                                    <td className="py-4">
                                                        {editingUserId === u.id ? (
                                                            <div className="flex items-center space-x-2">
                                                                <select 
                                                                    value={editRoleValue} 
                                                                    onChange={(e) => setEditRoleValue(e.target.value)}
                                                                    className="bg-black/50 border border-white/20 text-white text-sm rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                                                >
                                                                    <option value="USER">USER</option>
                                                                    <option value="TECHNICIAN">TECHNICIAN</option>
                                                                    <option value="ADMIN">ADMIN</option>
                                                                </select>
                                                                <button onClick={() => handleSaveRole(u.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded-lg transition-colors">
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setEditingUserId(null)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg transition-colors">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${
                                                                u.role === 'USER' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                                                u.role === 'TECHNICIAN' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' :
                                                                'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                                            }`}>
                                                                {u.role}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right pr-4">
                                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                title="Change Role"
                                                                onClick={() => { setEditingUserId(u.id); setEditRoleValue(u.role); }} 
                                                                className="p-2 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 rounded-xl transition-all"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <div className="w-px h-4 bg-white/10"></div>
                                                            <button 
                                                                title="Delete User"
                                                                onClick={() => handleDeleteUser(u.id)} 
                                                                className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        
                    </div>
                </div>
                <div className="shrink-0 mt-8">
                    <Footer />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
