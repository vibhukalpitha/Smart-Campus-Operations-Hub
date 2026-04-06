import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { LogIn, UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            let response;
            if (!isLogin) {
                response = await authService.register(formData);
                setError(response.data.message); // This will render as a success-looking text in the error box
                setIsLogin(true);
                return;
            } else {
                response = await authService.login({
                    email: formData.email,
                    password: formData.password
                });
            }
            
            if (response.data.requiresTwoFactor) {
                navigate('/verify-2fa', { state: { email: response.data.email } });
                return;
            }

            const { token, ...user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'object' && !err.response.data.error) {
                    const errorMessages = Object.values(err.response.data).join(', ');
                    setError(errorMessages || 'Authentication failed. Please check your inputs.');
                } else {
                    setError(err.response.data.error || 'Authentication failed. Please check your credentials.');
                }
            } else {
                setError('Network error. The server could not be reached, ensure the backend connects to MySQL.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0f1c] font-sans">
            <Header />
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-7000"></div>
            <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[60vw] h-[30vw] bg-purple-600/10 rounded-[100%] blur-[100px] mix-blend-screen"></div>

            <div className="relative w-full max-w-md p-8 sm:p-10 mx-4 z-10 transition-all duration-500 ease-in-out">
                {/* Glassmorphism Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 transform hover:scale-[1.01] transition-transform duration-300">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-6 transform hover:rotate-[360deg] transition-transform duration-700">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Join Us Today'}
                        </h2>
                        <p className="mt-3 text-sm text-blue-100/70 font-light tracking-wide">
                            {isLogin ? 'Enter your details to access your account' : 'Create an account to unlock all features'}
                        </p>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm animate-fade-in-down">
                            <p className="text-sm text-red-300 text-center font-medium">{error}</p>
                        </div>
                    )}
                    
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Dynamic Registration Fields */}
                        <div className={`space-y-5 overflow-hidden transition-all duration-500 ease-in-out ${isLogin ? 'max-h-0 opacity-0' : 'max-h-[200px] opacity-100'}`}>
                            {!isLogin && (
                                <div className="flex space-x-4">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required={!isLogin}
                                            className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required={!isLogin}
                                            className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Email Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0a0f1c] transform transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                            <span className="relative flex items-center">
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : isLogin ? (
                                    <LogIn className="h-5 w-5 mr-2" />
                                ) : (
                                    <UserPlus className="h-5 w-5 mr-2" />
                                )}
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </span>
                        </button>
                    </form>
                    
                    {/* Toggle Button */}
                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-indigo-300 hover:after:w-full after:transition-all after:duration-300"
                        >
                            {isLogin ? "Don't have an account? Register" : "Already an insider? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;
