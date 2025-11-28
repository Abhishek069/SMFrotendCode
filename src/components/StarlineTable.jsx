// src/components/StarlineTable.jsx
import React from "react";

const StarlineTable = ({ title, color, rows }) => {
  return (
    <div className="my-4">
      <div className={`text-center  text-white fw-bold rounded-top`} style={{ backgroundColor: color }}>
        {title}
      </div>
      <table className="table table-bordered text-center mb-0" style={{ backgroundColor: "#ffdead" }}>
        <thead>
          <tr className="table-header">
            <th>Time</th>
            <th>Result</th>
            <th>Time</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.leftTime}</td>
              <td>{row.leftResult}</td>
              <td>{row.rightTime}</td>
              <td>{row.rightResult}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StarlineTable;
