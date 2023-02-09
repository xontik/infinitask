<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { PropType } from "vue";
import type { TreeNode } from "@/lib/tree";
import type { Task } from "@/stores/tasks";

const ITNode = defineAsyncComponent(() => import("./ITNode.vue"));

defineProps({
  tasks: { type: Array as PropType<TreeNode<Task>[]>, required: true },
});
</script>
<template>
  <ul class="node-children">
    <ITNode v-for="child in tasks" :key="String(child.id)" :node="child" />
  </ul>
</template>

<style lang="scss"></style>
