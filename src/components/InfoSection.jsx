import React from "react";
import { useNavigate } from "react-router-dom";

const InfoSection = () => {
  const navigate = useNavigate()

  const handleRoute = ()=>{
    navigate('/allUser')
  }
  const role = localStorage.getItem('userRole');

  return (
    <div className=" m-1 border border-white text-center p-3" style={{ backgroundColor: "#ffcc99" }}>
      <h2 className="Heading-infosection">Satta Matka Aajj Tak Kalyan Matka Result</h2>
      <p className="mb-0 fw-medium text-dark">
        Satta Matka Aajj Tak.Service is the  1 Matka Sites welcomes you full-heartedly. Here below you can find the perfect guess by the top guesser along with the Fast Matka Result too. Aaj Ka Satta Kalyan Fix Single Jodi free update here you find top Matka Market of India Kalyan Main Milan Rajdhani* *kalyan Matka Tips *fast Matka Result *kalyan Main Rajdhani Matka Chart *Matka Guessing by Satta Matka Aajj Tak By App Best Matka Site By Satta Matka Aajj Tak 201
      </p>
      {
        role === 'Admin' ?
        <button className="btn btn-info" onClick={handleRoute}>Update User Password</button>
        :
        ""
      }
    </div>
  );
};

export default InfoSection;
