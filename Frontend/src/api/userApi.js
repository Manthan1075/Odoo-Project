import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Login User
export const loginUser = async ({ email, password }) => {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to login",
      }
    );
  }
};

// Register User
export const registerUser = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  phone,
  role,
}) => {
  try {
    const res = await api.post("/auth/register", {
      username,
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to register user",
      }
    );
  }
};

// Get Single User
export const getUserData = async (id) => {
  try {
    const res = await api.get(`/users/${id}`);

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch user",
      }
    );
  }
};

// Get All Users
export const getAllUsers = async () => {
  try {
    const res = await api.get("/users");

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch users",
      }
    );
  }
};

export default api;
