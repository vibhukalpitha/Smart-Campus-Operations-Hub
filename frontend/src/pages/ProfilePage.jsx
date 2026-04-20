import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Settings, ShieldCheck, Mail, Lock, Camera, User, Bell, ChevronRight, LogOut, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        mfaEnabled: false
    });
    const [preferences, setPreferences] = useState({
        theme: localStorage.getItem('theme') || 'Dark',
        language: localStorage.getItem('language') || 'en',
        autoRefresh: localStorage.getItem('autoRefresh') === 'true',
        simplifiedCatalog: localStorage.getItem('simplifiedCatalog') === 'true'
    });
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.classList.remove('light-mode', 'dark-mode');
        if (preferences.theme === 'Light') {
            document.documentElement.classList.add('light-mode');
        } else if (preferences.theme === 'Dark') {
            document.documentElement.classList.add('dark-mode');
        }
        localStorage.setItem('theme', preferences.theme);
    }, [preferences.theme]);

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => {
            const newPrefs = { ...prev, [key]: value };
            localStorage.setItem(key, value);
            return newPrefs;
        });
        setMessage("Setting updated locally.");
        setTimeout(() => setMessage(''), 2000);
    };

    const handleClearCache = () => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        localStorage.clear();
        if (user) localStorage.setItem('user', user);
        if (token) localStorage.setItem('token', token);
        setMessage("Cache cleared! Site essentials preserved.");
        setTimeout(() => setMessage(''), 3000);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData({
            firstName: parsed.firstName || '',
            lastName: parsed.lastName || '',
            password: '',
            mfaEnabled: !!parsed.mfaEnabled // Assuming backend might send this eventually or handled locally
        });
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'notifications') {
            fetchNotifications();
        }
    }, [activeTab]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error("Failed to delete notification");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        
        try {
            await api.put('/profile', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password ? formData.password : null,
                mfaEnabled: formData.mfaEnabled
            });
            
            setMessage("Changes saved successfully!");
            
            const updatedUser = { ...user, firstName: formData.firstName, lastName: formData.lastName };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            // Clear password field after update
            setFormData(prev => ({ ...prev, password: '' }));
            
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Error updating profile");
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            setLoading(true);
            
            const res = await api.post('/profile/picture', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setMessage("Profile picture updated!");
            const updatedUser = { ...user, profilePicture: res.data.profilePicture };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            window.dispatchEvent(new Event('storage'));
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to upload profile picture");
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const navItems = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'System Settings', icon: Settings },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#050810] text-gray-100 font-sans selection:bg-indigo-500/30">
            <Header />
            
            <main className="flex-1 relative py-12 px-4 sm:px-6 lg:px-8">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="mb-10 animate-fade-in">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Account Settings</h1>
                        <p className="text-gray-400">Manage your profile, security, and preferences.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <nav className="space-y-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-xl">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group ${
                                            activeTab === item.id 
                                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20' 
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-indigo-400'}`} />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {activeTab === item.id && <ChevronRight className="w-4 h-4 text-white/70" />}
                                    </button>
                                ))}
                                <div className="pt-4 mt-4 border-t border-white/10">
                                    <button 
                                        onClick={() => {
                                            localStorage.clear();
                                            navigate('/login');
                                        }}
                                        className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
                                    >
                                        <LogOut className="w-5 h-5 text-red-400/70 group-hover:text-red-400" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </nav>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
                                {/* Header / Avatar Section */}
                                <div className="h-32 bg-gradient-to-r from-indigo-700/30 to-purple-800/30 relative">
                                    <div className="absolute -bottom-12 left-10 flex flex-col items-center">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-3xl bg-[#0a0f1c] p-1 ring-4 ring-[#050810] shadow-2xl overflow-hidden">
                                                {user.profilePicture ? (
                                                    <img 
                                                        src={`http://localhost:8080/uploads/profile-pictures/${user.profilePicture}`} 
                                                        alt="Profile" 
                                                        className="w-full h-full object-cover rounded-2xl"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center text-indigo-400">
                                                        <User className="w-10 h-10" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                                     onClick={() => fileInputRef.current?.click()}>
                                                    <Camera className="text-white w-6 h-6" />
                                                </div>
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-[-10px] left-36">
                                        <h2 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
                                        <p className="text-gray-400 text-sm">{user.role || 'Campus Member'}</p>
                                    </div>
                                </div>

                                <div className="p-10 pt-20">
                                    {/* Success/Error Toasts */}
                                    {message && (
                                        <div className="mb-8 flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-2xl animate-fade-in-down">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
                                            <span className="text-green-400 text-sm font-medium">{message}</span>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="mb-8 flex items-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in-down">
                                            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                                            <span className="text-red-400 text-sm font-medium">{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleUpdate} className="space-y-8">
                                        {activeTab === 'personal' && (
                                            <div className="space-y-6 animate-fade-in">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2 group">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-indigo-400 transition-colors">First Name</label>
                                                        <input 
                                                            type="text"
                                                            value={formData.firstName}
                                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                            className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all placeholder-gray-600 text-white shadow-inner"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 group">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-indigo-400 transition-colors">Last Name</label>
                                                        <input 
                                                            type="text"
                                                            value={formData.lastName}
                                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                            className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all placeholder-gray-600 text-white shadow-inner"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-600"/> Public Email</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="email" 
                                                            value={user.email} 
                                                            disabled 
                                                            className="w-full bg-white/5 border border-white/5 px-5 py-4 rounded-2xl text-gray-500 cursor-not-allowed italic" 
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-600 uppercase font-bold tracking-tighter">Verified</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'security' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 rounded-3xl flex items-center justify-between shadow-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                                            <ShieldCheck className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-amber-200">2-Factor Authentication</h3>
                                                            <p className="text-xs text-amber-200/50">Protect your account with an extra security layer.</p>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.mfaEnabled} 
                                                            onChange={(e) => setFormData({...formData, mfaEnabled: e.target.checked})} 
                                                            className="sr-only peer" 
                                                        />
                                                        <div className="w-14 h-7 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 transition-colors"></div>
                                                    </label>
                                                </div>

                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center"><Lock className="w-4 h-4 mr-2 text-gray-600"/> Change Password</label>
                                                    <input 
                                                        type="password"
                                                        placeholder="Enter new password (optional)"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all placeholder-gray-600 text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'notifications' && (
                                            <div className="space-y-6 animate-fade-in">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-white tracking-tight">Recent Updates</h3>
                                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                        {notifications.filter(n => !n.read).length} Unread
                                                    </span>
                                                </div>
                                                
                                                {notifications.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {notifications.map((n) => (
                                                            <div 
                                                                key={n.id} 
                                                                className={`p-5 rounded-2xl border transition-all duration-300 flex items-start justify-between group ${
                                                                    n.read 
                                                                    ? 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10' 
                                                                    : 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                                                                }`}
                                                            >
                                                                <div className="flex items-start space-x-4">
                                                                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                                        n.read ? 'bg-white/10 text-gray-500' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                                    }`}>
                                                                        <Bell className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className={`font-bold ${n.read ? 'text-gray-300' : 'text-white'}`}>{n.title}</h4>
                                                                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                                                                        <span className="text-[10px] text-gray-500 font-medium block mt-2 uppercase tracking-wide">
                                                                            {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    {!n.read && (
                                                                        <button 
                                                                            onClick={() => handleMarkAsRead(n.id)}
                                                                            className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-colors"
                                                                            title="Mark as Read"
                                                                        >
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => handleDeleteNotification(n.id)}
                                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                                        title="Delete"
                                                                    >
                                                                        <AlertCircle className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-20 text-center">
                                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                            <Bell className="w-8 h-8 text-indigo-500/50" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white/40">Inbox Empty</h3>
                                                        <p className="text-gray-600 text-sm mt-2">We'll alert you when something happens.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'preferences' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* Theme Selection */}
                                                    <div className="space-y-4">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Display Theme</label>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {['Dark', 'Light', 'Auto'].map((theme) => (
                                                                <button
                                                                    key={theme}
                                                                    type="button"
                                                                    onClick={() => handlePreferenceChange('theme', theme)}
                                                                    className={`px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                                                                        preferences.theme === theme 
                                                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                                    }`}
                                                                >
                                                                    {theme}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Language Selection */}
                                                    <div className="space-y-4">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Primary Language</label>
                                                        <select 
                                                            value={preferences.language}
                                                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all text-white"
                                                        >
                                                            <option value="en">English (Global)</option>
                                                            <option value="es">Spanish</option>
                                                            <option value="fr">French</option>
                                                            <option value="de">German</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                                                    <h3 className="font-bold text-white flex items-center">
                                                        <Sparkles className="w-5 h-5 mr-3 text-indigo-500" />
                                                        Dashboard Experience
                                                    </h3>
                                                    
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                                            <div>
                                                                <p className="font-medium text-gray-200">Auto-Refresh Feed</p>
                                                                <p className="text-xs text-gray-500">Automatically update booking status every 30 seconds.</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="sr-only peer" 
                                                                    checked={preferences.autoRefresh}
                                                                    onChange={(e) => handlePreferenceChange('autoRefresh', e.target.checked)}
                                                                />
                                                                <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                            </label>
                                                        </div>

                                                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                                            <div>
                                                                <p className="font-medium text-gray-200">Simplified Catalog</p>
                                                                <p className="text-xs text-gray-500">Hide complex technical resource details for a cleaner view.</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="sr-only peer" 
                                                                    checked={preferences.simplifiedCatalog}
                                                                    onChange={(e) => handlePreferenceChange('simplifiedCatalog', e.target.checked)}
                                                                />
                                                                <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-red-400">Advanced: Clear Local Cache</h3>
                                                        <p className="text-xs text-gray-500 mt-1">Force a full re-sync of application data and assets.</p>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={handleClearCache}
                                                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all font-bold text-sm"
                                                    >
                                                        Reset Cache
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Sticky Action Bar */}
                                        {(activeTab === 'personal' || activeTab === 'security') && (
                                            <div className="pt-8 border-t border-white/10 flex items-center justify-end space-x-4">
                                                <button 
                                                    type="button" 
                                                    onClick={() => navigate(-1)}
                                                    className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:text-white transition-colors"
                                                >
                                                    Discard
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    disabled={loading}
                                                    className="px-10 py-4 rounded-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center min-w-[160px] disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    ) : 'Save Changes'}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .animate-fade-in-down { animation: fade-in-down 0.4s ease-out forwards; }
            `}} />
        </div>
    );
};

export default ProfilePage;

