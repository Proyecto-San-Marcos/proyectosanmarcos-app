import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Suponiendo que tienes un contexto de autenticación

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Obtiene el estado de autenticación

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
