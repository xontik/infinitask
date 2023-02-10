import { unflatten, type TreeNode } from "@/lib/tree";
import { defineStore } from "pinia";
import { api } from "../lib/Api";

import { useBoardStore } from "./board";

export interface Task {
  id: number;
  title: string;
  parentId: number | null;
  boardId: number;
  completed: boolean;
  opened: boolean;
}
interface TaskStoreState {
  tasks: Task[];
  selectedTaskIds: number[];
  inspectedTaskId: number | null;
}

export const useTasksStore = defineStore("tasks", {
  state: (): TaskStoreState => ({
    tasks: [],
    selectedTaskIds: [],
    inspectedTaskId: null,
  }),
  getters: {
    tasksTree(): TreeNode<Task> | null {
      return this.tasks.length ? unflatten(this.tasks) : null;
    },
  },
  actions: {
    async removeTask(id: number) {
      await api.delete(`/tasks/${id}`);
      this.tasks = this.tasks.filter((task) => task.id !== id);
    },

    async updateTask(task: Partial<Task>) {
      const apiTask = await api.put(`/tasks/${task.id}`, { ...task });
      const task = this.tasks.findIndex((t) => t.id === task.id);
      if (task) {
        task.title = title;
      }
    },

    async loadTasks(boardId: number) {
      useBoardStore().selectBoard(boardId);
      this.tasks = (await api.get(`/tasks`, { params: { boardId } })).data;
    },

    async addTask(title: string, parentId?: number): Promise<number> {
      const boardId = useBoardStore().selectedBoardId;
      const task = (
        await api.post<Task>("/tasks", { boardId, title, parentId })
      ).data;
      this.tasks.push(task);

      return task.id;
    },
  },
});
