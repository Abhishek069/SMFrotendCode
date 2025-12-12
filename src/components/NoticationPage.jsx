import React, { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";

// --- Scrolling Notification Component ---
const ScrollingNotification = ({
  messages,
  color = "#fc0505ff",
  baseSpeed = 20,
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [animationDuration, setAnimationDuration] = useState(baseSpeed);

  if (!messages || messages.length === 0) return null;

  const text = messages;

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const contentWidth = contentRef.current?.scrollWidth || 0;
    const distance = contentWidth + containerWidth;
    const duration = (distance / 1000) * baseSpeed;
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
        border: "solid 1px red",
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

// --- Modal Component ---
const AddNotificationModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: "", index: "1" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const INDEX_OPTIONS = ["1", "2", "3", "4"];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.index)
      return setError("All fields are required.");
    setIsSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedStyle = (value) => ({
    padding: "8px 12px",
    borderRadius: "4px",
    border: `1px solid ${formData.index === value ? "#007bff" : "#ccc"}`,
    backgroundColor: formData.index === value ? "#007bff" : "#f0f0f0",
    color: formData.index === value ? "white" : "#333",
    flex: 1,
    textAlign: "center",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "6px",
          width: "90%",
          maxWidth: "350px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          Add Notification
        </h3>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "bold",
                marginBottom: "5px",
                display: "block",
              }}
            >
              Notification Message:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
              required
              placeholder="E.g., Server downtime at 2 AM"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Section Index:
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {INDEX_OPTIONS.map((val) => (
              <label key={val} style={getSelectedStyle(val)}>
                <input
                  type="radio"
                  name="index"
                  value={val}
                  checked={formData.index === val}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                {val}
              </label>
            ))}
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button type="button" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                backgroundColor: isSaving ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Notification Page ---
function NotificationPage({ role, notificationMessage }) {
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [scrollMessages, setScrollMessages] = useState(
    notificationMessage?.name || "Welcome! Click below to add a notification."
  );

  const handleSaveNotification = async (data) => {
    const API_URL = "/Notification/update-noti";
    try {
      const response = await api(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save notification");
      setScrollMessages(data.name);
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };

  useEffect(() => {
  if (notificationMessage?.name) {
    setScrollMessages(notificationMessage.name);
  }
}, [notificationMessage]);

  // const handleGetNotification = async () => {
  //   const API_URL = "/Notification/update-noti";
  //   try {
  //     const apiResponse = await api(API_URL, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     const values = Object.values(apiResponse);
  //     const notifications = values.filter((v) => v && typeof v === "object" && v.name);
  //     if (notifications.length > 0) {
  //       const first = notifications.find((n) => n.index === "1") || notifications[0];
  //       setScrollMessages(first.name);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching notifications:", err);
  //   }
  // };

  // useEffect(() => {
  //   handleGetNotification();
  // }, []);

  return (
    <div style={{ minHeight: "10vh", backgroundColor: "#ffcc99" }}>
      <ScrollingNotification
        messages={scrollMessages}
        color="#f70019ff"
        speed={15}
      />

      {role === "Admin" && (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              marginTop: "15px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            ➕ Add New Notification
          </button>
          {isModalOpen && (
            <AddNotificationModal
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveNotification}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
