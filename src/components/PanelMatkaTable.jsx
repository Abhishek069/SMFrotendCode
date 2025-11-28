import React from "react";
import "./Comman.css";

export default function PanelMatkaTable({
  groupedData = {},
  groupedByDayOpen = {},
  baseDateFromData,
  gameName = "",
}) {
  const headers = ["Week", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dayMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  const baseDate = new Date(baseDateFromData);

  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // ------------------------------
  // WEEK INDEX CALCULATOR
  // ------------------------------
  const getWeekIndex = (entryDate, baseDate) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = (entryDate - baseDate) / msPerDay;
    return Math.floor(diff / 7);
  };

  // ------------------------------
  // BUILD weekData = { weekIndex: { Monday:{open,close}, Tuesday:{}, ... } }
  // ------------------------------
  const weekData = {};

  // OPEN DATA
  Object.keys(groupedByDayOpen).forEach((day) => {
    (groupedByDayOpen[day] || []).forEach((entry) => {
      const date = new Date(entry[2]); // "2025-11-25T00:00:00.000Z"
      const weekIndex = getWeekIndex(date, baseDate);

      if (!weekData[weekIndex]) weekData[weekIndex] = {};
      if (!weekData[weekIndex][day]) weekData[weekIndex][day] = {};

      weekData[weekIndex][day].open = entry;
    });
  });

  // CLOSE DATA
  Object.keys(groupedData).forEach((day) => {
    (groupedData[day] || []).forEach((entry) => {
      const date = new Date(entry[2]);
      const weekIndex = getWeekIndex(date, baseDate);

      if (!weekData[weekIndex]) weekData[weekIndex] = {};
      if (!weekData[weekIndex][day]) weekData[weekIndex][day] = {};

      weekData[weekIndex][day].close = entry;
    });
  });

  // ------------------------------
  // SORT week indexes in ASC (week 0, week 1, week 2…)
  // ------------------------------
  // const weekIndexes = Object.keys(weekData)
  //   .map((x) => Number(x))
  //   .sort((a, b) => a - b);
  // GET ALL week indexes from weekData
  const existingWeekIndexes = Object.keys(weekData)
    .map((n) => Number(n))
    .sort((a, b) => a - b);

  // Find minimum and maximum week indexes
  const minWeek = existingWeekIndexes[0];
  const maxWeek = existingWeekIndexes[existingWeekIndexes.length - 1];

  // Build continuous weeks list (fills missing weeks)
  const weekIndexes = [];
  for (let w = minWeek; w <= maxWeek; w++) {
    weekIndexes.push(w);
  }

  // ------------------------------
  // BUILD FINAL TABLE ROWS
  // ------------------------------
  const data = weekIndexes.map((weekIndex) => {
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() + weekIndex * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekStartStr = formatDate(startOfWeek);
    const weekEndStr = formatDate(endOfWeek);

    // const rowData = Object.values(dayMap).map((shortDay) => {
    //   const fullDay = Object.keys(dayMap).find(
    //     (key) => dayMap[key] === shortDay
    //   );

    //   const openData = weekData[weekIndex][fullDay]?.open || ["", "", ""];
    //   const closeData = weekData[weekIndex][fullDay]?.close || ["", "", ""];

    //   const jodi =
    //     openData[1] && closeData[1] ? `${openData[1]}${closeData[1]}` : "";

    //   return {
    //     openPanel: openData,
    //     jodi,
    //     closePanel: closeData,
    //   };
    // });
    const rowData = Object.values(dayMap).map((shortDay) => {
      const fullDay = Object.keys(dayMap).find((k) => dayMap[k] === shortDay);

      const weekEntry = weekData[weekIndex] || {}; // <-- FIX
      const dayEntry = weekEntry[fullDay] || {}; // <-- FIX

      const openData = dayEntry.open || ["", "", ""];
      const closeData = dayEntry.close || ["", "", ""];

      const jodi =
        openData[1] && closeData[1] ? `${openData[1]}${closeData[1]}` : "";

      return {
        openPanel: openData,
        jodi,
        closePanel: closeData,
      };
    });

    return { weekStartStr, weekEndStr, rowData };
  });

  const redNumbers = ["44", "50", "38", "99", "61", "05", "77", "88", "66"];

  return (
    <div className="panel-table-wrapper compact-layout">
      <button className="go-bottom">Go to Bottom</button>

      <div className="table-responsive compact-table-box">
        <table className="matka-table compact-table">
          <thead>
            <tr>
              <th colSpan={8} className="title compact-title">
                {gameName} MATKA PANEL RECORD 2019 - 2025
              </th>
            </tr>
            <tr>
              {headers.map((day) => (
                <th key={day} className="day compact-day">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* WEEK RANGE */}
                <td
                  className="week-cell"
                  style={{
                    textAlign: "center",
                    padding: "6px 4px",
                    lineHeight: "1.2",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "600" }}>
                    {row.weekStartStr}
                  </div>
                  <div style={{ fontSize: "10px", opacity: 0.8 }}>to</div>
                  <div style={{ fontSize: "11px", fontWeight: "600" }}>
                    {row.weekEndStr}
                  </div>
                </td>

                {/* DAY CELLS */}
                {row.rowData.map(
                  ({ openPanel, jodi, closePanel }, colIndex) => (
                    <td
                      key={colIndex}
                      className="cell"
                      style={{
                        padding: "4px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {openPanel[0] && closePanel[0] ? (
                        <div className="data-of-jodi-open-close compact-data-box">
                          {/* Open Panel */}
                          <div className="small-panel compact-panel">
                            {String(openPanel[0])
                              .split("")
                              .map((d, i) => (
                                <span key={i}>{d}</span>
                              ))}
                          </div>

                          {/* Jodi */}
                          <div
                            className={`big-jodi compact-jodi ${
                              redNumbers.includes(jodi) ? "red" : ""
                            }`}
                          >
                            <span>{jodi || "-"}</span>
                          </div>

                          {/* Close Panel */}
                          <div className="small-panel compact-panel">
                            {String(closePanel[0])
                              .split("")
                              .map((d, i) => (
                                <span key={i}>{d}</span>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="empty-slot">-</div>
                      )}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
