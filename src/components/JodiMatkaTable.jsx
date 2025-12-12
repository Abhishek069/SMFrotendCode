// src/components/JodiMatkaTable.jsx
import React from "react";
import "./Comman.css";

export default function MatkaTable({
  noOfDays,
  groupedData,
  groupedDataOpen,
  titleNameHeading,
}) {
  // accept number or string inputs for flexibility
  // console.log(noOfDays);

  let daysCount = 7;

  if (noOfDays === undefined) {
    daysCount = 7;
  } else {
    const nd = Number(noOfDays);
    if (nd === 7) daysCount = 7;
    else if (nd === 6) daysCount = 6;
    else daysCount = 5; // fallback (Mon–Fri)
  }

  // console.log(daysCount);

  const daysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // headers only the day columns (no "Week" column)
  const headers = daysShort.slice(0, daysCount);

  // parse "YYYY-MM-DD" into a local Date (avoids UTC parsing issues)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = String(dateStr)
      .split("-")
      .map((n) => parseInt(n, 10));
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  // Build dateMap: dateKey(YYYY-MM-DD) => { day: weekday, open, close }
  const buildDateMap = () => {
    const map = {};
    const pushIntoMap = (item, type) => {
      if (!Array.isArray(item)) return;
      let raw = item[2];
      if (!raw) {
        const maybe = item.find(
          (x) => typeof x === "string" && /\d{4}-\d{2}-\d{2}/.test(x)
        );
        raw = maybe || null;
      }
      if (!raw) return;
      const dateKey = String(raw).split("T")[0];
      if (!map[dateKey])
        map[dateKey] = {
          day: parseLocalDate(dateKey).toLocaleDateString("en-US", {
            weekday: "long",
          }),
        };
      map[dateKey][type] = item;
    };

    Object.keys(groupedData || {}).forEach((day) => {
      (groupedData[day] || []).forEach((item) => pushIntoMap(item, "close"));
    });

    Object.keys(groupedDataOpen || {}).forEach((day) => {
      (groupedDataOpen[day] || []).forEach((item) => pushIntoMap(item, "open"));
    });

    return map;
  };

  const dateMap = buildDateMap();
  const allDates = Object.keys(dateMap).sort((a, b) => {
    const da = parseLocalDate(a);
    const db = parseLocalDate(b);
    return da - db;
  });

  if (allDates.length === 0) {
    return <div>No data available</div>;
  }

  // get Monday (local) for a given local date
  const getMondayLocal = (localDate) => {
    const d = new Date(localDate);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // compute monday base from earliest date (local)
  const mondayBase = getMondayLocal(parseLocalDate(allDates[0]));

  const msPerDay = 24 * 60 * 60 * 1000;
  const getWeekIndex = (dateStr) => {
    const d = parseLocalDate(dateStr);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((d - mondayBase) / msPerDay);
    return Math.floor(diffDays / 7);
  };

  // bucket dates by week index
  const weekBuckets = {};
  allDates.forEach((dateKey) => {
    const w = getWeekIndex(dateKey);
    if (!weekBuckets[w]) weekBuckets[w] = [];
    weekBuckets[w].push(dateKey);
  });

  const weekIndexes = Object.keys(weekBuckets)
    .map(Number)
    .sort((a, b) => a - b);

  const redNumbers = ["44", "50", "38", "99", "61", "05", "77", "88", "66"];

  // build rows: for each week index create `daysCount` cells (local)
  const rows = weekIndexes.map((wIdx) => {
    const startOfWeek = new Date(mondayBase);
    startOfWeek.setDate(mondayBase.getDate() + wIdx * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const cells = [];

    for (let offset = 0; offset < daysCount; offset++) {
      const dt = new Date(startOfWeek);
      dt.setDate(startOfWeek.getDate() + offset);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;

      const entry = dateMap[dateKey];

      if (!entry) {
        cells.push({ text: "", dateKey: null });
        continue;
      }

      const openItem = entry.open || ["", "", dateKey];
      const closeItem = entry.close || ["", "", dateKey];

      const openNum = openItem[1] || "";
      const closeNum = closeItem[1] || "";

      const combined =
        openNum && closeNum
          ? `${openNum}${closeNum}`
          : openNum || closeNum || "";

      cells.push({ text: combined, dateKey });
    }

    return { cells };
  });

  return (
    <div>
      <button
        className="go-bottom"
        onClick={() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }}
      >
        Go to Bottom
      </button>

      <table className="matka-table">
        <thead>
          <tr>
            {/* Title colSpan must match day columns */}
            <th colSpan={daysCount} className="title">
              {titleNameHeading} MATKA RECORD (Jodi + Open) 2019 - 2025
            </th>
          </tr>
          <tr>
            {headers.map((h) => (
              <th key={h} className="day">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {/* Day cells (daysCount columns) */}
              {row.cells.map((cell, cIdx) => {
                const shouldHighlight =
                  cell.text &&
                  redNumbers.some((num) => cell.text.includes(num));
                return (
                  <td
                    key={cIdx}
                    className={shouldHighlight ? "red" : ""}
                    style={{ textAlign: "center", padding: "6px" }}
                  >
                    <div style={{ fontSize: "18px", fontWeight: 700 }}>
                      {cell.text || "-"}
                    </div>
                    {/* uncomment to debug date: <div style={{ fontSize: 10 }}>{cell.dateKey || ""}</div> */}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="go-up"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Go to Top
      </button>
    </div>
  );
}
