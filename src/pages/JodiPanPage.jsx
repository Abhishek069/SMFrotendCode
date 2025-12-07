import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MatkaTable from "../components/JodiMatkaTable";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
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
        setSingleGameData(data.data);
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
  // 🔥 EXCEL + JSON FILE UPLOAD HANDLER
  // ------------------------------------------------------------------
  const handleFileUpload = async () => {
    try {
      if (!jsonFile) {
        toast.warn("Please select a file first!");
        return;
      }

      const fileName = jsonFile.name.toLowerCase();
      let jsonData = null;

      // 1️⃣ If the file is JSON
      if (fileName.endsWith(".json")) {
        const fileText = await jsonFile.text();
        jsonData = JSON.parse(fileText);
      }

      // 2️⃣ If the file is Excel (.xlsx)
      else if (fileName.endsWith(".xlsx")) {
        const data = await jsonFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });

        // Convert first sheet to JSON
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);

        // (Optional) Log converted JSON
        console.log("📘 Converted Excel → JSON:", jsonData);
      }

      // Unsupported file
      else {
        toast.error("Only .json or .xlsx files are allowed!");
        return;
      }

      // 🚀 Send final JSON to backend
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

  // Grouping the result data by day
  const groupedByDay = (singleGameData.closeNo || []).reduce((acc, item) => {
    if (Array.isArray(item) && item.length >= 4) {
      const day = item[item.length - 1];
      const numbers = item.slice(0, -1);
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(numbers);
    }
    return acc;
  }, {});

  const groupedByDay_Open = (singleGameData.openNo || []).reduce((acc, item) => {
    if (Array.isArray(item) && item.length >= 4) {
      const day = item[item.length - 1];
      const numbers = item.slice(0, -1);
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(numbers);
    }
    return acc;
  }, {});

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

          <button
            onClick={handleFileUpload}
            className="btn btn-success"
            disabled={!jsonFile}
          >
            Upload & Update
          </button>
        </div>
      )}

      {/* TOP Result */}
      <div className="border m-1 border-danger text-center" style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name}</h3>
        <h3>
          {singleGameData.openNo?.length > 0 && singleGameData.closeNo?.length > 0
            ? singleGameData.openNo[0].slice(0, 2).join("-") +
              singleGameData.closeNo[0][1] +
              "-" +
              singleGameData.closeNo[0][0]
            : "N/A"}
        </h3>
      </div>

      {/* TABLE */}
      <MatkaTable
        groupedData={groupedByDay}
        groupedDataOpen={groupedByDay_Open}
        titleNameHeading={singleGameData.name}
      />

      {/* BOTTOM Result */}
      <div className="border m-1 border-danger text-center" style={{ backgroundColor: "Pink" }}>
        <h3>{singleGameData.name}</h3>
        <h3>
          {singleGameData.openNo?.length > 0 && singleGameData.closeNo?.length > 0
            ? singleGameData.openNo[0].slice(0, 2).join("-") +
              singleGameData.closeNo[0][1] +
              "-" +
              singleGameData.closeNo[0][0]
            : "N/A"}
        </h3>
      </div> 

      <ToastContainer />
    </div>
  );
};
 
export default JodiPanPage;
