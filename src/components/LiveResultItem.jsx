// src/components/LiveResultItem.jsx
import React from "react";

const LiveResultItem = ({ title, numbers, openTime, closeTime }) => {
  return (
    <div className="text-center mb-4 m-1 Live-result-item-main-container ">
      <h5 className="text-uppercase fw-bold LiveResultItemHeading">{title}</h5>
      <p className="fs-5 fw-semibold  LiveResultItemHNumber">{numbers}</p>
      <div className="live-times">
        <span className="live-times-value">{openTime}</span>
        <span className="live-times-value">{closeTime}</span>
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
