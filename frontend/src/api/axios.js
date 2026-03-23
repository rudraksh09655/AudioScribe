import axios from "axios";

const api = axios.create({
  baseURL: "https://audioscribe-2.onrender.com/api", // your backend URL
  withCredentials: true, // useful for auth later
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
