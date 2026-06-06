import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get All Vendors
export const getAllVendors = async () => {
  try {
    const res = await api.get("/vendors");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch vendors",
      }
    );
  }
};

// Get Single Vendor
export const getVendor = async (vendorId) => {
  try {
    const res = await api.get(`/vendors/${vendorId}`);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch vendor",
      }
    );
  }
};

// Create Vendor
export const createVendor = async ({
  company_name,
  contact_person,
  email,
  phone,
  gst_number,
  category_id,
  country,
  address,
}) => {
  try {
    const res = await api.post("/vendors", {
      company_name,
      contact_person,
      email,
      phone,
      gst_number,
      category_id,
      country,
      address,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to create vendor",
      }
    );
  }
};

// Update Vendor
export const updateVendor = async (
  vendorId,
  {
    company_name,
    contact_person,
    email,
    phone,
    gst_number,
    category_id,
    country,
    address,
  },
) => {
  try {
    const res = await api.put(`/vendors/${vendorId}`, {
      company_name,
      contact_person,
      email,
      phone,
      gst_number,
      category_id,
      country,
      address,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to update vendor",
      }
    );
  }
};

// Delete Vendor
export const deleteVendor = async (vendorId) => {
  try {
    const res = await api.delete(`/vendors/${vendorId}`);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to delete vendor",
      }
    );
  }
};

// Create Vendor Category
export const createVendorCategory = async (name) => {
  try {
    const res = await api.post("/vendor/category/create", {
      name,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to create category",
      }
    );
  }
};

// Get Vendor Categories
export const getVendorCategories = async () => {
  try {
    const res = await api.get("/vendor/categories");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch categories",
      }
    );
  }
};

export default api;
