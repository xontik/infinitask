<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { TreeNode } from "@/lib/tree";
import type { Task } from "@/stores/task";

const ITTreeNode = defineAsyncComponent(() => import("./ITTreeNode.vue"));

defineProps<{
  taskNodes: TreeNode<Task>[];
}>();
</script>
<template>
  <ul class="node-children">
    <ITTreeNode
      v-for="child in taskNodes"
      :key="String(child.id)"
      :task-node="child"
    />
  </ul>
</template>

<style lang="scss"></style>
