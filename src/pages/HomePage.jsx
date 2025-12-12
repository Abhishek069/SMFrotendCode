// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import ReactDOM from "react-dom"; // Import ReactDOM for Portals
import Header from "../components/Header";
import WelcomeBanner from "../components/WelcomeBanner";
import InfoSection from "../components/InfoSection";
import LuckyNumberSection from "../components/LuckyNumberSection";
import LiveResultSection from "../components/LiveResultSection";
import NoticeSection from "../components/NoticeSection";
import JodiPannelResultSection from "../components/JodiPannelResultSection";
import MatkaDivisionName from "../components/MatakaDivisionName";
import StarlStarlineSectionineTable from "../components/StarlineSection";
import MainBombay36Bazar from "../components/MainBombay36Bazar";
import DpBossPage from "../components/DpBossPage";
import UserPayments from "../components/AgentList";
import NotificationPage from "../components/NoticationPage";
import AllPageLink from '../components/allLinkPage'
import { api } from "../lib/api";
import { jwtDecode } from "jwt-decode";

// --- New Component for Static Buttons ---

const handleRefresh = () => {
    // Refresh the current page
    window.location.reload();
  };

  const handleCall = () => {
    // Opens dialer with number
    window.location.href = "tel:+919691443421"; // ← replace with your number
  };
const StaticButtons = () => {
  // Use a React Portal to render the buttons outside the normal DOM hierarchy.
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "10px",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        gap: "10px",
        width: "95%"
      }}
    >
      {/* 📞 Dial Pad Button */}
      <button
        onClick={handleCall}
        style={{
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          fontSize: "12px",
        }}
      >
        📞 Call Admin
      </button>

      {/* 🔄 Refresh Page Button */}
      <button
        onClick={handleRefresh}
        style={{
          padding: "10px 20px",
          backgroundColor: "#008CBA",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          fontSize: "12px",
        }}
      >
        🔄 Refresh Page
      </button>
    </div>,
    document.body
  );
};
// ------------------------------------------

const HomePage = ({ setGameTitle }) => {
  const [responseNotification, setResponseNotification] = useState([]);
  const token = localStorage.getItem("authToken");
  
    // let username = null;
    let role = null;
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // role = decoded.role;
        role = decoded.role;
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  
  
  // --- Fetch Notifications (Logic remains the same) ---
  const handleGetNotification = async () => {
    const API_URL = "/Notification/update-noti";
    try {
      const apiResponse = await api(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!apiResponse) throw new Error("No response from server");

      let notificationsArray = [];
      if (Array.isArray(apiResponse)) {
        notificationsArray = await apiResponse;
      } else if (typeof apiResponse === "object") {
        notificationsArray = Object.values(apiResponse).filter(
          (item) => item && typeof item === "object" && item.name
        );
      }

      if (!notificationsArray.length) {
        console.warn("No notifications found");
        setResponseNotification([]);
        return;
      }
      setResponseNotification(notificationsArray);
    } catch (error) {
      console.error("❌ Error retrieving notification:", error);
    }
  };

  // --- Fetch once on mount (Logic remains the same) ---
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await handleGetNotification();
        if (isMounted) result;
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* 🛑 CONDITIONAL RENDERING FOR ADMIN BUTTONS */}
       <StaticButtons />

      {/* Existing Page Content */}
      <div
        className="border border-danger text-center col-12"
        style={{ backgroundColor: "#ff2600ff", width: "100%" }}
      >
        {/* Page Sections */}
        <Header />
        <WelcomeBanner />

        {/* Pass the first notification object safely */}
        {responseNotification.length > 0 && (
          <NotificationPage
            role={role}
            notificationMessage={responseNotification[0]}
          />
        )}

        <InfoSection />
        <NotificationPage
          role={role}
          notificationMessage={responseNotification?.[1] || {}}
        />

        {/* This existing check is redundant if you're using role === "Admin" above, but maintained here */}
        {role === "Admin" && <UserPayments />}

        {/* <LuckyNumberSection /> */}
        <LiveResultSection />
        <NoticeSection />
        <MatkaDivisionName />
        <JodiPannelResultSection setGameTitle={setGameTitle} />
        <NotificationPage
          role={role}
          notificationMessage={responseNotification?.[2] || {}}
        />
        <StarlStarlineSectionineTable />
        <MainBombay36Bazar />
        <AllPageLink page={"JodiPanPage"}/>
        <AllPageLink page={"PanelPage"}/>
        <DpBossPage />
        <NotificationPage
          role={role}
          notificationMessage={responseNotification?.[3] || {}}
        />
      </div>
    </>
  );
};

export default HomePage;
