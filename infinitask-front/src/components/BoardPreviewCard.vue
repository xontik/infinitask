<script lang="ts">
import { defineComponent, ref, toRefs, onMounted } from "vue";
import type { PropType } from "vue";
import { useRouter } from "vue-router";
import { useTasksStore } from "../stores/tasks";
import type { Board } from "../stores/tasks";

export default defineComponent({
  name: "BoardPreviewCard",
  props: {
    board: { type: Object as PropType<Board>, required: true },
  },
  setup(props) {
    const router = useRouter();

    const tasksStore = useTasksStore();
    const { board } = toRefs(props);

    const newTitle = ref("");

    const updateBoard = () => {
      tasksStore.updateBoard(board.value.id, newTitle.value);
    };
    const removeBoard = () => {
      tasksStore.removeBoard(board.value.id);
    };

    const goToBoard = async () => {
      await router.push({ name: "board", params: { id: board.value.id } });
      return false;
    };

    onMounted(async () => {
      newTitle.value = board.value.title;
    });
    return {
      newTitle,
      removeBoard,
      updateBoard,
      goToBoard,
    };
  },
});
</script>
<template>
  <div class="board-card shadow-2">
    <div class="top">
      <input
        v-model="newTitle"
        @keyup.enter="updateBoard"
        @blur="updateBoard"
      />

      <button type="button" @click="removeBoard" class="p-button-text">
        Delete
      </button>
    </div>
    <div class="content">
      <ul>
        <li>Task : {{ Math.round(Math.random() * 8) }}</li>
      </ul>
    </div>
    <div class="foot">
      <button @click="goToBoard">Open board</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.board-card {
  display: flex;
  flex-direction: column;
  min-width: 270px;
  box-shadow: 2px 2px 5px 0px rgba(0, 0, 0, 0.2);

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1em;
  }
  .content {
    width: 100%;
  }

  .foot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1em;
  }
}
</style>
