import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { KeyRound } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Verify2FAPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!email) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify-2fa', { email, code });
            const { token, ...user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Invalid 2FA code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0f1c] font-sans">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex justify-center items-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                    <KeyRound className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">2-Step Verification</h2>
                <p className="text-white/50 text-sm mb-6">Enter the 6-digit code sent to {email}</p>

                {error && <div className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input 
                        type="text" 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        maxLength="6"
                        placeholder="000000"
                        className="w-full text-center tracking-[1em] text-2xl bg-black/20 border border-white/10 py-4 rounded-xl text-white placeholder-white/20 focus:border-indigo-500 outline-none transition-colors"
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default Verify2FAPage;
