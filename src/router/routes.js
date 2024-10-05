import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/app/Home";
import Login from "../pages/app/Login";
import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/app/" element={<Dashboard />} />
      <Route path="/app/login" element={<Login />} />

      {/* Ruta privada, requiere autenticación */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
