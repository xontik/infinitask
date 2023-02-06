import { defineStore } from "pinia";
import { api } from "../lib/Api";
interface Board {
  id: number;
  title: string;
}
interface TasksState {
  boards: Board[];
}
export const useTasksStore = defineStore("tasks", {
  state: (): TasksState => ({
    boards: [],
  }),
  actions: {
    async loadBoards() {
      const boards = (await api.get<Board[]>("/boards")).data;
      this.boards = boards;
    },

    async addBoard(title: string) {
      const board = (await api.post<Board>("/boards", { title })).data;
      this.boards.push(board);
    },

    async removeBoard(id: number) {
      await api.delete(`/boards/${id}`);
      this.boards = this.boards.filter((board) => board.id !== id);
    },
  },
});
