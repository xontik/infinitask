import { defineStore } from "pinia";
import { api } from "../lib/Api";

export interface BoardStoreState {
  boards: Board[];
  selectedBoardId: number | null;
}
export interface Board {
  id: number;
  title: string;
}

export const useBoardStore = defineStore("boards", {
  state: (): BoardStoreState => ({
    boards: [],
    selectedBoardId: null,
  }),
  getters: {
    selectedBoard(): Board | null {
      return this.selectedBoardId
        ? this.boards.find((board) => board.id === this.selectedBoardId) ?? null
        : null;
    },
  },
  actions: {
    async loadBoards() {
      const boards = (await api.get<Board[]>("/boards")).data;
      this.boards = boards;
    },

    async selectBoard(id: number) {
      this.selectedBoardId = id;

      if (this.selectedBoard === null) {
        this.boards.push((await api.get(`/boards/${id}`)).data);
      }
    },

    async addBoard(title: string) {
      const board = (await api.post<Board>("/boards", { title })).data;
      this.boards.push(board);
    },

    async removeBoard(id: number) {
      await api.delete(`/boards/${id}`);
      this.boards = this.boards.filter((board) => board.id !== id);
      if (this.selectedBoardId === id) {
        this.selectedBoardId = null;
      }
    },

    async updateBoard(id: number, title: string) {
      await api.put(`/boards/${id}`, { title });
      const board = this.boards.find((board) => board.id === id);
      if (board) {
        board.title = title;
      }
    },
  },
});
