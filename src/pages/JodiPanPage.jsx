// src/pages/JodiPanPage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MatkaTable from "../components/JodiMatkaTable";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {jwtDecode} from "jwt-decode"; // updated import to default
import * as XLSX from "xlsx";

const JodiPanPage = () => {
  const [singleGameData, setSingleGameData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);

  const token = localStorage.getItem("authToken");
  let userRole = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

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
    if (id) {
      fetchSingleGameData();
    }
  }, [id]);

  if (loading) {
    return <div>Loading game data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // ------------------------------------------------------------------
  // 🔥 EXCEL + JSON FILE UPLOAD HANDLER (unchanged)
  // ------------------------------------------------------------------
  const handleFileUpload = async () => {
    try {
      if (!jsonFile) {
        toast.warn("Please select a file first!");
        return;
      }

      const fileName = jsonFile.name.toLowerCase();
      let jsonData = null;

      if (fileName.endsWith(".json")) {
        const fileText = await jsonFile.text();
        jsonData = JSON.parse(fileText);
      } else if (fileName.endsWith(".xlsx")) {
        const data = await jsonFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        toast.error("Only .json or .xlsx files are allowed!");
        return;
      }

      const response = await api("/AllGames/updateGamesData", {
        method: "POST",
        body: JSON.stringify(jsonData),
      });

      if (response.success) {
        toast.success("Game data updated successfully!");
        fetchSingleGameData();
      } else {
        toast.error(response.message || "Failed to update game data!");
      }
    } catch (err) {
      console.error("❌ Error uploading file:", err);
      toast.error("Error updating game data");
    }
  };

  // ------------------------------------------------------------------
  // Build groupedByDay and groupedByDay_Open but ensure we preserve original
  // arrays and derive day reliably from item[2] (the date). Also sort by date.
  // ------------------------------------------------------------------

  // Helper: safe dateKey extractor
  const getDateKeyFromItem = (item) => {
    if (!item) return null;
    // Prefer item[2] if exists and contains a date-time string
    const dateRaw = item[2];
    if (dateRaw) {
      return String(dateRaw).split("T")[0];
    }
    // Try to find any field that looks like a date (fallback)
    for (let i = 0; i < item.length; i++) {
      if (typeof item[i] === "string" && /\d{4}-\d{2}-\d{2}/.test(item[i])) {
        return item[i].split("T")[0];
      }
    }
    return null;
  };

  // Build date-keyed map first to allow deterministic sorting
  const dateMap = {}; // { "2025-11-25": { day: "Tuesday", open: [...], close: [...] } }

  (singleGameData.openNo || []).forEach((item) => {
    const dateKey = getDateKeyFromItem(item);
    if (!dateKey) return;
    const dObj = dateMap[dateKey] || { day: new Date(dateKey).toLocaleDateString("en-US", { weekday: "long" }) };
    dObj.day = new Date(dateKey).toLocaleDateString("en-US", { weekday: "long" });
    dObj.open = item; // preserve full array
    dateMap[dateKey] = dObj;
  });

  (singleGameData.closeNo || []).forEach((item) => {
    const dateKey = getDateKeyFromItem(item);
    if (!dateKey) return;
    const dObj = dateMap[dateKey] || { day: new Date(dateKey).toLocaleDateString("en-US", { weekday: "long" }) };
    dObj.day = new Date(dateKey).toLocaleDateString("en-US", { weekday: "long" });
    dObj.close = item; // preserve full array
    dateMap[dateKey] = dObj;
  });

  // Now turn dateMap into groupedByDay arrays sorted by date (ascending)
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const groupedByDay = {};
  const groupedByDay_Open = {};
  dayNames.forEach((d) => {
    groupedByDay[d] = [];
    groupedByDay_Open[d] = [];
  });

  const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));

  sortedDates.forEach((dateKey) => {
    const entry = dateMap[dateKey];
    const day = entry.day || new Date(dateKey).toLocaleDateString("en-US", { weekday: "long" });

    // push original arrays (open/close) if they exist,
    // fallback to placeholder arrays while preserving shape if needed
    if (entry.open) groupedByDay_Open[day].push(entry.open);
    if (entry.close) groupedByDay[day].push(entry.close);
  });

  const description = `Dpboss ${singleGameData.name} jodi chart, ${singleGameData.name} jodi chart, old ${singleGameData.name} jodi chart, dpboss ${singleGameData.name} chart, ${singleGameData.name} jodi record...`;

  return (
    <div className="bg-danger border m-1 border-danger text-center ">
      <Header />

      <div className="border m-1 border-danger text-center" style={{ background: "Pink" }}>
        <h3>{singleGameData.name} JODI CHART</h3>
      </div>

      <div className="bg-warning m-1 border border-white py-3 text-center">
        <p>{description}</p>
      </div>

      <div className="border m-1 border-danger text-center" style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name} JODI CHART</h3>
      </div>

      {/* File Upload Section */}
      {userRole === "Admin" && (
        <div className="bg-light border border-dark p-3 m-2" style={{ borderRadius: "10px" }}>
          <h5>Import / Update Game Data (.json or .xlsx)</h5>

          <input
            type="file"
            accept=".json, .xlsx"
            onChange={(e) => setJsonFile(e.target.files[0])}
            className="form-control my-2"
          />

          <button onClick={handleFileUpload} className="btn btn-success" disabled={!jsonFile}>
            Upload & Update
          </button>
        </div>
      )}

      {/* TOP Result */}
      <div className="border m-1 border-danger text-center" style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name}</h3>
        <h3>
          {singleGameData.openNo?.length > 0 && singleGameData.closeNo?.length > 0
            ? singleGameData.openNo[0].slice(0, 2).join("-") + singleGameData.closeNo[0][1] + "-" + singleGameData.closeNo[0][0]
            : "N/A"}
        </h3>
      </div>
      
      {/* TABLE */}
      <MatkaTable  groupedData={groupedByDay} groupedDataOpen={groupedByDay_Open} titleNameHeading={singleGameData.name} noOfDays={singleGameData.noOfDays} />

      {/* BOTTOM Result */}
      <div className="border m-1 border-danger text-center" style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name}</h3>
        <h3>
          {singleGameData.openNo?.length > 0 && singleGameData.closeNo?.length > 0
            ? singleGameData.openNo[0].slice(0, 2).join("-") + singleGameData.closeNo[0][1] + "-" + singleGameData.closeNo[0][0]
            : "N/A"}
        </h3>
      </div>

      <ToastContainer />
    </div>
  );
};

export default JodiPanPage;