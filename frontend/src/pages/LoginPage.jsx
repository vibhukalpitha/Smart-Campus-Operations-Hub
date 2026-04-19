import { useState, useEffect, useRef } from 'react';
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
        lastName: '',
        dateOfBirth: '',
        gender: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const hasAttemptedGithubLogin = useRef(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (code && !hasAttemptedGithubLogin.current) {
            hasAttemptedGithubLogin.current = true;
            if (state === 'google') {
                handleGoogleCallback(code);
            } else {
                handleGithubCallback(code);
            }
        }
    }, [navigate]);

    const handleGithubCallback = async (code) => {
        setLoading(true);
        setError('');
        try {
            const response = await authService.githubLogin(code);
            const { token, ...user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // clear the code from URL without reloading
            window.history.replaceState({}, document.title, "/login");
            
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError('GitHub authentication failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCallback = async (code) => {
        setLoading(true);
        setError('');
        try {
            const response = await authService.googleLogin(code);
            const { token, ...user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // clear the code from URL without reloading
            window.history.replaceState({}, document.title, "/login");
            
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError('Google authentication failed.');
            }
        } finally {
            setLoading(false);
        }
    };

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
                const data = new FormData();
                const requestBlob = new Blob([JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender
                })], { type: "application/json" });
                
                data.append('request', requestBlob);
                if (profilePicture) {
                    data.append('profilePicture', profilePicture);
                }
                
                response = await authService.register(data);
                setError(response.data.message); 
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

                        {!isLogin && (
                            <div className="space-y-5 animate-fade-in">
                                {/* DOB and Gender */}
                                <div className="flex space-x-4">
                                    <div className="flex-1 relative group">
                                        <label className="text-xs text-indigo-300/70 ml-1 mb-1 block">Date of Birth</label>
                                        <input
                                            name="dateOfBirth"
                                            type="date"
                                            required={!isLogin}
                                            className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all cursor-pointer"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="flex-1 relative group">
                                        <label className="text-xs text-indigo-300/70 ml-1 mb-1 block">Gender</label>
                                        <select
                                            name="gender"
                                            required={!isLogin}
                                            className="block w-full px-4 py-3 bg-[#1e2538] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Profile Picture */}
                                <div className="relative group">
                                    <label className="text-xs text-indigo-300/70 ml-1 mb-1 block">Profile Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="block w-full text-sm text-indigo-200/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 transition-all cursor-pointer"
                                        onChange={(e) => setProfilePicture(e.target.files[0])}
                                    />
                                </div>
                            </div>
                        )}
                        
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
                    
                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 text-white/50" style={{ background: 'linear-gradient(135deg, rgba(50, 60, 90, 0.4) 0%, rgba(30, 40, 70, 0.4) 100%)', backdropFilter: 'blur(10px)' }}>Or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* GitHub Button */}
                        <button
                            type="button"
                            onClick={() => window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23lioxQzuW1ZD22tF8&scope=user:email&state=github`}
                            className="w-full flex justify-center items-center py-3 px-4 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24292F] focus:ring-offset-[#0a0f1c] transition-all duration-300 shadow-lg"
                        >
                            <svg className="h-5 w-5 mr-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                            {isLogin ? 'Sign in with GitHub' : 'Sign up with GitHub'}
                        </button>
                        
                        {/* Google Button */}
                        <button
                            type="button"
                            onClick={() => window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=384181788008-8n0n5o0md15jm6luvnvt6der49o0nbco.apps.googleusercontent.com&redirect_uri=http://localhost:5173/login&response_type=code&scope=email%20profile&state=google`}
                            className="w-full flex justify-center items-center py-3 px-4 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0a0f1c] transition-all duration-300 shadow-lg"
                        >
                            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                        </button>
                    </div>
                    
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
