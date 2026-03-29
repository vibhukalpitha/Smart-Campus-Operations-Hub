import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { LogIn, UserPlus } from 'lucide-react';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            let response;
            if (isLogin) {
                response = await authService.login({
                    email: formData.email,
                    password: formData.password
                });
            } else {
                response = await authService.register(formData);
            }
            
            const { token, ...user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            navigate('/dashboard'); // Example route after login
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                // Formatting backend validation errors if any
                if (typeof err.response.data === 'object' && !err.response.data.error) {
                    const errorMessages = Object.values(err.response.data).join(', ');
                    setError(errorMessages || 'Authentication failed. Please check your inputs.');
                } else {
                    setError(err.response.data.error || 'Authentication failed. Please check your credentials.');
                }
            } else {
                setError('Network error. Please try again later.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
                        {isLogin ? 'Sign in to your account' : 'Create new account'}
                    </h2>
                </div>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        {!isLogin && (
                            <div className="flex space-x-4">
                                <div>
                                    <label htmlFor="firstName" className="sr-only">First Name</label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required={!isLogin}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="sr-only">Last Name</label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required={!isLogin}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {isLogin ? (
                                    <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                ) : (
                                    <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                )}
                            </span>
                            {isLogin ? 'Sign in' : 'Register'}
                        </button>
                    </div>
                </form>
                
                <div className="text-center mt-4">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
