import React from "react";
import "./Comman.css";

export default function PanelMatkaTable({
  groupedData = {},
  groupedByDayOpen = {},
  baseDateFromData,
  gameName = "",
  noOfDays = 7, // <-- new prop (accepts 5, 6, or 7). default 7
}) {
  // normalize noOfDays to 5/6/7
  const nd = Number(noOfDays);
  let daysCount = 7;
  if (Number.isFinite(nd)) {
    if (nd === 7) daysCount = 7;
    else if (nd === 6) daysCount = 6;
    else daysCount = 5; // fallback
  }

  // short names and dynamic headers (include "Week")
  const daysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const headers = ["Week", ...daysShort.slice(0, daysCount)];

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

  // WEEK INDEX CALCULATOR
  const getWeekIndex = (entryDate, mondayBase) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = (entryDate - mondayBase) / msPerDay;
    return Math.floor(diff / 7);
  };

  // Force any date to Monday
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  // We convert baseDate to Monday reference
  const mondayBaseDate = getMonday(baseDate);

  // BUILD weekData
  const weekData = {};

  // OPEN DATA
  Object.keys(groupedByDayOpen).forEach((day) => {
    (groupedByDayOpen[day] || []).forEach((entry) => {
      const date = new Date(entry[2]);
      const weekIndex = getWeekIndex(date, mondayBaseDate);

      if (!weekData[weekIndex]) weekData[weekIndex] = {};
      if (!weekData[weekIndex][day]) weekData[weekIndex][day] = {};

      weekData[weekIndex][day].open = entry;
    });
  });

  // CLOSE DATA
  Object.keys(groupedData).forEach((day) => {
    (groupedData[day] || []).forEach((entry) => {
      const date = new Date(entry[2]);
      const weekIndex = getWeekIndex(date, mondayBaseDate);

      if (!weekData[weekIndex]) weekData[weekIndex] = {};
      if (!weekData[weekIndex][day]) weekData[weekIndex][day] = {};

      weekData[weekIndex][day].close = entry;
    });
  });

  // Sort week indexes
  const existingWeekIndexes = Object.keys(weekData)
    .map((n) => Number(n))
    .sort((a, b) => a - b);

  if (existingWeekIndexes.length === 0) {
    return <div>No data available</div>;
  }

  const minWeek = existingWeekIndexes[0];
  const maxWeek = existingWeekIndexes[existingWeekIndexes.length - 1];

  const weekIndexes = [];
  for (let w = minWeek; w <= maxWeek; w++) weekIndexes.push(w);

  // BUILD FINAL TABLE ROWS
  const data = weekIndexes.map((weekIndex) => {
    // Start week from Monday always
    const startOfWeek = new Date(mondayBaseDate);
    startOfWeek.setDate(mondayBaseDate.getDate() + weekIndex * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekStartStr = formatDate(startOfWeek);
    const weekEndStr = formatDate(endOfWeek);

    // only iterate the required short days (Mon..Fri/Mon..Sat/Mon..Sun)
    const rowData = daysShort.slice(0, daysCount).map((shortDay) => {
      const fullDay = Object.keys(dayMap).find((k) => dayMap[k] === shortDay);

      const weekEntry = weekData[weekIndex] || {};
      const dayEntry = weekEntry[fullDay] || {};

      const openData = dayEntry.open || ["", "", ""];
      const closeData = dayEntry.close || ["", "", ""];

      const jodi =
        openData[1] && closeData[1] ? `${openData[1]}${closeData[1]}` : "";

      return { openPanel: openData, jodi, closePanel: closeData };
    });

    return { weekStartStr, weekEndStr, rowData };
  });

  const redNumbers = ["44", "50", "38", "99", "61", "05", "77", "88", "66"];

  return (
    <div className="panel-table-wrapper compact-layout">
      <button
        className="go-bottom"
        onClick={() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }}
      >
        Go to Bottom{" "}
      </button>

      <div className="table-responsive compact-table-box">
        <table className="matka-table compact-table">
          <thead>
            <tr>
              {/* colSpan must match headers length */}
              <th colSpan={headers.length} className="title compact-title">
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
                {/* Week column */}
                <td
                  className="week-cell"
                  style={{ textAlign: "center", padding: "6px 4px" }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "600" }}>
                    {row.weekStartStr}
                  </div>
                  <div style={{ fontSize: "10px", opacity: 0.8 }}>to</div>
                  <div style={{ fontSize: "11px", fontWeight: "600" }}>
                    {row.weekEndStr}
                  </div>
                </td>

                {/* Day columns - only the sliced ones */}
                {row.rowData.map(({ openPanel, jodi, closePanel }, colIndex) => (
                  <td
                    key={colIndex}
                    className="cell"
                    style={{ padding: "4px", textAlign: "center" }}
                  >
                    {openPanel[0] && closePanel[0] ? (
                      <div className="data-of-jodi-open-close compact-data-box">
                        <div className="small-panel compact-panel">
                          {String(openPanel[0]).split("").map((d, i) => (
                            <span key={i}>{d}</span>
                          ))}
                        </div>

                        <div
                          className={`big-jodi compact-jodi ${
                            redNumbers.includes(jodi) ? "red" : ""
                          }`}
                        >
                          <span>{jodi || "-"}</span>
                        </div>

                        <div className="small-panel compact-panel">
                          {String(closePanel[0]).split("").map((d, i) => (
                            <span key={i}>{d}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-slot">-</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="go-up"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Go to Top
      </button>
    </div>
  );
}
