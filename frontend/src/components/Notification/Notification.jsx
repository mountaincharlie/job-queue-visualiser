import React, { useEffect, useRef } from "react";
import './Notification.scss';


const Notification = ({
  type = "info", // Type of notification: "success", "error", "warning", "info"
  message = "",
  onClose,
  duration = 5000, // Optional self-close timer in milliseconds
}) => {

  const notificationRef = useRef(null);

  // handle closing the notification with the timer
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [duration, onClose]);

  // handle closing the notification if the user is clicking elsewhere in the document
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        onClose();
      }
    };

    // delay adding the event listener to stop it getting closed immediately
    const timeout = setTimeout(() => {
      // click type, handleClickOutside function, capture true => captures event before propogation (e.g. by other buttons)
      document.addEventListener("click", handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [onClose]);

  return (
    <div
      ref={notificationRef}
      className={`notification notification-${type}`}
    >
      <span className="notification-type">{type}:</span> 
      <span className="notification-message">{message}</span> 
      <button
        className="notification-close"
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  );
};

export default Notification;
