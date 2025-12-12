// src/pages/PanelPage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import PanelMatkaTable from "../components/PanelMatkaTable";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

const PanelPage = () => {
  const [singleGameData, setSingleGameData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();


  const fetchSingleGameData = async () => {
    try {
      const data = await api(`/AllGames/${id}`);
      if (data.success) {
        setSingleGameData(data.data || {});
      } else {
        setError("Failed to fetch game data.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSingleGameData();
  }, [id]);

  if (loading) return <div>Loading game data...</div>;
  if (error) return <div>Error: {error}</div>;

  // ------------------------
  //  Group by DATE (YYYY-MM-DD)
  // ------------------------
  const groupedByDate = {}; // { "2025-11-25": { open: [...], close: [...], day: "Tuesday" } }

  (singleGameData.openNo || []).forEach((item) => {
    if (!Array.isArray(item) || item.length < 3) return;
    const dateKey = String(item[2]).split("T")[0];
    groupedByDate[dateKey] = groupedByDate[dateKey] || {};
    groupedByDate[dateKey].open = item;
    groupedByDate[dateKey].day = item[4] || groupedByDate[dateKey].day;
  });

  (singleGameData.closeNo || []).forEach((item) => {
    if (!Array.isArray(item) || item.length < 3) return;
    const dateKey = String(item[2]).split("T")[0];
    groupedByDate[dateKey] = groupedByDate[dateKey] || {};
    groupedByDate[dateKey].close = item;
    groupedByDate[dateKey].day = item[4] || groupedByDate[dateKey].day;
  });

  // ------------------------
  // Convert groupedByDate -> groupedByDay & groupedByDayOpen
  // so the component receives { Monday: [...], Tuesday: [...], ... }
  // each array contains entries in ascending date order.
  // ------------------------
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const groupedByDay = {};
  const groupedByDayOpen = {};
  dayNames.forEach((d) => {
    groupedByDay[d] = [];
    groupedByDayOpen[d] = [];
  });

  // Get sorted date keys (ascending)
  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

  sortedDateKeys.forEach((dateKey) => {
    const item = groupedByDate[dateKey];
    const day = item.day || new Date(dateKey).toLocaleDateString("en-US", { weekday: "long" });
    const open = item.open || ["", "", dateKey, "Open", day];
    const close = item.close || ["", "", dateKey, "Close", day];

    // push the full original arrays (keeps indexes same as server)
    if (!groupedByDayOpen[day]) groupedByDayOpen[day] = [];
    if (!groupedByDay[day]) groupedByDay[day] = [];

    groupedByDayOpen[day].push(open);
    groupedByDay[day].push(close);
  });

  // ------------------------
  // Compute baseDateFromData: earliest date available (safe fallback)
  // ------------------------
  const baseDateFromData = sortedDateKeys.length > 0 ? sortedDateKeys[0] : new Date().toISOString().split("T")[0];

  // ------------------------
  // SEO description (unchanged)
  // ------------------------
  const description = `Dpboss ${singleGameData.name} jodi chart, ${singleGameData.name} jodi chart, old ${singleGameData.name} jodi chart, dpboss ${singleGameData.name} chart, ${singleGameData.name} jodi record, ${singleGameData.name}jodi record, ${singleGameData.name} jodi chart 2015, ${singleGameData.name} jodi chart 2012, ${singleGameData.name} jodi chart 2012 to 2023, ${singleGameData.name} final ank, ${singleGameData.name} jodi chart.co, ${singleGameData.name} jodi chart matka, matka jodi chart ${singleGameData.name}, matka ${singleGameData.name} chart, satta ${singleGameData.name} chart jodi, ${singleGameData.name} state chart, ${singleGameData.name} chart result, डीपी बॉस, सट्टा चार्ट, सट्टा मटका जोड़ी चार्ट, सट्टा मटका जोड़ी चार्ट, ${singleGameData.name} मटका जोड़ी चार्ट, सट्टा मटका ${singleGameData.name} चार्ट जोड़ी, ${singleGameData.name} सट्टा चार्ट, ${singleGameData.name} जोड़ी चार्ट`;

  return (
    <div className="bg-danger border m-1 border-danger text-center ">
      <Header />
      <div className="border m-1 border-danger text-center " style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name} JODI CHART</h3>
      </div>

      <div className="bg-warning m-1 border border-white py-3 text-center">
        <p>{description}</p>
      </div>

      <div className="border m-1 border-danger text-center " style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name}</h3>
        <h3>
          {(() => {
            const today = new Date().toISOString().split("T")[0];

            const todayOpen = singleGameData.openNo?.find(
              (item) => item[2]?.split("T")[0] === today
            );

            const todayClose = singleGameData.closeNo?.find(
              (item) => item[2]?.split("T")[0] === today
            );

            return todayOpen && todayClose
              ? todayOpen.slice(0, 2).join("-") +
                  todayClose[1] +
                  "-" +
                  todayClose[0]
              : "N/A";
          })()}
        </h3>
      </div>

      <PanelMatkaTable
        groupedData={groupedByDay}
        groupedByDayOpen={groupedByDayOpen}
        gameName={singleGameData.name}
        baseDateFromData={baseDateFromData}
        noOfDays = {singleGameData.noOfDays}
      />

      <div className="border m-1 border-danger text-center " style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name}</h3>
        <h3>
          {(() => {
            const today = new Date().toISOString().split("T")[0];

            const todayOpen = singleGameData.openNo?.find(
              (item) => item[2]?.split("T")[0] === today
            );

            const todayClose = singleGameData.closeNo?.find(
              (item) => item[2]?.split("T")[0] === today
            );

            return todayOpen && todayClose
              ? todayOpen.slice(0, 2).join("-") +
                  todayClose[1] +
                  "-" +
                  todayClose[0]
              : "N/A";
          })()}
        </h3>
      </div>
    </div>
  );
};

export default PanelPage;
