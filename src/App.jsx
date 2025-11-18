import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import JodiPanPage from "./pages/JodiPanPage";
import AllUsersPage from "./pages/AllUsers";
import PanelPage from "./pages/PanelPage";
import SessionWrapper from "./SessionWrapper";
import AdminRoute from "./AdminRoute";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <Router>
      <SessionWrapper>
        <Routes>

          {/* Default route = Home */}
          <Route path="/" element={<HomePage />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Other pages */}
          <Route path="/JodiPanPage/:id" element={<JodiPanPage />} />
          <Route path="/PanelPage/:id" element={<PanelPage />} />

          {/* ❗ Protected Admin Route */}
          <Route
            path="/allUser"
            element={ <AllUsersPage/>}
          />

          {/* Catch-all → redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </SessionWrapper>
    </Router>
  );
}
