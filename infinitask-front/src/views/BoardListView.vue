<script lang="ts">
import { storeToRefs } from "pinia";
import { defineComponent, onMounted, ref } from "vue";
import { useTasksStore } from "../stores/tasks";
import BoardPreviewCard from "../components/BoardPreviewCard.vue";
export default defineComponent({
  name: "BoardListView",
  setup() {
    const tasksStore = useTasksStore();
    const { boards } = storeToRefs(tasksStore);

    const newTitle = ref("");
    const newTitleForUpdate = ref("");

    const addBoard = () => {
      tasksStore.addBoard(newTitle.value);
      newTitle.value = "";
    };
    const updateBoard = (id) => {
      console.log(newTitleForUpdate.value, id);
    };
    const removeBoard = (id: number) => {
      tasksStore.removeBoard(id);
    };
    onMounted(async () => {
      await tasksStore.loadBoards();
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
        <InputText
          v-model="newTitle"
          placeholder="New board"
          @keyup.enter="addBoard"
        />
        <Button @click="addBoard" icon="pi pi-plus" class="p-button-text p-1" />
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
