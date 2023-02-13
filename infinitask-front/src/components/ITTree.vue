<script setup lang="ts">
import { useTasksStore } from "@/stores/task";
import { storeToRefs } from "pinia";
import ITTreeChildren from "./ITTreeChildren.vue";
import { onBeforeUnmount, onMounted } from "vue";
import { NEW_TASK_ID } from "@/stores/task";
import { findInTree } from "@/lib/tree";

const tasksStore = useTasksStore();
const { tasksTree } = storeToRefs(tasksStore);

const down = () => {
  console.log("down");
  const task = findTaskToBaseMouvementOn();
  if (!task) return;
  const taskBelow = tasksStore.taskBelow(task);
  if (!taskBelow) return;

  if (tasksStore.editingTask) {
    tasksStore.editTask(taskBelow.id);
  }
  tasksStore.inspectTask(taskBelow.id);
};
const up = () => {
  console.log("up");
  const task = findTaskToBaseMouvementOn();
  if (!task) return;
  const taskAbove = tasksStore.taskAbove(task);
  if (!taskAbove) return;

  console.log("taskAbove", taskAbove);
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
const enter = () => {
  console.log("enter tree");
  const task = findTaskToBaseMouvementOn();
  if (!task) return;
  tasksStore.addTempBlankTask(task);
  tasksStore.editTask(NEW_TASK_ID);
};
const keydown = (e: KeyboardEvent) => {
  //TODO verifier qu'on a le focus
  if (e.key === "ArrowDown") {
    down();
  }
  if (e.key === "ArrowUp") {
    up();
  }
  if (e.key === "Enter") {
    enter();
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
      //TODO changement recursif de parent
      tasksStore.updateTask({ ...task, parentId: nodeTask.parent?.id });
    } else {
      const taskAbove = tasksStore.taskAbove(task);
      if (!taskAbove) return;

      if (!taskAbove.opened) {
        tasksStore.updateTask({ ...taskAbove, opened: true });
      }
      //TODO changement recursif de parent
      tasksStore.updateTask({ ...task, parentId: taskAbove.id });
    }
  }
};
onMounted(() => {
  document.addEventListener("keydown", keydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", keydown);
});
</script>
<template>
  <div class="task-tree" tabindex="0">
    <ITTreeChildren
      v-if="tasksTree?.children"
      :task-nodes="tasksTree.children"
    />
  </div>
</template>

<style lang="scss">
.task-tree {
  font-size: 2rem;
}
</style>
