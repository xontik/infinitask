import { unflatten } from "@/lib/tree";
import { defineStore } from "pinia";
import { api } from "../lib/Api";
export interface Board {
  id: number;
  title: string;
}
interface Task {
  id: number;
  title: string;
  completed: boolean;
}
export interface TaskNode extends Task {
  children: TaskNode[];
  editing: boolean;
}

interface TasksState {
  boards: Board[];
  currentBoard: Board | null;
  tasks: Task[];
}
export const useTasksStore = defineStore("tasks", {
  state: (): TasksState => ({
    boards: [],
    currentBoard: null,
    tasks: [],
  }),
  getters: {
    tasksTree() {
      return this.tasks.length ? unflatten(this.tasks) : null;
    },
  },
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

    async updateBoard(id: number, title: string) {
      await api.put(`/boards/${id}`, { title });
      const board = this.boards.find((board) => board.id === id);
      if (board) {
        board.title = title;
      }
    },
    async removeTask(id: number) {
      await api.delete(`/tasks/${id}`);
      this.tasks = this.tasks.filter((task) => task.id !== id);
    },

    async updateTask(id: number, title: string) {
      await api.put(`/tasks/${id}`, { title });
      const task = this.tasks.find((task) => task.id === id);
      if (task) {
        task.title = title;
      }
    },
    async selectBoard(id: number) {
      if (this.boards.length === 0) {
        this.currentBoard = (await api.get(`/boards/${id}`)).data;
      } else {
        this.currentBoard =
          this.boards.find((board) => board.id === id) ?? null;
      }
    },

    async loadTasks(boardId: number) {
      if (this.currentBoard === null || this.currentBoard.id !== boardId) {
        await this.selectBoard(boardId);
      }
      this.tasks = (await api.get(`/tasks`, { params: { boardId } })).data;
    },

    async addTask(boardId: Number, title: string) {
      const task = (await api.post<Task>("/tasks", { boardId, title })).data;
      this.tasks.push(task);
    },
  },
});
