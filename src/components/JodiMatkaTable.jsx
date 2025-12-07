import React from "react";
import "./Comman.css";

export default function MatkaTable({ groupedData, groupedDataOpen,titleNameHeading }) {
  const headers = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dayMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  // 🔹 Helper to generate table rows from combined sources
  const generateCombinedTableData = (jodiSource, openSource) => {
    const maxRows = Math.max(
      ...Object.values(jodiSource).map((dayArr) => dayArr.length),
      ...Object.values(openSource).map((dayArr) => dayArr.length)
    );

    return Array.from({ length: maxRows }, (_, rowIndex) =>
      headers.map((shortDay) => {
        const fullDay = Object.keys(dayMap).find(
          (key) => dayMap[key] === shortDay
        );

        const jodiDayData = jodiSource[fullDay];
        const openDayData = openSource[fullDay];

        const jodiVal =
          jodiDayData && jodiDayData[rowIndex]
            ? jodiDayData[rowIndex][1]
            : "";
        const openVal =
          openDayData && openDayData[rowIndex]
            ? openDayData[rowIndex][1]
            : "";

        // Combine both values into single cell
        if (jodiVal && openVal) return `${openVal}${jodiVal}`;
        return jodiVal || openVal || "";
      })
    );
  };

  const combinedData = generateCombinedTableData(
    groupedData,
    groupedDataOpen
  );

  const redNumbers = ["44", "50", "38", "99", "61", "05", "77", "88", "66"];

  return (
    <div>
      <button className="go-bottom" onClick={() => { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth",});
    }}>Go to Bottom </button>

      {/* 🔹 Single Combined Table */}
      <table className="matka-table">
        <thead>
          <tr>
            <th colSpan={7} className="title">
              {titleNameHeading} MATKA RECORD (Jodi + Open) 2019 - 2025
            </th>
          </tr>
          <tr>
            {headers.map((day) => (
              <th key={day} className="day">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {combinedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                // 🔹 Check if *either* number is in red list
                const shouldHighlight = redNumbers.some((num) =>
                  cell.includes(num)
                );
                return (
                  <td
                    key={colIndex}
                    className={shouldHighlight ? "red" : ""}
                  >
                    <h1 className="colNameCell"> {cell} </h1>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
