<script setup lang="ts">
import { useTasksStore } from "@/stores/task";
import { storeToRefs } from "pinia";

import ITTreeChildren from "./ITTreeChildren.vue";

const tasksStore = useTasksStore();
const { tasksTree } = storeToRefs(tasksStore);
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
