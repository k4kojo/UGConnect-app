import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// TIP: Update this IP to your machine's LAN IP when testing on device
const API_BASE_URL = "https://healthcare-management-system-api.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
