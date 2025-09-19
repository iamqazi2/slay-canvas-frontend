"use client";
import React, { useState } from "react";
import OverlayPanel from "./OverlayPanel";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "info" | "success" | "warning" | "error";
  avatar?: string;
  initials?: string;
}

interface NotificationPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isVisible, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New file shared",
      message: "Sarah Johnson shared a video file with you",
      time: "2 minutes ago",
      isRead: false,
      type: "info",
      initials: "SJ",
    },
    {
      id: "2",
      title: "Project updated",
      message: "Your research project has been updated with new findings",
      time: "1 hour ago",
      isRead: false,
      type: "success",
      initials: "SY",
    },
    {
      id: "3",
      title: "Storage warning",
      message: "You're using 85% of your storage quota",
      time: "3 hours ago",
      isRead: true,
      type: "warning",
      initials: "SY",
    },
    {
      id: "4",
      title: "Collaboration request",
      message: "Mike Chen wants to collaborate on your video research",
      time: "1 day ago",
      isRead: true,
      type: "info",
      initials: "MC",
    },
    {
      id: "5",
      title: "Export completed",
      message: "Your video collection export is ready for download",
      time: "2 days ago",
      isRead: true,
      type: "success",
      initials: "SY",
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "warning":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "error":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <OverlayPanel
      isVisible={isVisible}
      onClose={onClose}
      position="top-right"
      width="w-96"
      maxHeight="max-h-[85vh]"
      className="relative inset-0"
      zIndex={150}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[calc(85vh-80px)] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-300 mb-4"
            >
              <path
                d="M15 17h5l-5 5v-5zM4.19 4.19l15.62 15.62M4.19 19.81L19.81 4.19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <img src={notification.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-medium">{notification.initials}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>

                      {/* Type Icon */}
                      <div className="flex-shrink-0 ml-2">{getTypeIcon(notification.type)}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OverlayPanel>
  );
};

export default NotificationPanel;
