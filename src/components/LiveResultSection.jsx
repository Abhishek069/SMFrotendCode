import React, { useEffect, useState } from "react";
import LiveResultItem from "./LiveResultItem";
import { api } from "../lib/api";

const LiveResultSection = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function isOlderThan12Hours(dateString) {
    const updated = new Date(dateString);
    const now = new Date();
    const diffMs = now - updated;
    const hours = diffMs / (1000 * 60 * 60);
    return hours >= 24;
  }

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await api("/AllGames/latest-updates");

        if (data && data.hasData && Array.isArray(data.data)) {
          const formatted = data.data.map((game) => {
            const now = new Date();

            // TIME FROM BACKEND (OPEN / CLOSE)
            const openTimeFromGame = game.startTime || "";
            const closeTimeFromGame = game.endTime || "";

            // HANDLE LOADING BEFORE START TIME
            let startTime = null;
            if (game.startTime) {
              const [hours, minutes] = game.startTime.split(":").map(Number);
              startTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                hours,
                minutes,
                0
              );
            }

            if (startTime && startTime >= now) {
              return {
                title: game.name,
                numbers: "Loading...",
                openTime: openTimeFromGame,
                closeTime: closeTimeFromGame,
              };
            }

            // LAST OPEN
            const lastOpen = game.openNo?.length
              ? game.openNo[game.openNo.length - 1]
              : null;

            // LAST CLOSE
            const lastClose = game.closeNo?.length
              ? game.closeNo[game.closeNo.length - 1]
              : null;

            if (!lastOpen && !lastClose) {
              return {
                title: game.name,
                numbers: "***_**_***",
                openTime: openTimeFromGame,
                closeTime: closeTimeFromGame,
              };
            }

            const openMain = lastOpen?.[0] || "";
            const openDigit = lastOpen?.[1] || "";
            const openDay = lastOpen?.[4] || "";

            const closeMain = lastClose?.[0] || "";
            const closeDigit = lastClose?.[1] || "";
            const closeDay = lastClose?.[4] || "";

            let lastResult = "***-**_***";

            if (
              lastOpen &&
              lastClose &&
              openDay === closeDay &&
              lastOpen[2].split("T")[0] === lastClose[2].split("T")[0]
            ) {
              lastResult = `${openMain}-${openDigit}${closeDigit}-${closeMain}`;
            } else if (
              lastOpen &&
              (!lastClose || new Date(lastOpen[2]) > new Date(lastClose[2]))
            ) {
              lastResult = `${openMain}-${openDigit}`;
            } else if (
              lastClose &&
              (!lastOpen || new Date(lastClose[2]) > new Date(lastOpen[2]))
            ) {
              lastResult = `${closeMain}-${closeDigit}`;
            }

            return {
              title: game.name,
              numbers: lastResult,
              openTime: openTimeFromGame,
              closeTime: closeTimeFromGame,
              updatedAt: game.updatedAt,
            };
          });

          setResults(formatted);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Error fetching live results:", err);
        setError("Failed to fetch live results. Please try again later.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div
        className="bg-warning border border-white m-1 p-3 Live-Result-section-main-container"
        style={{ backgroundColor: "#ffcc99" }}
      >
        <div className="bg-pink text-white text-center py-2 mb-4 fw-bold Live-Result-Heading">
          <h2>💥LIVE RESULT💥</h2>
        </div>
        <p className="text-center">Loading results...</p>
      </div>
    );
  }

  return (
    <div
      className="border border-white m-1 p-3 Live-Result-section-main-container"
      style={{ backgroundColor: "#ffcc99" }}
    >
      <div
        className="text-white text-center py-1 mb-1 fw-bold Live-Result-Heading"
        style={{ backgroundColor: "#ff00a1" }}
      >
        <h3 style={{ fontSize: "1.2rem", margin: 0 }}>💥LIVE RESULT💥</h3>
      </div>

      <div className="row">
        {error ? (
          <p className="text-center text-danger">{error}</p>
        ) : results.length > 0 ? (
          results.map((item, idx) => (
            <div className="col-md-4" key={idx}>
              <LiveResultItem
                title={item.title}
                numbers={
                  isOlderThan12Hours(item.updatedAt)
                    ? "***_**_***"
                    : item.numbers
                }
                openTime={item.openTime}
                closeTime={item.closeTime}
              />
            </div>
          ))
        ) : (
          <p className="text-center">No live results found.</p>
        )}
      </div>
    </div>
  );
};

export default LiveResultSection;
