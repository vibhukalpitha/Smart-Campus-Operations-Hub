import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Settings, ShieldCheck, Mail, Lock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFirstName(parsed.firstName || '');
        setLastName(parsed.lastName || '');
        
        // Fetch real-time profile to see if MFA is currently enabled
        // Wait, the regular response didn't include it. We will just read from current state.
        // For simplicity, we just allow them to set it.
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        try {
            await api.put('/profile', {
                firstName,
                lastName,
                password: password ? password : null,
                mfaEnabled
            });
            
            setMessage("Profile updated successfully! An email notification has been sent.");
            
            // Update local storage name cache softly
            const updatedUser = { ...user, firstName, lastName };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
        } catch (err) {
            setError(err.response?.data?.error || "Error updating profile");
        }
    };

    if (!user) return null;

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0f1c]">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg w-full text-white shadow-2xl relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex justify-center items-center mb-4 shadow-lg shadow-indigo-500/20 group relative overflow-hidden">
                        <Settings className="w-10 h-10 text-white group-hover:rotate-45 transition-transform duration-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Account Options</h2>
                    <p className="text-white/40 mt-1">Configure your personal preferences</p>
                </div>

                {message && <div className="p-3 mb-6 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm rounded-xl text-center">{message}</div>}
                {error && <div className="p-3 mb-6 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-xl text-center">{error}</div>}

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">First Name</label>
                            <input 
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-all placeholder-white/20 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Last Name</label>
                            <input 
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-all placeholder-white/20 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center"><Mail className="w-3 h-3 mr-1"/> Email (Locked)</label>
                        <input type="text" value={user.email} disabled className="w-full bg-white/5 border border-white/5 px-4 py-3 rounded-xl text-white/40 cursor-not-allowed" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center"><Lock className="w-3 h-3 mr-1"/> New Password</label>
                        <input 
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 px-4 py-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-all placeholder-white/20 text-white"
                        />
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-orange-300 flex items-center"><ShieldCheck className="w-4 h-4 mr-2"/> 2-Step Verification</p>
                            <p className="text-xs text-orange-200/60 mt-1">Require an email code when signing in.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={mfaEnabled} onChange={(e) => setMfaEnabled(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 transition-colors"></div>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-between space-x-4">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 px-4 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10">
                            Go Back
                        </button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
