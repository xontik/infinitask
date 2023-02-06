import { defineStore } from "pinia";
import jwt_decode from "jwt-decode";
import { api } from "../lib/Api";

interface User {
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  jwt: string | null;
}
export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    jwt: null,
  }),
  getters: {
    isAuthenticated(): boolean {
      return !!this.jwt;
    },
  },
  actions: {
    async login(username: string, password: string) {
      const { data } = await api.post("/login", { username, password });
      this.jwt = data.token;
      this.user = jwt_decode(data.token) as any;
    },
  },
});
