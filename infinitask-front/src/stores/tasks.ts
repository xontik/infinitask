import { defineStore } from "pinia";
import { api } from "../lib/Api";
interface Board {
  id: number;
  title: string;
}
interface TasksState {
  boards: Board[];
}
export const useAuthStore = defineStore("auth", {
  state: (): TasksState => ({
    boards: [],
  }),
  actions: {
    async loadBoards() {
      const boards = (await api.get<Board[]>("/boards")).data;
      this.boards = boards;
    },
  },
});
