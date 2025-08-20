import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createCacheInterceptor } from "./cacheInterceptor";

// TIP: Update this IP to your machine's LAN IP when testing on device
const API_BASE_URL = "https://healthcare-management-system-api.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create cache interceptor
const cacheInterceptor = createCacheInterceptor();

// Request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Apply cache interceptor request logic
    return cacheInterceptor.request(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for cache invalidation
api.interceptors.response.use(
  cacheInterceptor.response,
  cacheInterceptor.error
);

export default api;
