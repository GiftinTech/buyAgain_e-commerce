import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';

const Logout = () => {
  const { handleLogout } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const logout = async () => {
    const { success, error } = await handleLogout();

    if (success) {
      navigate('/login');
      showAlert('success', 'You have been logged out successfully.');
    }
    if (error) {
      navigate('/');
      showAlert('error', 'An unknown error occurred when logging out.');
    }
  };
  return logout;
};

export default Logout;
