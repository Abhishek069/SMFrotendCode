import React from "react";
import logo from "./../assets/81F+YQ4RWyL._AC_UF894,1000_QL80_.jpg";
import "./Comman.css"; // <-- add CSS file

const WelcomeBanner = () => {
  return (
    <div className="welcome-banner">
      <img className="banner-logo" src={logo} alt="Logo" />

      <div className="banner-text">
        
        <p className="welcome-message">
          <strong>!! Welcome to  !!</strong>
          <br />
          <div className="logo-block">
          <span className="logo-dp">Dp</span>
          <span className="logo-rest">BOSS Services</span>
        </div>
          Fastest Satta Matka Results | Live Jodi • Panel • Fix Games
        </p>
      </div>
      
    </div>
  );
};

export default WelcomeBanner;
