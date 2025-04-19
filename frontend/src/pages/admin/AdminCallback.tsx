import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../utils/api';

const AdminCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        console.error('No code found in URL');
        navigate('/admin');
        return;
      }

      try {
        const response = await authApi.google(code);
        if (response.ok) {
          navigate('/admin');
        } else {
          console.error('Authentication failed');
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        navigate('/admin');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default AdminCallback; 