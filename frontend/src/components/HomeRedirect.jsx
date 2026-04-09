import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      // Not authenticated - go to login
      navigate('/login', { replace: true });
    } else {
      // Authenticated - check role
      const user = JSON.parse(userStr);
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-300 mt-4 font-medium tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );
};

export default HomeRedirect;
