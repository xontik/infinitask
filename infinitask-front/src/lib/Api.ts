import axios from "axios";
import { useAuthStore } from "@/stores/auth";

import router from "../router";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.jwt = null;
      router.push({ name: "login" });
    }
    return Promise.reject(error);
  }
);
