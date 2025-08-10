import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Logout = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    const { success, error } = await handleLogout();

    if (success) navigate('/');
    if (error) console.log('An unknown error occurred when logging out.');
  };
  return logout;
};

export default Logout;
