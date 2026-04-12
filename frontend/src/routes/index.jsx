import { createBrowserRouter } from "react-router-dom"; 
import LandingPage from "../pages/LandingPage";
import Auth from "../pages/Auth";

const router = createBrowserRouter([
    {path: "/", element: <LandingPage />},
    {path: "/auth", element: <Auth />}
])

export default router;