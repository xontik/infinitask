<script setup lang="ts">
import { onMounted } from "vue";
import { useTasksStore } from "@/stores/task";
import { useBoardStore } from "@/stores/board";
import { storeToRefs } from "pinia";
import ITTree from "@/components/ITTree.vue";

const tasksStore = useTasksStore();
const boardStore = useBoardStore();
const { selectedBoard: board } = storeToRefs(boardStore);

onMounted(async () => {
  if (!board.value) throw new Error("missing curretn board");
  await tasksStore.loadTasks(board.value?.id);
});
</script>

<template>
  <main tabindex="-1">
    <h1>{{ board?.title }}</h1>
    <div>
      <ITTree />
    </div>
  </main>
</template>

<style lang="scss"></style>
