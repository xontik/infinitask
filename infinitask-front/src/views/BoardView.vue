<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useTasksStore } from "@/stores/task";
import { useBoardStore } from "@/stores/board";
import { storeToRefs } from "pinia";
import ITTree from "@/components/ITTree.vue";

const tasksStore = useTasksStore();
const boardStore = useBoardStore();
const { selectedBoard: board } = storeToRefs(boardStore);
const newTitle = ref("");

const addTask = () => {
  if (!board.value) throw new Error("missing curretn board");

  tasksStore.addTask(newTitle.value);
  newTitle.value = "";
};

onMounted(async () => {
  if (!board.value) throw new Error("missing curretn board");
  await tasksStore.loadTasks(board.value?.id);
});
</script>

<template>
  <main>
    <h1>{{ board?.title }}</h1>
    <div>
      <input v-model="newTitle" placeholder="New task" @keyup.enter="addTask" />
      <ITTree />
    </div>
  </main>
</template>

<style lang="scss"></style>
