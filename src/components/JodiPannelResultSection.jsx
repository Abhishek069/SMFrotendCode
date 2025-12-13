import React, { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
// import jwtDecode from "jwt-decode";
import { Await, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./Comman.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🔹 Small component for blinking notification messages
// 🔹 Small component for scrolling notification messages
// import { useEffect, , useState } from "react";

const ScrollingNotification = ({
  messages,
  color = "#ff0000",
  baseSpeed = 20, // seconds per 1000px
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const [animationDuration, setAnimationDuration] = useState(baseSpeed);

  if (!messages || messages.length === 0) return null;

  const text = messages.join(" • ");

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const contentWidth = contentRef.current?.scrollWidth || 0;

    // Make duration proportional to content length
    const distance = contentWidth + containerWidth;
    const duration = (distance / 1000) * baseSpeed; // baseSpeed = seconds per 1000px
    setAnimationDuration(duration);
  }, [text, baseSpeed]);

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: "inline-block",
          color,
          paddingLeft: "100%",
          animation: `scroll ${animationDuration}s linear infinite`,
        }}
      >
        <span style={{ paddingRight: "2rem" }}>{text}</span>
        <span style={{ paddingRight: "2rem" }}>{text}</span>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default function JodiPannelResultSection() {
  const token = localStorage.getItem("authToken");

  const [games, setGames] = useState([]);
  const [input1, setInput1] = useState("");
  const [allUser, setAllUser] = useState([]);
  const [input2, setInput2] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nameForPop, setNameForPop] = useState("");
  const [nameSizes, setNameSizes] = useState({});

  const [editGame, setEditGame] = useState({
    id: "",
    resultNo: "",
    openOrClose: "",
    day: "",
    date: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  // 🔹 New state for Admin functions
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("addGame");

  const [newGame, setNewGame] = useState({
    name: "",
    owner: "",
    resultNo: "111-11-111",
    noOfDays: "",
    startTime: "",
    status: "Active",
    endTime: "",
    nameColor: "#000000", // default black
    resultColor: "#000000", // default black
    panelColor: "#ffcb99", // default white
    notificationColor: "#ff0000", // default red
  });

  const [newAgent, setNewAgent] = useState({
    name: "",
    mobile: "",
    role: "",
    password: "",
    address: "",
  });

  const [editFullGame, setEditFullGame] = useState({
    _id: "",
    name: "",
    owner: "",
    noOfDays: "",
    startTime: "",
    endTime: "",
    resultNo: "",
    nameColor: "",
    resultColor: "",
    panelColor: "",
    notificationColor: "",
    status: "Active",
  });

  const [deleteGameName, setDeleteGameName] = useState("");
  const [linkForUpdateGame, setLinkForUpdateGame] = useState("");
  const [selectedStatus, setSelectedStatus] = useState();
  // const nowDateAndTime = new Date().toISOString();

  // ⭐ NEW STATES FOR RANGE RESULT MODAL ⭐
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeDays, setRangeDays] = useState([]);
  const [rangeData, setRangeData] = useState({});
  const [rangeGameId, setRangeGameId] = useState("");
  // errors for each date key, e.g. { "2025-01-25": "message" }
  const [rangeErrors, setRangeErrors] = useState({});

  // Add these state vars near other hooks
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteGameId, setDeleteGameId] = useState(""); // set to item._id if invoking from within a card
  const [deleteType, setDeleteType] = useState("Open");
  const [deleteDate, setDeleteDate] = useState("");

  // The function that calls backend
  const handleDeleteRecord = async () => {
    if (!deleteGameId) {
      toast.error("Select a game");
      return;
    }
    if (!deleteDate) {
      toast.error("Select a date");
      return;
    }
    if (!["Open", "Close"].includes(deleteType)) {
      toast.error("Select Open or Close");
      return;
    }

    // Confirmation
    if (
      !window.confirm(
        `Delete ${deleteType} records for ${deleteDate}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await api(`/AllGames/deleteRecord/${deleteGameId}`, {
        method: "PUT",
        body: JSON.stringify({ date: deleteDate, type: deleteType }),
      });

      if (res && res.success) {
        toast.success(res.message || "Record deleted");
        setShowDeleteModal(false);
        setDeleteDate("");
        setDeleteType("Open");
        setDeleteGameId("");
        fetchGamesAgain(); // refresh UI
      } else {
        toast.error(res?.message || "Failed to delete record");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting record");
    }
  };

  const rangeGame = games.find((g) => g._id === rangeGameId);
  const DatesForTheGame = [7, 6, 5];

  // 🔹 Handlers
  // const handleFormChange = (e) => {
  //   setNewGame({ ...newGame, [e.target.name]: e.target.value });
  // };

  // const handleAddGame = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await api("/AllGames/addGame", {
  //       method: "POST",
  //       body: JSON.stringify(newGame),
  //     });
  //     if (res.success) {
  //       toast.success("Game added successfully!");
  //       setShowModal(false);
  //       fetchGamesAgain();
  //       setNewGame({
  //         name: "",
  //         owner: "",
  //         resultNo: "",
  //         startTime: "",
  //         endTime: "",
  //         nameColor: "#000000",
  //         resultColor: "#000000",
  //         backgroundColor: "#ffcb99",
  //         notificationColor: "#ff0000",
  //       });
  //     } else {
  //       toast.success(res.error);
  //     }
  //   } catch (err) {
  //     console.error("Error adding game:", err);
  //   }
  // };

  const handleAddGame = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newGame };
      if (payload._id) delete payload._id; // defensive: never send _id on create

      const res = await api("/AllGames/addGame", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success("Game added successfully!");
        setShowModal(false);
        setNewGame({
          name: "",
          owner: "",
          resultNo: "",
          noOfDays: "",
          startTime: "",
          endTime: "",
          status: "Active",
          nameColor: "#000000",
          resultColor: "#000000",
          panelColor: "#ffcb99",
          notificationColor: "#ff0000",
        });
        fetchGamesAgain();
      } else {
        toast.error(res.error || res.message || "Failed to add game");
      }
    } catch (err) {
      console.error("Error adding game:", err);
      toast.error(err.message || "Error adding game");
    }
  };

  const collectAllUser = async () => {
    try {
      const res = await api("/user/");
      setAllUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/user/addUser", {
        method: "POST",
        body: JSON.stringify(newAgent),
      });

      // If backend sends success:false
      if (!res.success) {
        toast.error(res.message || res.error || "Failed to add agent");
        return;
      }

      toast.success("Agent added successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("Error adding agent:", err);
      console.log(err.response);

      // If err.response contains backend error (depends on your api wrapper)
      if (err.response) {
        const errorData = await err.response.json();

        toast.error(
          errorData.message || errorData.error || "Something went wrong!"
        );
      } else {
        console.log("ig");
        toast.error(err.message || "Something went wrong!");
      }
    }
  };

  // ⭐ Create continuous dates from start → end
  const getDatesBetween = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const list = [];
    let cur = new Date(s);

    while (cur <= e) {
      list.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return list;
  };

  // ⭐ Auto-update list whenever start or end changes
  useEffect(() => {
    if (rangeStart && rangeEnd && rangeGame) {
      const days = getDatesBetween(rangeStart, rangeEnd);
      setRangeDays(days);

      const obj = {};
      // console.log(days);

      days.forEach((d) => {
        const key = d.toISOString().split("T")[0];

        // find existing values
        const openVal = findResultForDate(rangeGame.openNo || [], key);
        const closeVal = findResultForDate(rangeGame.closeNo || [], key);

        // If both exist → show 2 separate entries
        // but your UI has one input per day
        // so we store whichever the user selects
        // console.log();

        obj[key] = {
          result: {
            open: openVal || "",
            close: closeVal || "",
          },
          type: openVal ? "Open" : closeVal ? "Close" : "Open",
        };
      });

      setRangeData(obj);
    }
  }, [rangeStart, rangeEnd, rangeGame]);

  const handleSaveRangeResults = async () => {
    if (!rangeGameId) {
      toast.error("Please select a game");
      return;
    }
    if (!rangeDays || rangeDays.length === 0) {
      toast.error("Please select a date range");
      return;
    }

    const errors = {};
    const preparedRows = [];
    console.log(rangeDays);

    for (const d of rangeDays) {
      const key = d.toISOString().split("T")[0];

      const entry = rangeData[key] || {
        result: { open: "", close: "" },
        type: "Open",
      };

      const raw =
        entry.type === "Open"
          ? (entry.result.open || "").trim()
          : (entry.result.close || "").trim();

      const validation = validateRangeEntry(raw);
      if (!validation.ok) {
        errors[key] = validation.msg;
        continue;
      }

      const mainDigits = validation.mainDigits;
      const providedCheck = validation.providedCheck;

      const computedCheck = computeCheckDigitFromDigits(mainDigits);
      const finalCheck = providedCheck !== null ? providedCheck : computedCheck;

      const type = entry.type === "Close" ? "Close" : "Open";
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

      preparedRows.push({
        key,
        date: d,
        mainDigits,
        checkDigit: finalCheck,
        type,
        dayName,
      });
    }

    if (Object.keys(errors).length > 0) {
      setRangeErrors(errors);
      const firstKey = Object.keys(errors)[0];
      toast.error(`Validation failed for ${firstKey}: ${errors[firstKey]}`);
      return;
    }

    setRangeErrors({});

    try {
      for (const r of preparedRows) {
        const payloadArray = [
          r.mainDigits,
          r.checkDigit,
          r.date.toISOString(),
          r.type,
          r.dayName,
        ];

        const response = await api(`/AllGames/updateGame/${rangeGameId}`, {
          method: "PUT",
          body: JSON.stringify({ resultNo: payloadArray }),
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to save");
        }
      }

      toast.success("All range results saved");

      // 🔥 keep modal open, do not reset fields
      fetchGamesAgain();
    } catch (err) {
      console.error("Error saving range results:", err);
      toast.error("Error saving range results: " + (err.message || err));
    }
  };

  const handleDeleteGame = async (e) => {
    e.preventDefault();
    try {
      await api(`/AllGames/deleteGame/${encodeURIComponent(deleteGameName)}`, {
        method: "DELETE",
      });
      toast.success("Game deleted successfully!");
      setShowModal(false);
      fetchGamesAgain();
      setDeleteGameName("");
    } catch (err) {
      console.error("Error deleting game:", err);
    }
  };

  const handleSetActiveInactive = async (e, gameId, newStatus) => {
    e.preventDefault();
    try {
      await api(`/AllGames/updateStatus/${gameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      toast.success(`Game status updated to ${newStatus}!`);
      setShowModal(false);
      fetchGamesAgain();
      setSelectedStatus();
      setSelectedGameId();
    } catch (err) {
      console.error("Error updating game status:", err);
      toast.error("Failed to update game status");
    }
  };

  const fetchAndUpdateGame = async (e) => {
    e.preventDefault();
    try {
      const response = await api("/AllGames/api/getGameFormLink", {
        method: "POST",
        body: JSON.stringify({
          url: linkForUpdateGame,
          userName: username,
          admin: role,
        }),
      });
      if (response.success) {
        toast.success("Games updated successfully!");
      } else {
        toast.error("Failed: " + response.error);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error updating from link:", err);
    }
  };

  let username = null;
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
      username = decoded.username;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const navigate = useNavigate();

  const fetchGamesAgain = async () => {
    try {
      const data = await api("/AllGames/");
      if (data.success) {
        setGames(data.data);

        const sizes = {};
        data.data.forEach((game) => {
          sizes[game._id] = game.fontSize || 18;
        });
        setNameSizes(sizes);
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGameDetails = (gameId) => {
    const g = games.find((x) => x._id === gameId);
    if (!g) return;

    setEditFullGame({
      _id: g._id,
      name: g.name,
      owner: g.owner,
      startTime: g.startTime,
      endTime: g.endTime,
      resultNo: g.resultNo || "",
      nameColor: g.nameColor || "#000000",
      resultColor: g.resultColor || "#000000",
      panelColor: g.panelColor || "#ffffff",
      notificationColor: g.notificationColor || "#ff0000",
      status: g.status,
    });
  };

  const handleFullUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api(`/AllGames/updateFull/${editFullGame._id}`, {
        method: "PUT",
        body: JSON.stringify(editFullGame),
      });

      if (res.success) {
        toast.success("Game updated successfully!");
        fetchGamesAgain();
        setShowModal(false);
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch ({ err }) {
      toast.error("Error updating game", err);
    }
  };

  useEffect(() => {
    fetchGamesAgain();
    collectAllUser();
  }, []);

  if (loading) return <div>Loading games...</div>;
  if (error) return <div>Error: {error}</div>;

  // const filteredAndSortedGames = games
  //   .filter((item) => {
  //     if (!item.startTime) return false; // skip if no startTime
  //     const startDate = getStartTimeAsDate(item.startTime);
  //     return startDate >= new Date(); // only future or ongoing
  //   })
  //   .sort((a, b) => {
  //     const startA = getStartTimeAsDate(a.startTime);
  //     const startB = getStartTimeAsDate(b.startTime);
  //     return startA - startB; // ascending: closest time first
  //   });
  // const sortedGames = [...games].sort((a, b) => {
  //   const diffA = Math.abs(getStartTimeAsDate(a.startTime) - new Date());
  //   const diffB = Math.abs(getStartTimeAsDate(b.startTime) - new Date());
  //   return diffA - diffB; // closest to now first
  // });
  const sortedGames = [...games].sort((a, b) => {
    const diffA = getNearestGameTime(a);
    const diffB = getNearestGameTime(b);

    return diffA - diffB;
  });

  function timeToTodayDate(timeStr) {
    if (!timeStr) return null;

    const now = new Date();
    const [h, m] = timeStr.split(":").map(Number);

    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  }

  function getNearestGameTime(game) {
    const now = new Date();

    const start = timeToTodayDate(game.startTime);
    const end = timeToTodayDate(game.endTime);

    const DAY = 24 * 60 * 60 * 1000;

    const normalize = (t) => {
      if (!t) return Infinity;
      let diff = t - now;
      if (diff < 0) diff += DAY; // push past times to next day
      return diff;
    };

    const startDiff = normalize(start);
    const endDiff = normalize(end);

    return Math.min(startDiff, endDiff);
  }

  const handleSaveFontSize = async (gameId) => {
    try {
      const response = await api(`/AllGames/saveFontSize/${gameId}`, {
        method: "PUT",
        body: JSON.stringify({ fontSize: nameSizes[gameId] }),
      });

      if (response.success) {
        toast.success("Font size saved successfully!");
      } else {
        toast.error("Failed to save font size: " + response.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving font size");
    }
  };

  const handleEditClick = (game) => {
    const today_date = new Date();
    const dayName = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    setEditGame({
      id: game._id,
      resultNo: "",
      openOrClose: "",
      day: dayName,
      date: today_date,
    });
    setShowEditModal(true);
    setNameForPop(game.name);
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    const gameId = editGame.id;

    if (editGame.openOrClose === "Edit Color") {
      // 🔹 Handle color update
      try {
        const updateData = await api(`/AllGames/updateColor/${gameId}`, {
          method: "PUT",
          body: JSON.stringify({
            nameColor: editGame.nameColor || "#000000",
            resultColor: editGame.resultColor || "#000000",
            panelColor: editGame.panelColor || "#ffcb99",
            notificationColor: editGame.notificationColor || "#ff0000",
            noOfDays: editGame.noOfDays,
          }),
        });

        if (updateData.success) {
          fetchGamesAgain();
          // setShowEditModal(false);
          toast.success("Game colors updated successfully!");
        } else {
          toast.error("Failed to update colors: " + updateData.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error updating colors");
      }
    } else if (editGame.openOrClose === "Add Notification") {
      // 🔹 Handle notification update
      try {
        const updateData = await api(`/AllGames/updateNotification/${gameId}`, {
          method: "PUT",
          body: JSON.stringify({
            notificationMessage: [input1 || "", input2 || ""],
          }),
        });

        if (updateData.success) {
          toast.success("Notification updated successfully!");
          setShowEditModal(false);
          fetchGamesAgain();
        } else {
          toast.error("Failed to update notification: " + updateData.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error updating notification");
      }
    } else if (editGame.openOrClose === "Set Live Time") {
      try {
        const response = await api(`/AllGames/setLiveTime/${editGame.id}`, {
          method: "PUT",
          body: JSON.stringify({ liveTime: selectedTime }),
        });
        if (response.success) {
          toast.success("Live time set successfully!");
          setShowLiveModal(false);
          fetchGamesAgain();
          setSelectedTime("");
        } else {
          toast.error("Failed: " + response.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error setting live time");
      }
    } else {
      // 🔹 Handle Open/Close result number update
      const inputValue = editGame.resultNo || "";
      const parts = inputValue.split("-").map((num) => num.trim());
      if (
        inputValue.length === 5 &&
        parts[0].length !== 3 &&
        !inputValue.includes("-")
      ) {
        toast.error("Invalid format. Please enter a number like 123-7.");
        return;
      }
      if (parts.length === 0 || !/^\d+$/.test(parts[0])) {
        toast.error("Invalid format. Please enter a number like 123-7.");
        return;
      }

      const mainNumber = parts[0];
      const providedCheckDigit = parts[1];

      // if (mainNumber.length >= 2) {
      //   const firstDigit = parseInt(mainNumber[0], 10);
      //   const secondDigit = parseInt(mainNumber[1], 10);
      //   const thirdDigit = parseInt(mainNumber[2], 10);

      //   if (secondDigit !== 0 || thirdDigit !== 0) {
      //     if (firstDigit > secondDigit || secondDigit > thirdDigit) {
      //       toast.error(
      //         "Invalid number: first digit must be smaller than second digit."
      //       );
      //       return;
      //     }
      //   }
      // }

      if (mainNumber.length >= 3) {
        const d1 = parseInt(mainNumber[0], 10);
        const d2 = parseInt(mainNumber[1], 10);
        const d3 = parseInt(mainNumber[2], 10);

        // 0 => 10 everywhere
        const firstDigit = d1 === 0 ? 10 : d1;
        const secondDigit = d2 === 0 ? 10 : d2;
        const thirdDigit = d3 === 0 ? 10 : d3;

        if (!(firstDigit <= secondDigit && secondDigit <= thirdDigit)) {
          toast.error(
            "Invalid number Please check or contact operator : First < Second < Third"
          );
          return;
        }
      }

      if (mainNumber.length >= 3) {
        const lastThree = mainNumber.slice(-3).split("").map(Number);
        const sum = lastThree.reduce((a, b) => a + b, 0);
        const expectedCheckDigit = sum % 10;

        if (
          providedCheckDigit &&
          parseInt(providedCheckDigit, 10) !== expectedCheckDigit
        ) {
          toast.error(
            `Invalid number: check digit should be ${expectedCheckDigit} (sum of last 3 digits).`
          );
          return;
        }
      }

      const newResultArray = [mainNumber];
      if (providedCheckDigit) newResultArray.push(providedCheckDigit);
      if (editGame.openOrClose) {
        newResultArray.push(editGame.date, editGame.openOrClose, editGame.day);
      }

      try {
        const updateData = await api(`/AllGames/updateGame/${gameId}`, {
          method: "PUT",
          body: JSON.stringify({ resultNo: newResultArray }),
        });

        if (updateData.success) {
          toast.success("Game Number updated successfully!");
          setShowEditModal(false);
          fetchGamesAgain();
        } else {
          toast.error("Failed to update game: " + updateData.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error updating game");
      }
    }
  };

  function getStartTimeAsDate(startTimeStr) {
    const now = new Date();
    const [hours, minutes] = startTimeStr.split(":").map(Number);
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );
  }

  function isOlderThan12Hours(dateString) {
    // console.log(dateString,name);

    const updated = new Date(dateString);
    const now = new Date();
    const diffMs = now - updated; // difference in milliseconds
    const hours = diffMs / (1000 * 60 * 60); // convert to hours

    return hours >= 24;
  }

  function getLatestEntry(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;

    // Sort by date field at index 2
    const sorted = [...arr].sort((a, b) => new Date(b[2]) - new Date(a[2]));

    return sorted[0]; // latest
  }

  const getDisplayResult = (item) => {
    const lastOpen = getLatestEntry(item.openNo);
    const lastClose = getLatestEntry(item.closeNo);

    if (!lastOpen && !lastClose) return "***-**-***";

    const openMain = lastOpen?.[0] || "";
    const openDigit = lastOpen?.[1] || "";
    const openTime = lastOpen?.[2] || "";
    const openDay = lastOpen?.[4] || "";

    const closeMain = lastClose?.[0] || "";
    const closeDigit = lastClose?.[1] || "";
    const closeTime = lastClose?.[2] || "";
    const closeDay = lastClose?.[4] || "";

    // If same date and same day, show combined
    if (
      lastOpen &&
      lastClose &&
      openDay === closeDay &&
      openTime.split("T")[0] === closeTime.split("T")[0]
    ) {
      return `${openMain}-${openDigit}${closeDigit}-${closeMain}`;
    }

    if (lastOpen && (!lastClose || new Date(openTime) > new Date(closeTime))) {
      return `${openMain}-${openDigit}`;
    }

    if (lastClose && (!lastOpen || new Date(closeTime) > new Date(openTime))) {
      return `${closeMain}-${closeDigit}`;
    }

    return "***-**-***";
  };

  // const canEditGame = (game, role, username) => {
  //   if (role === "Admin") return true;
  //   return game.owner === username;
  // };

  const findResultForDate = (list, dateKey) => {
    // dateKey = "2025-01-25"
    const match = list.find((entry) => entry[2].slice(0, 10) === dateKey);
    if (!match) return null;
    return match[0] + "-" + match[1]; // example: "123-4"
  };

  // Normalize digits-only main number from the user input (remove non-digits)
  const digitsOnly = (s = "") => (s ? s.toString().replace(/[^0-9]/g, "") : "");

  // compute check digit same as backend: sum of last 3 digits % 10
  const computeCheckDigitFromDigits = (digitsStr) => {
    if (!digitsStr) return 0;
    const arr = digitsStr
      .slice(-3)
      .split("")
      .map((c) => parseInt(c || "0", 10));
    const sum = arr.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
    return sum % 10;
  };

  // Validate a single user-entered string for a date.
  // Accepts formats like "111", "111-3", or "111-22-333" (we only consider digits)
  function validateRangeEntry(rawStr) {
    if (!rawStr || typeof rawStr !== "string") {
      return { ok: false, msg: "Empty value" };
    }

    // If user provided a check-digit explicitly like "123-4", capture it
    // We'll treat the last hyphen-separated part as possible check digit only if it's a single digit.
    const parts = rawStr
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);
    let providedCheck = null;
    if (parts.length >= 2 && /^[0-9]$/.test(parts[parts.length - 1])) {
      providedCheck = parts[parts.length - 1];
      // main part is everything except last hyphen-piece
      parts.pop();
    }

    // Now join remaining parts to build the main number (still may contain internal hyphens, but we'll strip non-digits)
    const mainCandidate = parts.join("");
    const mainDigits = digitsOnly(mainCandidate);

    if (!/^\d+$/.test(mainDigits) || mainDigits.length === 0) {
      return { ok: false, msg: "Result must contain digits" };
    }

    // If length >= 2: first < second (backend checks first >= second -> invalid)
    if (mainDigits.length >= 2) {
      const first = parseInt(mainDigits[0], 10);
      const second = parseInt(mainDigits[1], 10);
      if (second !== 0) {
        if (first > second) {
          return {
            ok: false,
            msg: "Invalid number: first digit must be smaller than second digit",
          };
        }
      }
    }

    // If length >= 3: check-digit logic
    if (mainDigits.length >= 3) {
      const expected = computeCheckDigitFromDigits(mainDigits);
      if (providedCheck !== null) {
        if (parseInt(providedCheck, 10) !== expected) {
          return {
            ok: false,
            msg: `Invalid check digit: expected ${expected}`,
          };
        }
      }
      // if providedCheck == null it's fine — we'll send computed check digit later
    }

    // all good
    return { ok: true, mainDigits, providedCheck };
  }

  const handlePageChange = (game, value) => {
    if (value !== "panel") {
      navigate(`/JodiPanPage/${game._id}`);
    } else {
      navigate(`/PanelPage/${game._id}`);
    }
  };

  return (
    <div
      className=" border border-white p-0.5" // <--- 'm-1' and 'p-3' create space
      style={{ backgroundColor: "#ffcc99", width: "100%" }}
    >
      <div className="bg-pink m-1 p-2 jodi-panel-container-second">
        <h3>SABSE PAHILE OR SABSE SAHI FAST SATTA MATKA RESULT</h3>
      </div>
      {role === "Admin" && (
        <div className="mb-3">
          <button
            className="btn btn-success m-1"
            onClick={() => {
              setModalType("addGame");

              // Clear newGame so you don't send a stale _id or other values
              setNewGame({
                name: "",
                owner: "",
                resultNo: "111-11-111",
                noOfDays: "",
                startTime: "",
                status: "Active",
                endTime: "",
                nameColor: "#000000",
                resultColor: "#000000",
                panelColor: "#ffcb99",
                notificationColor: "#ff0000",
              });

              // Clear any selected edit state so edit modal doesn't show stale data
              setEditFullGame({
                _id: "",
                name: "",
                owner: "",
                noOfDays: "",
                startTime: "",
                endTime: "",
                resultNo: "",
                nameColor: "",
                resultColor: "",
                panelColor: "",
                notificationColor: "",
                status: "Active",
              });

              setShowModal(true);
            }}
          >
            ADD GAME
          </button>

          <button
            className="btn btn-outline-danger m-1"
            onClick={() => {
              setModalType("deleteRecord");
              setShowDeleteModal(true);
              // optional: setDeleteGameId(defaultGameIdIfAny)
            }}
          >
            Delete Record
          </button>
          <button
            className="btn btn-dark m-1"
            onClick={() => setShowRangeModal(true)}
          >
            ADD RANGE RESULT
          </button>
          <button
            className="btn btn-secondary m-1"
            onClick={() => {
              setModalType("addAgent");
              setShowModal(true);
            }}
          >
            ADD AGENT
          </button>
          <button
            className="btn btn-danger m-1"
            onClick={() => {
              setModalType("delete");
              setShowModal(true);
            }}
          >
            DELETE
          </button>
          <button
            className="btn btn-info m-1"
            onClick={() => {
              setModalType("import");
              setShowModal(true);
            }}
          >
            Import By Link
          </button>
          <button
            className="btn btn-warning m-1"
            onClick={() => {
              setModalType("editFullGame");
              setShowModal(true);
            }}
          >
            EDIT GAME
          </button>
        </div>
      )}

      {role === "Agent" && (
        <div className="mb-3">
          <button
            className="btn btn-dark m-1"
            onClick={() => setShowRangeModal(true)}
          >
            ADD RANGE RESULT
          </button>
        </div>
      )}

      {/* If the role is neither "Admin" nor "Agent", nothing will be rendered here. */}
      {sortedGames
        // Filter logic: Admin sees all, User/Agent only see active
        .filter((item) => {
          if (role === "Admin") return true;
          return item.status === "Active";
        })
        .map((item, index) => {
          // ✅ Function to decide whether to show Loading or actual result

          const getDisplayResultOrLoading = (item) => {
            const now = new Date();

            // Parse startTime in "HH:mm" format
            let startTime = null;
            if (item.startTime) {
              const [hours, minutes] = item.startTime.split(":").map(Number);
              startTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                hours,
                minutes,
                0
              );
            }

            // Show loading if startTime is invalid
            if (!startTime || isNaN(startTime.getTime())) {
              return <p style={{ color: "#ff0000" }}>Loading...</p>;
            }

            const tenMinutesBeforeStart = new Date(
              startTime.getTime() - 10 * 60 * 1000
            );

            // Show loading if current time is before startTime - 10min OR result not available
            if (now >= tenMinutesBeforeStart && now <= startTime) {
              return <p style={{ color: "#ff0000" }}>Loading...</p>;
            }

            // Show actual result if available
            if (
              (Array.isArray(item.openNo) && item.openNo.length > 0) ||
              (Array.isArray(item.resultNo) && item.resultNo.length > 0)
            ) {
              return (
                <p style={{ color: item.resultColor || "#000000" }}>
                  {getDisplayResult(item)}
                </p>
              );
            }

            // Fallback
            return <p style={{ color: "#000000" }}>No numbers</p>;
          };

          const displayResult = getDisplayResultOrLoading(item);

          return (
            <div
              className="jodi-panel-container jodi-panel-container-second p-1"
              key={item._id || index}
              style={{ backgroundColor: item.panelColor || "" }}
            >
              {/* Top Record button */}
              <button
                className="btn btn-sm btn-primary button-jodi-panel"
                style={{
                  height: "125px",
                  width: "30px",
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                  textAlign: "center",
                  padding: "5px",
                  borderRadius: "15px",
                }}
                onClick={() => handlePageChange(item)}
              >
                Record
              </button>

              <div style={{ width: "70%", maxWidth: "80%" }}>
                <div>
                  {role === "Admin" ? (
                    <>
                      <h4
                        style={{
                          fontSize: `${nameSizes[item._id] || 18}px`,
                          color: item.nameColor || "#000000",
                          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {item.name}
                      </h4>
                      <input
                        type="range"
                        min="12"
                        max="27"
                        value={nameSizes[item._id] || 18}
                        onChange={(e) =>
                          setNameSizes({
                            ...nameSizes,
                            [item._id]: Number(e.target.value),
                          })
                        }
                      />
                      <span className="ml-2">
                        {nameSizes[item._id] || 18}px
                      </span>
                      <button
                        className="btn btn-success btn-sm "
                        onClick={() => handleSaveFontSize(item._id)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <h4
                        style={{
                          fontSize: `${nameSizes[item._id] || 18}px`,
                          color: item.nameColor || "#000000",
                          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {item.name}
                      </h4>
                    </>
                  )}
                </div>

                {/* ✅ Result or Loading */}
                <h5
                  style={{
                    color: item.resultColor || "#000000",
                    padding: "0px",
                    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
                    fontSize: "28px",
                  }}
                >
                  {isOlderThan12Hours(item.openNo[0]?.[2], item.name)
                    ? "***-**-***"
                    : displayResult}
                </h5>
                {/* Action Buttons (Edit / Set Live Time) */}
                <div className="d-flex justify-content-center mt-0 gap-1">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEditClick(item)}
                    hidden={
                      !(
                        role === "Admin" ||
                        (role === "Agent" && item.owner === username)
                      )
                    }
                    disabled={new Date(item.valid_date).getTime() < Date.now()}
                  >
                    EDIT
                  </button>

                  <button
                    className={`btn m-1 ${
                      item.status === "Active" ? "btn-success" : "btn-danger"
                    }`}
                    onClick={(e) => {
                      handleSetActiveInactive(
                        e,
                        item._id,
                        item.status === "Active" ? "InActive" : "Active"
                      );
                      // setModalType("Set Active Inactive");
                      // setShowModal(true);
                    }}
                    hidden={
                      !(
                        role === "Admin" ||
                        (role === "Agent" && item.owner === username)
                      )
                    }
                  >
                    {item.status === "Active" ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Game timing info */}
                <div className="timeStamp-for-jodi-panel">
                  <p
                    style={{
                      color: item.nameColor || "#000000",
                      marginRight: "15px",
                    }}
                  >
                    {item.startTime}
                  </p>
                  {role === "Admin" && (
                    <p
                      style={{
                        color: item.nameColor || "#000000",
                        marginRight: "15px",
                      }}
                    >
                      {item.liveTime}
                    </p>
                  )}

                  <p
                    style={{
                      color: item.nameColor || "#000000",
                      marginLeft: "15px",
                    }}
                  >
                    {item.endTime}
                  </p>
                </div>
                <div style={{ maxWidth: "100%", width: "100%" }}>
                  {Array.isArray(item.Notification_Message) &&
                  item.Notification_Message.length > 0 ? (
                    <ScrollingNotification
                      messages={item.Notification_Message}
                      interval={6000}
                      color={item.notificationColor || "#ff0000"}
                      speed={10}
                    />
                  ) : null}
                </div>
              </div>

              {/* Bottom Record button */}
              <button
                onClick={() => handlePageChange(item, "panel")}
                style={{
                  height: "125px",
                  width: "30px",
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                  textAlign: "center",
                  padding: "5px",
                  borderRadius: "15px",
                }}
                className="btn btn-sm btn-primary button-jodi-panel"
              >
                Record
              </button>
            </div>
          );
        })}

      {showModal && (
        <div className="AddGameModelMainContainer">
          <div className="AddGameModelSeconContainer">
            {modalType === "addGame" && (
              <form onSubmit={handleAddGame}>
                <h3>Add Game</h3>
                {/* Game Name */}
                <input
                  name="name"
                  placeholder="Game Name"
                  value={newGame.name}
                  onChange={(e) =>
                    setNewGame({ ...newGame, name: e.target.value })
                  }
                  required
                />

                {/* Owner */}
                <label>Owner</label>
                <select
                  name="owner"
                  value={newGame.owner}
                  onChange={(e) =>
                    setNewGame({ ...newGame, owner: e.target.value })
                  }
                  required
                  className="form-control"
                >
                  <option value="">-- Select Owner --</option>
                  {allUser.map((agent) => (
                    <option key={agent._id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>

                <label>No Of Days</label>
                <select
                  name="owner"
                  value={newGame.noOfDays}
                  onChange={(e) =>
                    setNewGame({ ...newGame, noOfDays: e.target.value })
                  }
                  required
                  className="form-control"
                >
                  <option value="">-- No Of Days --</option>
                  {DatesForTheGame.map((agent, id) => (
                    <option key={id} value={agent}>
                      {agent}
                    </option>
                  ))}
                </select>

                {/* Start Time */}
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={newGame.startTime}
                  onChange={(e) =>
                    setNewGame({ ...newGame, startTime: e.target.value })
                  }
                  required
                />

                {/* End Time */}
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={newGame.endTime}
                  onChange={(e) =>
                    setNewGame({ ...newGame, endTime: e.target.value })
                  }
                  required
                />

                {/* Result Number */}
                <input
                  name="resultNo"
                  placeholder="Result No (e.g. 111-33-555)"
                  value={newGame.resultNo}
                  onChange={(e) =>
                    setNewGame({ ...newGame, resultNo: e.target.value })
                  }
                />

                {/* 🎨 Colors */}
                <label>Game Name Color</label>
                <input
                  type="color"
                  value={newGame.nameColor}
                  onChange={(e) =>
                    setNewGame({ ...newGame, nameColor: e.target.value })
                  }
                />

                <label>Result Color</label>
                <input
                  type="color"
                  value={newGame.resultColor}
                  onChange={(e) =>
                    setNewGame({ ...newGame, resultColor: e.target.value })
                  }
                />

                <label>Panel Color</label>
                <input
                  type="color"
                  value={newGame.panelColor}
                  onChange={(e) =>
                    setNewGame({
                      ...newGame,
                      panelColor: e.target.value,
                    })
                  }
                />

                <label>Notification Color</label>
                <input
                  type="color"
                  value={newGame.notificationColor}
                  onChange={(e) =>
                    setNewGame({
                      ...newGame,
                      notificationColor: e.target.value,
                    })
                  }
                />

                <div className="mt-2">
                  <button
                    type="submit"
                    className="btn btn-success m-1 addGame-Save-button"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ml-2 m-4 addGame-Save-button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modalType === "addAgent" && (
              <form onSubmit={handleAddAgent} className="overflow-auto">
                <h3>Add Agent</h3>
                <input
                  name="name"
                  placeholder="Name"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                  required
                />
                <input
                  name="mobile"
                  placeholder="Mobile"
                  value={newAgent.mobile}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, mobile: e.target.value })
                  }
                  required
                />
                <input
                  name="password"
                  placeholder="Password"
                  type="password"
                  value={newAgent.password}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, password: e.target.value })
                  }
                  required
                />
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={newAgent.role}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, role: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select Role --</option>
                  <option value="Agent">Agent</option>
                  <option value="Admin">Admin</option>
                </select>

                <input
                  name="address"
                  placeholder="Address"
                  value={newAgent.address}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, address: e.target.value })
                  }
                  required
                />
                <div className="mt-2">
                  <button type="submit" className="btn btn-success m-1">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ml-2 m-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modalType === "delete" && (
              <form onSubmit={handleDeleteGame} className="over">
                <h3>Delete Game</h3>
                <select
                  className="form-control"
                  value={deleteGameName}
                  onChange={(e) => setDeleteGameName(e.target.value)}
                  required
                >
                  <option value="">-- Select a game to delete --</option>
                  {games.map((game) => (
                    <option key={game._id} value={game.name}>
                      {game.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </form>
            )}

            {modalType === "Set Active Incative" && (
              <form
                onSubmit={(e) =>
                  handleSetActiveInactive(e, selectedGameId, selectedStatus)
                }
                className="over"
              >
                <h3>Set Active / Inactive</h3>

                {/* Select Game */}
                <select
                  className="form-control mb-2"
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  required
                >
                  <option value="">-- Select a game --</option>
                  {games.map((game) => (
                    <option key={game._id} value={game._id}>
                      {game.name}
                    </option>
                  ))}
                </select>

                {/* Select Status */}
                <select
                  className="form-control mb-2"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  required
                >
                  <option value="">-- Select status --</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Buttons */}
                <div className="d-flex justify-content-between mt-3">
                  <button type="submit" className="btn btn-success">
                    Update Status
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modalType === "import" && (
              <form onSubmit={fetchAndUpdateGame}>
                <h3>Import Games By Link</h3>
                <input
                  placeholder="Paste link here"
                  value={linkForUpdateGame}
                  onChange={(e) => setLinkForUpdateGame(e.target.value)}
                />
                <button type="submit" className="btn btn-info">
                  Import
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </form>
            )}
            {modalType === "editFullGame" && (
              <form onSubmit={handleFullUpdate} className="overflow-auto">
                <h3>Edit Game</h3>

                {/* Select Game */}
                <select
                  className="form-control"
                  onChange={(e) => loadGameDetails(e.target.value)}
                >
                  <option value="">-- Select Game --</option>
                  {games.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>

                {editFullGame._id && (
                  <>
                    <input
                      placeholder="Name"
                      value={editFullGame.name}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          name: e.target.value,
                        })
                      }
                    />

                    <label>Owner</label>
                    <select
                      className="form-control"
                      value={editFullGame.owner}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          owner: e.target.value,
                        })
                      }
                    >
                      {allUser.map((u) => (
                        <option key={u._id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>

                    <label>No Of Days</label>
                    <select
                      name="noOfDays"
                      value={editFullGame.noOfDays}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          noOfDays: e.target.value,
                        })
                      }
                      className="form-control"
                    >
                      <option value="">-- No Of Days --</option>
                      {DatesForTheGame.map((agent, id) => (
                        <option key={id} value={agent}>
                          {agent}
                        </option>
                      ))}
                    </select>

                    <label>Start Time</label>
                    <input
                      type="time"
                      value={editFullGame.startTime}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          startTime: e.target.value,
                        })
                      }
                    />

                    <label>End Time</label>
                    <input
                      type="time"
                      value={editFullGame.endTime}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          endTime: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Result No"
                      value={editFullGame.resultNo}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          resultNo: e.target.value,
                        })
                      }
                    />

                    <label>Name Color</label>
                    <input
                      type="color"
                      value={editFullGame.nameColor}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          nameColor: e.target.value,
                        })
                      }
                    />

                    <label>Result Color</label>
                    <input
                      type="color"
                      value={editFullGame.resultColor}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          resultColor: e.target.value,
                        })
                      }
                    />

                    <label>Panel Color</label>
                    <input
                      type="color"
                      value={editFullGame.panelColor}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          panelColor: e.target.value,
                        })
                      }
                    />

                    <label>Notification Color</label>
                    <input
                      type="color"
                      value={editFullGame.notificationColor}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          notificationColor: e.target.value,
                        })
                      }
                    />

                    <label>Status</label>
                    <select
                      className="form-control"
                      value={editFullGame.status}
                      onChange={(e) =>
                        setEditFullGame({
                          ...editFullGame,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                    <button className="btn btn-success mt-3">
                      Save Changes
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="btn btn-secondary mt-3"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="AddGameModelMainContainer">
          <div className="AddGameModelSeconContainer">
            <h3>Delete Record</h3>

            {/* Select Game */}
            <label>Game</label>
            <select
              className="form-control"
              value={deleteGameId}
              onChange={(e) => setDeleteGameId(e.target.value)}
            >
              <option value="">-- Select game --</option>
              {games.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Type */}
            <label>Type</label>
            <select
              className="form-control"
              value={deleteType}
              onChange={(e) => setDeleteType(e.target.value)}
            >
              <option value="Open">Open</option>
              <option value="Close">Close</option>
            </select>

            {/* Date */}
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={deleteDate}
              onChange={(e) => setDeleteDate(e.target.value)}
            />

            <div className="mt-3">
              <button className="btn btn-danger" onClick={handleDeleteRecord}>
                Delete
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRangeModal && (
        <div className="AddGameModelMainContainer">
          <div className="AddGameModelSeconContainer">
            <h3>Add Range Results</h3>

            {/* Select Game */}
            <label>Select Game</label>
            <select
              className="form-control"
              value={rangeGameId}
              onChange={(e) => setRangeGameId(e.target.value)}
            >
              <option value="">-- Select Game --</option>
              {games
                .filter((g) => role === "Admin" || g.owner === username)
                .map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
            </select>

            {/* Start & End Date */}
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
            />

            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
            />

            {/* Generated Inputs */}
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {rangeDays.map((d) => {
                const key = d.toISOString().split("T")[0];
                const row = rangeData[key] || { result: "", type: "Open" };
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ minWidth: 220 }}>
                      {key} (
                      {d.toLocaleDateString("en-US", { weekday: "long" })})
                    </div>

                    <input
                      type="text"
                      maxLength={5}
                      placeholder="111-3"
                      value={
                        row.type === "Open" ? row.result.open : row.result.close
                      }
                      onChange={(e) =>
                        setRangeData({
                          ...rangeData,
                          [key]: {
                            ...row,
                            result: {
                              ...row.result,
                              [row.type === "Open" ? "open" : "close"]:
                                e.target.value,
                            },
                          },
                        })
                      }
                    />

                    <select
                      value={row.type || "Open"}
                      onChange={(e) =>
                        setRangeData({
                          ...rangeData,
                          [key]: { ...row, type: e.target.value },
                        })
                      }
                    >
                      <option value="Open">Open</option>
                      <option value="Close">Close</option>
                    </select>

                    {/* Inline error for this row */}
                    {rangeErrors[key] && (
                      <div style={{ color: "red", marginLeft: 8 }}>
                        {rangeErrors[key]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-success mt-3"
              onClick={handleSaveRangeResults}
            >
              Save All
            </button>
            <button
              className="btn btn-secondary mt-3 ms-2"
              onClick={() => setShowRangeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal for Results */}
      {showLiveModal && (
        <div className="AddGameModelMainContainer overflow-auto">
          <div className="AddGameModelSeconContainer">
            <h4>Set On time Live Time</h4>
            <input
              type="number"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
            <div className="button-group mt-3">
              <button
                className="btn btn-success"
                onClick={async () => {
                  try {
                    const response = await api(
                      `/AllGames/setLiveTime/${selectedGameId}`,
                      {
                        method: "PUT",
                        body: JSON.stringify({ liveTime: selectedTime }),
                      }
                    );
                    if (response.success) {
                      toast.success("Live time set successfully!");
                      setShowLiveModal(false);
                      fetchGamesAgain();
                      setSelectedTime("");
                    } else {
                      toast.error("Failed: " + response.message);
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Error setting live time");
                  }
                }}
              >
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowLiveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="AddGameModelMainContainer overflow-auto">
          <div className="AddGameModelSeconContainer">
            <h2>{nameForPop}</h2>
            <form onSubmit={handleUpdateGame}>
              <div className="form-group">
                <label htmlFor="openOrClose">Action</label>
                <select
                  id="openOrClose"
                  value={editGame.openOrClose}
                  onChange={(e) =>
                    setEditGame({ ...editGame, openOrClose: e.target.value })
                  }
                  required
                >
                  <option value="">Select Action</option>
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                  <option value="Add Notification">Add Notification</option>
                  <option value="Edit Color">Edit Color</option>
                  <option value="Set Live Time">Set Live Time</option>
                </select>
              </div>

              {editGame.openOrClose === "Add Notification" && (
                <div>
                  <label>Notification 1</label>
                  <input
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                  />
                  <label>Notification 2</label>
                  <input
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                  />
                </div>
              )}

              {(editGame.openOrClose === "Open" ||
                editGame.openOrClose === "Close") && (
                <div>
                  <label>Result No</label>
                  <input
                    type="text"
                    placeholder="e.g. 111-3"
                    value={editGame.resultNo}
                    onChange={(e) =>
                      setEditGame({ ...editGame, resultNo: e.target.value })
                    }
                  />
                </div>
              )}

              {editGame.openOrClose === "Edit Color" && (
                <div>
                  <label>Game Name Color</label>
                  <input
                    type="color"
                    value={editGame.nameColor || ""}
                    onChange={(e) =>
                      setEditGame({ ...editGame, nameColor: e.target.value })
                    }
                  />
                  <label>Result Color</label>
                  <input
                    type="color"
                    value={editGame.resultColor || ""}
                    onChange={(e) =>
                      setEditGame({ ...editGame, resultColor: e.target.value })
                    }
                  />
                  <label>Panel Color</label>
                  <input
                    type="color"
                    value={editGame.panelColor || "#ffcb99"}
                    onChange={(e) =>
                      setEditGame({ ...editGame, panelColor: e.target.value })
                    }
                  />
                  <label>Notification Color</label>
                  <input
                    type="color"
                    value={editGame.notificationColor || "#ff0000"}
                    onChange={(e) =>
                      setEditGame({
                        ...editGame,
                        notificationColor: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {editGame.openOrClose === "Set Live Time" && (
                <div>
                  <label>Live Time</label>
                  <input
                    type="number"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              )}

              <div className="button-group mt-3">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
