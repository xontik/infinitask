<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useTasksStore } from "../stores/tasks";
import { storeToRefs } from "pinia";
import ITNode from "@/components/ITNode.vue";

export default defineComponent({
  name: "BoardView",
  setup() {
    const tasksStore = useTasksStore();
    const { currentBoard: board, tasksTree } = storeToRefs(tasksStore);
    const newTitle = ref("");
    const addTask = () => {
      if (!board.value) throw new Error("missing curretn board");

      tasksStore.addTask(board.value.id, newTitle.value);
      newTitle.value = "";
    };

    onMounted(async () => {
      if (!board.value) throw new Error("missing curretn board");
      await tasksStore.loadTasks(board.value?.id);
    });

    return {
      board,
      tasksTree,
      newTitle,
      addTask,
    };
  },
  components: { ITNode },
});
</script>

<template>
  <main>
    <h1>{{ board?.title }}</h1>
    <div>
      <input v-model="newTitle" placeholder="New task" @keyup.enter="addTask" />
      <div class="tree-container">
        <ITNode v-if="tasksTree" :node="tasksTree" />
      </div>
    </div>
  </main>
</template>

<style lang="scss"></style>
