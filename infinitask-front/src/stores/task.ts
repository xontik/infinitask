import { unflatten, type FlatTreeNode, type TreeNode } from "@/lib/tree";
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
  tasks: Map<number | null, Task>;
  selectedTaskIds: number[];
  inspectedTaskId: number | null;
}

export const useTasksStore = defineStore("tasks", {
  state: (): TaskStoreState => ({
    tasks: new Map(),
    selectedTaskIds: [],
    inspectedTaskId: null,
  }),
  getters: {
    tasksTree(): TreeNode<Task> | null {
      return this.tasks.size ? unflatten(this.tasks) : null;
    },
    inspectedTask(): Task | null {
      return this.inspectedTaskId
        ? this.tasks.get(this.inspectedTaskId) ?? null
        : null;
    },
  },
  actions: {
    inspectTask(id: number | null) {
      this.inspectedTaskId = id;
    },

    async removeTask(id: number) {
      await api.delete(`/tasks/${id}`);
      this.tasks.delete(id);
    },

    async updateTask(task: Partial<Task>) {
      if (task.id === undefined) {
        throw new Error("Task id is undefined");
      }
      const oldTask = this.tasks.get(task.id);
      this.tasks.set(task.id, { ...oldTask, ...task } as Task);
      try {
        await api.put(`/tasks/${task.id}`, { ...task });
      } catch (e) {
        this.tasks.set(task.id, oldTask!);
      }
    },

    async loadTasks(boardId: number) {
      useBoardStore().selectBoard(boardId);
      const tasks = new Map<number | null, Task>();
      (await api.get(`/tasks`, { params: { boardId } })).data.forEach(
        (t: Task) => {
          tasks.set(t.id, t);
        }
      );
      this.tasks = tasks;
    },

    async addTask(title: string, parentId?: number): Promise<number> {
      const boardId = useBoardStore().selectedBoardId;
      const task = (
        await api.post<Task>("/tasks", { boardId, title, parentId })
      ).data;
      this.tasks.set(task.id, task);

      return task.id;
    },
  },
});
