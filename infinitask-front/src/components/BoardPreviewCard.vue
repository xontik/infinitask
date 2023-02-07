<script lang="ts">
import { defineComponent, ref, toRefs, nextTick } from "vue";
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
    const editing = ref(false);
    const input = ref(null);

    const updateBoard = () => {
      if (editing.value === false) return;
      editing.value = false;
      tasksStore.updateBoard(board.value.id, newTitle.value);
    };
    const removeBoard = () => {
      tasksStore.removeBoard(board.value.id);
    };
    const open = async () => {
      newTitle.value = board.value.title;
      editing.value = true;
      await nextTick();
      input.value.$el.focus();
    };

    const goToBoard = async () => {
      await router.push({ name: "board", params: { id: board.value.id } });
      return false;
    };

    const close = () => {
      editing.value = false;
    };
    return {
      newTitle,
      editing,
      input,
      removeBoard,
      updateBoard,
      open,
      close,
      goToBoard,
    };
  },
});
</script>
<template>
  <div class="board-card shadow-2">
    <div class="top">
      <Inplace :active="editing" @close="close" @open="open" class="inplace">
        <template #display>
          {{ board.title }}
        </template>
        <template #content>
          <InputText
            v-model="newTitle"
            @keyup.enter="updateBoard"
            @blur="updateBoard"
            @keydown.esc="close"
            ref="input"
          />
        </template>
      </Inplace>

      <Button @click="removeBoard" icon="pi pi-trash" class="p-button-text" />
    </div>
    <div class="content">
      <ul>
        <li>Task : {{ Math.round(Math.random() * 8) }}</li>
      </ul>
    </div>
    <div class="foot">
      <Button
        @click="goToBoard"
        label="Open board"
        icon="pi pi-arrow-right
"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.board-card {
  display: flex;
  flex-direction: column;
  min-width: 270px;

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
