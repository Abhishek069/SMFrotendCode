import React from "react";
import { GoDot } from "react-icons/go";

export default function NoticeSection() {
  return (
    <div
      className="border m-1 border-white  text-center noticesection-home-main-container"
      style={{ backgroundColor: "#ffcc99" }}
    >
      <div
        className="notice-continer-heading"
        style={{ backgroundColor: "#ff00a1" }}
      >
        <GoDot className="m-1" /> <h2 style={{ fontSize: "1.2rem" }}>Notice</h2>{" "}
        <GoDot className="m-1" />
      </div>

      <p>
        अपना बाजार Satta Matka Aajj Tak वेबसाइट में डलवाने के लिए आज ही हमें
        ईमेल करे
        <br></br>
        Email : SattaMatkaAajjTak@gmail.com शर्ते लागु
      </p>
    </div>
  );
}
