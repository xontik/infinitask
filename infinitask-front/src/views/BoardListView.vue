<script lang="ts">
import { storeToRefs } from "pinia";
import { defineComponent, onMounted, ref } from "vue";
import { useBoardStore } from "@/stores/board";
import BoardPreviewCard from "../components/BoardPreviewCard.vue";
export default defineComponent({
  name: "BoardListView",
  setup() {
    const boardStore = useBoardStore();
    const { boards } = storeToRefs(boardStore);

    const newTitle = ref("");
    const newTitleForUpdate = ref("");

    const addBoard = () => {
      boardStore.addBoard(newTitle.value);
      newTitle.value = "";
    };
    const updateBoard = (id) => {
      console.log(newTitleForUpdate.value, id);
    };
    const removeBoard = (id: number) => {
      boardStore.removeBoard(id);
    };
    onMounted(async () => {
      await boardStore.loadBoards();
    });
    return {
      boards,
      newTitle,
      newTitleForUpdate,
      addBoard,
      removeBoard,
      updateBoard,
    };
  },
  components: { BoardPreviewCard },
});
</script>

<template>
  <div class="board-card-container">
    <BoardPreviewCard v-for="board in boards" :key="board.id" :board="board" />
    <div class="board-card shadow-2">
      <div class="top">
        <input
          type="text"
          v-model="newTitle"
          placeholder="New board"
          @keyup.enter="addBoard"
        />
        <button @click="addBoard" class="p-button-text p-1">Add</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.board-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  .board-card {
    display: flex;
    flex-direction: column;
    min-width: 300px;
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 1em;
    }
  }
}
</style>
