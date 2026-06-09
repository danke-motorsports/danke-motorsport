import { createBrowserRouter } from "react-router-dom"; 
import LandingPage from "../pages/LandingPage";
import Auth from "../pages/Auth";
import ClientDashboard from "../pages/ClientDashboard";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import { ProtectedRoute } from "./ProtectedRoute";

const router = createBrowserRouter([
    { path: "/", element: <LandingPage /> },
    { path: "/auth", element: <Auth /> },
    {
        element: <ProtectedRoute allowedRoles={["Cliente"]} />,
        children: [
            { path: "/client-dashboard", element: <ClientDashboard /> }
        ]
    },
    {
        element: <ProtectedRoute allowedRoles={["Funcionario"]} />,
        children: [
            { path: "/employee-dashboard", element: <EmployeeDashboard /> }
        ]
    }
]);

export default router;