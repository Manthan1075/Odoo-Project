import api from "./userApi";

// Dashboard Cards
export const getDashboardStats = async () => {
  try {
    const res = await api.get("/dashboard/stats");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch dashboard stats",
      }
    );
  }
};

// Recent Purchase Orders
export const getRecentPOs = async () => {
  try {
    const res = await api.get("/dashboard/recent-pos");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch recent purchase orders",
      }
    );
  }
};

// Spending Trend Chart
export const getSpendingTrend = async () => {
  try {
    const res = await api.get("/dashboard/spending-trend");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch spending trend",
      }
    );
  }
};

// Quick Stats
export const getQuickStats = async () => {
  try {
    const res = await api.get("/dashboard/quick-stats");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch quick stats",
      }
    );
  }
};
