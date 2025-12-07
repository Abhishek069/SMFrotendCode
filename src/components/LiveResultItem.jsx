// src/components/LiveResultItem.jsx
import React from "react";

const LiveResultItem = ({ title, numbers, openTime, closeTime }) => {
  // console.log(  startTime, endTime);

  return (
    <div className="text-center mb-4 m-1 Live-result-item-main-container bg-[#ffea00]">
      <h5 className="text-uppercase fw-bold LiveResultItemHeading">{title}</h5>
      <p className="fs-5 fw-semibold  LiveResultItemHNumber">{numbers}</p>
      <div className="live-times">
        <span>{openTime}</span>
        <span>{closeTime}</span>
      </div>

      <button
        className="btn btn-sm btn-primary"
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
    </div>
  );
};

export default LiveResultItem;
