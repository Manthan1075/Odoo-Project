import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get All Approvals
export const getAllApprovals = async () => {
  try {
    const res = await api.get(
      "/approvals/all"
    );

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch approvals",
      }
    );
  }
};

// Approve Quotation
export const approveQuotation = async (
  id,
  remarks = ""
) => {
  try {
    const res = await api.post(
      `/approval/${id}/approve`,
      {
        remarks,
      }
    );

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to approve quotation",
      }
    );
  }
};

// Reject Quotation
export const rejectQuotation = async (
  id,
  remarks = ""
) => {
  try {
    const res = await api.post(
      `/approval/${id}/reject`,
      {
        remarks,
      }
    );

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to reject quotation",
      }
    );
  }
};