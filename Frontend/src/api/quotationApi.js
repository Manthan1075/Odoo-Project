import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create Invoice
export const createInvoice = async ({
  quotationId,
  vendorId,
  items,
  gst,
  notes,
  totalAmount,
  dueDate,
}) => {
  try {
    const res = await api.post("/invoice", {
      quotationId,
      vendorId,
      items,
      gst,
      notes,
      totalAmount,
      dueDate,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to create invoice",
      }
    );
  }
};

// Get All Invoices
export const getInvoices = async () => {
  try {
    const res = await api.get("/invoice");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch invoices",
      }
    );
  }
};

// Get Single Invoice
export const getInvoice = async (id) => {
  try {
    const res = await api.get(`/invoice/${id}`);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch invoice",
      }
    );
  }
};

// Download Invoice PDF
export const downloadInvoicePDF = async (id) => {
  try {
    const res = await api.get(
      `/invoices/${id}/pdf`,
      {
        responseType: "blob",
      }
    );

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to download PDF",
      }
    );
  }
};

// Send Invoice Email
export const sendInvoiceEmail = async (id) => {
  try {
    const res = await api.post(
      `/invoices/${id}/send-email`
    );

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to send invoice email",
      }
    );
  }
};