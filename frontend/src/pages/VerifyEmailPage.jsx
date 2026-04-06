import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('Verifying your email...');
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("Invalid token provided.");
                return;
            }
            try {
                await api.post(`/auth/verify-email?token=${encodeURIComponent(token)}`);
                setStatus("Email verified successfully! You can now log in.");
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                setStatus(err.response?.data?.error || "Error verifying email.");
            }
        };
        verify();
    }, [token, navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0f1c] font-sans">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-emerald-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center text-white shadow-xl max-w-md w-full relative z-10">
                    <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-200">Email Verification</h2>
                    <p className="text-white/70 font-medium tracking-wide">{status}</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VerifyEmailPage;
