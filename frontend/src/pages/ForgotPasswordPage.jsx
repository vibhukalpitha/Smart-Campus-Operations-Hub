import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || "Error initiating reset.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0f1c]">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex justify-center items-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                    <Mail className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
                <p className="text-white/50 text-sm mb-6">Enter your email and we'll send you a link to reset your password.</p>

                {error && <div className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm mb-4">{error}</div>}
                {message && <div className="text-emerald-400 bg-emerald-500/10 p-3 rounded-lg text-sm mb-4">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="you@email.com"
                        className="w-full bg-black/20 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-white/20 focus:border-blue-500 outline-none transition-colors"
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Send Reset Link
                    </button>
                    <div className="text-sm mt-4">
                        <Link to="/login" className="text-blue-400 hover:text-white transition-colors">Return to login</Link>
                    </div>
                </form>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;
