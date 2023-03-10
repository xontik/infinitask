<script setup lang="ts">
import { NO_TASK_ID, useTasksStore } from "@/stores/task";
import { storeToRefs } from "pinia";
import ITTreeChildren from "./ITTreeChildren.vue";
import { onBeforeUnmount, onMounted, ref, nextTick, computed } from "vue";
import { NEW_TASK_ID } from "@/stores/task";
import { findInTree } from "@/lib/tree";

const tasksStore = useTasksStore();
const { tasksTree, tasksCompleted } = storeToRefs(tasksStore);
const tree = ref<HTMLElement | null>(null);
const showCompleted = computed({
  get: () => tasksStore.showCompleted,
  set: (value: boolean) => {
    tasksStore.setShowCompleted(value);
  },
});

const down = () => {
  const task = findTaskToBaseMouvementOn();
  if (!task) {
    const firstTask = tasksStore.firstTask;
    if (firstTask) {
      tasksStore.inspectTask(firstTask.id);
    }
    return;
  }
  const taskBelow = tasksStore.taskBelow(task);
  if (!taskBelow) return;

  if (tasksStore.editingTask) {
    tasksStore.editTask(taskBelow.id);
  }
  tasksStore.inspectTask(taskBelow.id);
};
const up = () => {
  const task = findTaskToBaseMouvementOn();
  if (!task) {
    const lastTask = tasksStore.lastTask;
    if (lastTask) {
      tasksStore.inspectTask(lastTask.id);
    }
    return;
  }
  const taskAbove = tasksStore.taskAbove(task);
  if (!taskAbove) return;

  if (tasksStore.editingTask) {
    tasksStore.editTask(taskAbove.id);
  }

  tasksStore.inspectTask(taskAbove.id);
};

const findTaskToBaseMouvementOn = () => {
  let task = null;
  if (tasksStore.editingTask !== null) {
    task = tasksStore.editingTask;
  } else {
    task = tasksStore.inspectedTask;
  }
  return task;
};
const enter = (e: KeyboardEvent) => {
  const task = findTaskToBaseMouvementOn();
  if (!task) return;
  if (tasksStore.editingTask?.id === NEW_TASK_ID) {
    tasksStore.editTask(NO_TASK_ID);
    const taskAbove = tasksStore.taskAbove(task);
    tasksStore.deleteTask(task.id);
    if (taskAbove) {
      tasksStore.inspectTask(taskAbove.id);
    }
  }
  nextTick(() => {
    let taskId = task.parentId;
    if (e.ctrlKey) {
      taskId = task.id;
      if (!task.opened) {
        tasksStore.updateTask({ ...task, opened: true });
      }
    }
    tasksStore.addTempBlankTask(taskId);
    tasksStore.editTask(NEW_TASK_ID);
    tasksStore.inspectTask(NEW_TASK_ID);
  });
};
const keydown = async (e: KeyboardEvent) => {
  const active = tree.value?.contains(document.activeElement);
  if (!active) {
    console.log("not active", document.activeElement);
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    down();
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    up();
  }
  if (e.key === "Enter") {
    enter(e);
  }
  if (e.key === "ArrowRight") {
    if (
      (tasksStore.editingTask && e.ctrlKey) ||
      (tasksStore.editingTask === null && !e.ctrlKey)
    ) {
      const task = tasksStore.inspectedTask;
      if (!task || task.opened) return;
      tasksStore.updateTask({
        ...task,
        opened: true,
      });
    }
  }
  if (e.key === "ArrowLeft") {
    if (
      (tasksStore.editingTask && e.ctrlKey) ||
      (tasksStore.editingTask === null && !e.ctrlKey)
    ) {
      const task = tasksStore.inspectedTask;
      if (!task || !task.opened) return;
      tasksStore.updateTask({
        ...task,
        opened: false,
      });
    }
  }
  if (e.key === "Tab") {
    const task = tasksStore.editingTask;
    if (!task || !tasksTree.value) return;
    e.preventDefault();

    if (e.shiftKey) {
      const nodeTask = findInTree(tasksTree.value, task.parentId);
      if (!nodeTask) return;

      if (task.id === NEW_TASK_ID) {
        await tasksStore.deleteTask(task.id);
        nextTick(async () => {
          //TODO how to keep title on new task with tab
          if (!nodeTask.parent) return;
          await tasksStore.addTempBlankTask(nodeTask.parent.id);
          tasksStore.editTask(NEW_TASK_ID);
        });
        return;
      }
      tasksStore.updateTask({ ...task, parentId: nodeTask.parent?.id });
      nextTick(() => {
        tasksStore.editTask(task.id);
      });

      return;
    }
    const taskAbove = tasksStore.taskAbove(task);
    if (!taskAbove) return;

    if (!taskAbove.opened) {
      tasksStore.updateTask({ ...taskAbove, opened: true });
    }

    if (task.id === NEW_TASK_ID) {
      await tasksStore.deleteTask(task.id);
      nextTick(async () => {
        await tasksStore.addTempBlankTask(taskAbove.id);
        tasksStore.editTask(NEW_TASK_ID);
      });
      return;
    }

    tasksStore.updateTask({ ...task, parentId: taskAbove.id });
    nextTick(() => {
      tasksStore.editTask(task.id);
    });
  }
  if (e.key === "Delete" && e.ctrlKey) {
    const task = tasksStore.inspectedTask;
    if (!task) return;
    const taskAbove = tasksStore.taskAbove(task);
    tasksStore.deleteTask(task.id);
    if (!taskAbove) return;
    tasksStore.inspectTask(taskAbove.id);
  }
};
onMounted(() => {
  document.addEventListener("keydown", keydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", keydown);
});

const uncomplete = (id: number | null) => {
  const task = tasksStore.tasks.get(id);
  if (!task) return;
  let parentId = task.parentId;
  const parent = tasksStore.tasks.get(task.parentId);
  if (!parent || parent.completed) {
    parentId = null;
  }
  tasksStore.updateTask({ id, parentId, completed: false });
};
</script>
<template>
  <div class="task-tree" tabindex="1" ref="tree" v-focus>
    <button @click="showCompleted = !showCompleted">
      {{ showCompleted ? "Hide completed" : " Show completed" }}
    </button>
    <ITTreeChildren
      v-if="tasksTree?.children"
      :task-nodes="tasksTree.children"
    />
    <div v-if="!showCompleted" class="task-tree__completed-list">
      <ul>
        <li
          v-for="task in tasksCompleted"
          :key="'' + task.id"
          @click="uncomplete(task.id)"
        >
          {{ task.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.task-tree {
  font-size: 2rem;
  overflow-y: scroll;
  height: 80vh;

  &__completed-list {
    text-decoration: line-through;
    background-color: #a5a5a5;
  }
}
</style>
