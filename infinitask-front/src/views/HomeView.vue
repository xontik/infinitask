<script lang="ts">
import { storeToRefs } from "pinia";
import { defineComponent, onMounted, ref } from "vue";
import { useTasksStore } from "../stores/tasks";
export default defineComponent({
  name: "HomeView",
  setup() {
    const tasksStore = useTasksStore();
    const { boards } = storeToRefs(tasksStore);

    const newTitle = ref("");

    const addBoard = () => {
      tasksStore.addBoard(newTitle.value);
    };
    const removeBoard = (id: number) => {
      tasksStore.removeBoard(id);
    };
    onMounted(async () => {
      await tasksStore.loadBoards();
    });
    return { boards, newTitle, addBoard, removeBoard };
  },
});
</script>

<template>
  <main>Home</main>
  <ul>
    <li v-for="board in boards" :key="board.id">
      {{ board.title }}<v-btn @click="removeBoard(board.id)">-</v-btn>
    </li>
    <li>
      <v-text-field
        v-model="newTitle"
        label="Title"
        type="text"
        required
      ></v-text-field
      ><v-btn @click="addBoard">+</v-btn>
    </li>
  </ul>
</template>
