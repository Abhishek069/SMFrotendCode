import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Comman.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="header-container">
      <div className="header-inner">
        
        {/* Branding */}
        <div className="logo-block" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="logo-dp">Dp</span>
          <span className="logo-rest">BOSS Services</span>
        </div>

        {/* Right Section */}
        <div className="header-actions">
          {/* ✅ HOME BUTTON */}
          <button className="header-btn home" onClick={() => navigate("/")}>
            Home
          </button>

          {!isLoggedIn ? (
            <button className="header-btn login" onClick={() => navigate("/login")}>
              Login
            </button>
          ) : (
            <button className="header-btn logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;