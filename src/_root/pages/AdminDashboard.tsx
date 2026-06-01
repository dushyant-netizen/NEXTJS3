"use client";

import { motion } from "framer-motion";
import Loader from "@/components/shared/Loader";
import AdminManagement from "@/components/shared/AdminManagement";
import AdminUserManagement from "@/components/shared/AdminUserManagement";
import { useGetAdminStats, useCheckAdminAccess } from "@/lib/react-query/queriesAndMutations";

const CARD_VARIANTS = [
  { key: "totalUsers", label: "Total Users", icon: "/assets/icons/people.svg", colorClass: "from-primary-500 to-primary-600" },
  { key: "totalPosts", label: "Total Posts", icon: "/assets/icons/posts.svg", colorClass: "from-blue-500 to-blue-600" },
  { key: "activeToday", label: "Active Today", icon: "/assets/icons/home.svg", colorClass: "from-green-500 to-green-600" },
  { key: "totalLikes", label: "Total Likes", icon: "/assets/icons/like.svg", colorClass: "from-red-500 to-red-600" },
  { key: "totalComments", label: "Total Comments", icon: "/assets/icons/chat.svg", colorClass: "from-purple-500 to-purple-600" },
  { key: "newUsersThisWeek", label: "New Users This Week", icon: "/assets/icons/add-post.svg", colorClass: "from-orange-500 to-orange-600" },
  
  // ✨ Added 2 New Elements
  { key: "totalShares", label: "Total Shares", icon: "/assets/icons/share.svg", colorClass: "from-cyan-500 to-teal-600" },
  { key: "totalReports", label: "Reports", icon: "/assets/icons/alert.svg", colorClass: "from-rose-500 to-pink-600" },
];

const AdminDashboard = () => {
  const { data: hasAdminAccess, isLoading: isCheckingAccess } = useCheckAdminAccess();
  const { data: stats, isLoading: isLoadingStats, isError } = useGetAdminStats();

  const renderLoadingScreen = () => (
    <div className="flex justify-center items-center w-full h-screen bg-dark-1">
      <Loader />
    </div>
  );

  if (isCheckingAccess) return renderLoadingScreen();

  if (!hasAdminAccess) {
    return (
      <div className="common-container flex items-center justify-center min-h-screen bg-dark-1">
        <div className="text-center p-10 border border-dark-4 bg-dark-2 rounded-3xl max-w-md mx-auto">
          <img
            src="/assets/icons/filter.svg"
            width={64}
            height={64}
            alt="access denied"
            className="invert-white mx-auto mb-6 opacity-50"
          />
          <h2 className="h3-bold text-light-1 mb-3">Access Denied</h2>
          <p className="text-light-3 leading-relaxed">
            You don't have permission to access the admin dashboard. 
            Contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingStats) return renderLoadingScreen();

  if (isError || !stats) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-dark-1">
        <div className="p-8 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
          <p className="text-red-400 font-medium">Error loading admin dashboard metrics.</p>
        </div>
      </div>
    );
  }

  const engagementRate = stats.totalPosts > 0 
    ? ((stats.totalLikes + stats.totalComments) / stats.totalPosts).toFixed(1) 
    : "0.0";

  const userActivityPct = stats.totalUsers > 0 
    ? ((stats.activeToday / stats.totalUsers) * 100).toFixed(1) 
    : "0.0";

  const weeklyGrowthPct = stats.totalUsers > 0 
    ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(1) 
    : "0.0";

  const contentDensity = stats.totalUsers > 0 
    ? (stats.totalPosts / stats.totalUsers).toFixed(1) 
    : "0.0";

  return (
    <div className="common-container min-h-screen bg-dark-1 pb-12">
      <div className="admin-container w-full max-w-6xl mx-auto px-6 py-10">
        
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 mb-12 border-b border-dark-4 pb-8">
          <div className="p-3 bg-primary-500/10 rounded-2xl">
            <img
              src="/assets/icons/people.svg"
              width={36}
              height={36}
              alt="admin"
              className="invert-white"
            />
          </div>
          <div>
            <h1 className="h2-bold text-light-1">Admin Control Center</h1>
            <p className="text-light-3">Platform Overview &amp; Management</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Statistics Grid - Now supports 8 cards gracefully */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full mb-12">
          {CARD_VARIANTS.map((card, idx) => {
            const value = stats[card.key as keyof typeof stats] || 0;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="group bg-dark-2 rounded-3xl p-6 border border-dark-4 hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.colorClass} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <img
                    src={card.icon}
                    alt={card.label}
                    width={26}
                    height={26}
                    className="invert-white"
                  />
                </div>
                
                <h3 className="text-4xl font-bold text-light-1 tracking-tighter mb-1">
                  {value.toLocaleString()}
                </h3>
                <p className="text-light-3 font-medium">{card.label}</p>

                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />
              </motion.div>
            );
          })}
        </div>

        {/* Analytics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-dark-2 rounded-3xl p-8 border border-dark-4 mb-12"
        >
          <h3 className="text-lg font-semibold text-light-1 mb-6 flex items-center gap-3">
            📈 Platform Growth Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-dark-4">
                <span className="text-light-3">Engagement Rate</span>
                <span className="text-2xl font-semibold text-light-1">{engagementRate}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-4">
                <span className="text-light-3">Daily Active Users</span>
                <span className="text-2xl font-semibold text-green-400">{userActivityPct}%</span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-dark-4">
                <span className="text-light-3">Weekly Growth</span>
                <span className="text-2xl font-semibold text-emerald-400">+{weeklyGrowthPct}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-4">
                <span className="text-light-3">Content per User</span>
                <span className="text-2xl font-semibold text-light-1">{contentDensity}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Management Sections */}
        <div className="space-y-12">
          <AdminManagement />
          <AdminUserManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;