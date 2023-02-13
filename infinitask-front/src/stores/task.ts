import {
  findDownInTree,
  findUpInTree,
  findInTree,
  unflatten,
  type TreeNode,
} from "@/lib/tree";
import { defineStore } from "pinia";
import { api } from "../lib/Api";

import { useBoardStore } from "./board";
export const NO_TASK_ID = -2;
export const ROOT_TASK_ID = null;
export const NEW_TASK_ID = -1;

export interface Task {
  id: number | null;
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
  editingTaskId: number | null;
}

export const useTasksStore = defineStore("tasks", {
  state: (): TaskStoreState => ({
    tasks: new Map(),
    selectedTaskIds: [],
    inspectedTaskId: null,
    editingTaskId: null,
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
    editingTask(): Task | null {
      return this.editingTaskId
        ? this.tasks.get(this.editingTaskId) ?? null
        : null;
    },
    taskAbove(): (task: Task) => Task | null {
      return (task: Task) => {
        if (!this.tasksTree) {
          return null;
        }
        const taskNode = findInTree(this.tasksTree, task.id);
        if (!taskNode) {
          return null;
        }
        const taskAbove = findUpInTree<Task>(taskNode);
        return taskAbove && taskAbove.id !== ROOT_TASK_ID
          ? taskAbove.data
          : null;
      };
    },
    taskBelow(): (task: Task) => Task | null {
      return (task: Task) => {
        if (!this.tasksTree) {
          return null;
        }
        const taskNode = findInTree(this.tasksTree, task.id);
        if (!taskNode) {
          return null;
        }
        const taskBelow = findDownInTree<Task>(taskNode);
        return taskBelow && taskBelow.id !== ROOT_TASK_ID
          ? taskBelow.data
          : null;
      };
    },
  },
  actions: {
    inspectTask(id: number | null) {
      this.inspectedTaskId = id;
    },
    editTask(id: number | null) {
      this.editingTaskId = id;
    },

    async deleteTask(id: number) {
      if (id !== NEW_TASK_ID) {
        await api.delete(`/tasks/${id}`);
      }
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

    async addTask(title: string, parentId: number | null): Promise<number> {
      const boardId = useBoardStore().selectedBoardId;
      const task = (
        await api.post<Task>("/tasks", { boardId, title, parentId })
      ).data;
      this.tasks.set(task.id, task);

      //comming from back there is an id
      return task.id!;
    },

    addTempBlankTask(origin: Task) {
      const task = {
        id: NEW_TASK_ID,
        title: "",
        parentId: origin.parentId,
        boardId: origin.boardId,
        completed: false,
        opened: false,
      } as Task;
      this.tasks.set(task.id, task);
    },
  },
});
