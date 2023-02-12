<script setup lang="ts">
import { useTasksStore } from "@/stores/task";
import { storeToRefs } from "pinia";
import { onMounted, onBeforeUnmount } from "vue";

import ITTreeChildren from "./ITTreeChildren.vue";

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
  console.log("enter");
  const task = findTaskToBaseMouvementOn();
  if (!task) return;

  if (tasksStore.editingTask) {
    console.log("add task bellow editing task");
  } else {
    console.log("add task bellow inspected task");
  }
};
const keydown = (e: KeyboardEvent) => {
  if (e.key === "ArrowDown") {
    down();
  }
  if (e.key === "ArrowUp") {
    up();
  }
  if (e.key === "Enter") {
    enter();
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
  <div class="task-tree">
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
