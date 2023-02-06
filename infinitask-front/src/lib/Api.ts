import axios from "axios";

import { useAuthStore } from "@/stores/auth";
export const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.jwt) {
    config.headers.Authorization = `Bearer ${authStore.jwt}`;
  }
  return config;
});
