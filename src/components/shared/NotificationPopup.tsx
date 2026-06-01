"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export interface NotificationData {
  id: string;
  type: 'new_post' | 'like' | 'comment' | 'follow';
  title: string;
  message: string;
  avatar: string;
  actionUrl?: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

interface NotificationPopupProps {
  notification: NotificationData | null;
  onClose: () => void;
  onAction?: () => void;
}

const NotificationPopup = ({ notification, onClose, onAction }: NotificationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setProgress(100);

      const duration = 5500;
      const interval = 50;
      const step = (100 * interval) / duration;

      const timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - step;
          if (newProgress <= 0) {
            clearInterval(timer);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 250);
  };

  const handleAction = () => {
    if (onAction) onAction();
    handleClose();
  };

  const getIcon = () => {
    switch (notification?.type) {
      case 'new_post': return "📸";
      case 'like': return "❤️";
      case 'comment': return "💬";
      case 'follow': return "👤";
      default: return "🔔";
    }
  };

  const getAccentColor = () => {
    switch (notification?.type) {
      case 'new_post': return "from-blue-500 to-cyan-500";
      case 'like': return "from-red-500 to-rose-500";
      case 'comment': return "from-emerald-500 to-teal-500";
      case 'follow': return "from-violet-500 to-purple-500";
      default: return "from-primary-500 to-indigo-500";
    }
  };

  if (!notification) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed top-6 right-6 z-[100] w-full max-w-xs sm:max-w-sm"
        >
          <div className="relative overflow-hidden bg-dark-2 border border-dark-4 rounded-3xl shadow-2xl shadow-black/50 backdrop-blur-xl">
            
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-[3px] bg-dark-4 w-full z-10">
              <motion.div 
                className={`h-full bg-gradient-to-r ${getAccentColor()}`}
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            <div className="p-5">
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAccentColor()} flex items-center justify-center flex-shrink-0 shadow-inner`}>
                  <span className="text-2xl">{getIcon()}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-light-1 text-[15px]">{notification.title}</p>
                      <p className="text-xs text-light-4 mt-0.5">
                        {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleClose}
                      className="text-light-4 hover:text-light-1 p-1 -mr-1 -mt-1 rounded-lg hover:bg-dark-4 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex gap-3">
                    <img
                      src={notification.avatar || "/assets/icons/profile-placeholder.svg"}
                      alt={notification.userName}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-dark-4"
                    />
                    <div className="text-sm text-light-2 leading-snug flex-1">
                      <span className="font-medium text-light-1">{notification.userName}</span>{' '}
                      {notification.message}
                    </div>
                  </div>

                  {/* Action Button */}
                  {notification.actionUrl && (
                    <Link
                      href={notification.actionUrl}
                      onClick={handleAction}
                      className={`mt-4 block w-full text-center py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r ${getAccentColor()} hover:brightness-110 active:scale-[0.985] transition-all`}
                    >
                      {notification.type === 'follow' ? 'View Profile' : 
                       notification.type === 'comment' ? 'Reply Now' : 'View'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup;