import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create RFQ
export const createRFQ = async ({
  title,
  description,
  category,
  deadline,
  line_items,
  vendors,
}) => {
  try {
    const res = await api.post("/rfqs", {
      title,
      description,
      category,
      deadline,
      line_items,
      vendors,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to create RFQ",
      }
    );
  }
};

// Get All RFQs
export const getAllRFQs = async () => {
  try {
    const res = await api.get("/rfqs");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch RFQs",
      }
    );
  }
};

// Get Single RFQ
export const getRFQ = async (id) => {
  try {
    const res = await api.get(`/rfqs/${id}`);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch RFQ",
      }
    );
  }
};

// Update RFQ
export const updateRFQ = async (
  id,
  { title, description, category, deadline, line_items, vendors },
) => {
  try {
    const res = await api.put(`/rfqs/${id}`, {
      title,
      description,
      category,
      deadline,
      line_items,
      vendors,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to update RFQ",
      }
    );
  }
};

// Delete RFQ
export const deleteRFQ = async (id) => {
  try {
    const res = await api.delete(`/rfqs/${id}`);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to delete RFQ",
      }
    );
  }
};

// Publish / Send RFQ To Vendors
export const publishRFQ = async (id) => {
  try {
    const res = await api.patch(`/rfqs/${id}/publish`);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to publish RFQ",
      }
    );
  }
};

// Save RFQ As Draft
export const saveRFQDraft = async (rfqData) => {
  try {
    const res = await api.post("/rfqs/draft", rfqData);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to save draft",
      }
    );
  }
};
