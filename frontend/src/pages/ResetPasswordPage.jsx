import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!token) {
            setError("No valid token found in URL.");
            return;
        }

        try {
            const response = await api.post(`/auth/reset-password?token=${encodeURIComponent(token)}`, {
                newPassword: newPassword
            });
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Error resetting password.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0f1c]">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-white/50 text-sm mb-6">Enter your new secure password.</p>

                {error && <div className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm mb-4">{error}</div>}
                {message && <div className="text-emerald-400 bg-emerald-500/10 p-3 rounded-lg text-sm mb-4">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="New Password"
                        className="w-full bg-black/20 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-white/20 focus:border-blue-500 outline-none transition-colors"
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Confirm New Password
                    </button>
                </form>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPasswordPage;
