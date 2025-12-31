import React, { useEffect, useState } from "react";
import "../SharedComponentsStyles/ToastStyle.css"

const Toast = ({ message, type = "success", duration = 3000 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) return; // nothing to show
        setVisible(true);

        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [message, type, duration]); // restart when message/type/duration changes

    if (!visible) return null;

    const typeStyles = {
        success: {
            backgroundColor: "#22c55e",
            icon: "✅",
        },
        error: {
            backgroundColor: "#ef4444",
            icon: "❌",
        },
        warning: {
            backgroundColor: "#f59e0b",
            icon: "⚠️",
        },
        info: {
            backgroundColor: "#3b82f6",
            icon: "ℹ️",
        },
    };

    const { backgroundColor, icon } = typeStyles[type] || typeStyles.success;

    return (
        <div
            className="toast-container"
            style={{ backgroundColor }}
        >
            <span className="toast-icon">{icon}</span>
            <span className="toast-message">{message}</span>
        </div>
    );
};

export default Toast;

