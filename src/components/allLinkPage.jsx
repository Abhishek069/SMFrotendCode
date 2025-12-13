import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import {useNavigate} from 'react-router-dom'
// --- MOCK DEPENDENCIES START ---
// NOTE: These mock definitions simulate how your actual imports (useNavigate and api) would work.
// You should replace these blocks with your actual imports when moving to your environment.


// --- MOCK DEPENDENCIES END ---


// Main component
const AllPageLink = (props) => {
  const {page} = props
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation
  

  // Function to handle redirection
  const handleGameClick = (gameId) => {
    // Redirects to the specified path with the game ID
    navigate(`/${page}/${gameId}`);
  };

  const fetchGamesAgain = async () => {
    try {
      const data = await api("/AllGames/");
      // ✅ This checks if data was successful and contains an array of games
      if (data.success && Array.isArray(data.data)) {
        setGames(data.data); // ✅ Setting the state with API data
      } else {
        setError("Failed to fetch data or data format is incorrect.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamesAgain();
  }, []); // Run only once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        {/* <div className="p-6 bg-white rounded-xl shadow-lg">
          <svg className="animate-spin h-6 w-6 mr-3 text-pink-600 inline-block" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-semibold text-gray-700">Loading Game Charts...</span>
        </div> */}
        Loading....
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100">
        <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-red-500">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-2 sm:p-4 font-inter flex justify-center">
      <div className="w-full max-w-lg mx-auto border-4 border-pink-700 rounded-xl overflow-hidden shadow-2xl mt-4 mb-4">
        
        {/* Header matching the Satta Matka style (Pink background) */}
        <div 
          className="bg-pink-600 text-white text-center py-3 font-extrabold text-xl sm:text-2xl tracking-wider"
          style={{ backgroundColor: '#ff69b4',fontSize:"20px", fontWeight:"bold" }} // Use a brighter pink for the header
        >
          {page === "JodiPanPage" ? "JODI CHART" : "PANEL CHART"}
        </div>
        
        {/* List Container */}
        <div className="flex flex-col">
          {games.length > 0 ? (
            // ✅ Mapping over the 'games' state populated by the API call
            games.map((game) => (
              <div
                key={game._id}
                onClick={() => handleGameClick(game._id)}
                // Styling for each row (light orange/peach, blue italic text)
                className="
                  w-full py-3 px-6 text-center text-lg font-semibold italic 
                  text-blue-900 border-b-2 border-pink-300 
                  cursor-pointer transition duration-150 ease-in-out
                  hover:bg-amber-300 active:bg-amber-400
                "
                style={{ backgroundColor: '#ffddaf', fontSize:"20px", fontWeight:"bold",  border: "2px solid pink", borderRadius: "12px"}}
                title={`View ${game.name} Chart`}
              > 
                {game.name} Chart 
              </div>
            ))
          ) : (
            <div className="text-center p-4 bg-white">
              <p className="text-lg text-gray-500">No game charts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPageLink;
