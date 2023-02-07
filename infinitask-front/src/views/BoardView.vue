<script lang="ts">
import { defineComponent, onMounted, ref, computed, reactive } from "vue";
import { useTasksStore } from "../stores/tasks";
import { storeToRefs } from "pinia";
import TaskNode from "@/components/TaskNode.vue";
import { mapTree, findUpDown } from "../lib/tree";

export default defineComponent({
  name: "BoardView",
  setup() {
    const tasksStore = useTasksStore();
    const { currentBoard: board, tasksTree } = storeToRefs(tasksStore);
    const newTitle = ref("");
    const expandedKeys = reactive({});
    const editingKeys = reactive({});
    const addTask = () => {
      tasksStore.addTask(board.value.id, newTitle.value);
      newTitle.value = "";
    };
    const computedTasksTree = computed(() => {
      return mapTree(tasksTree.value, (node) => {
        return {
          key: node.id,
          label: node.title,
          data: {
            ...node,
            editing: !!editingKeys[node.id],
          },
        };
      });
    });
    onMounted(async () => {
      await tasksStore.loadTasks(board.value.id);
    });
    const moveDown = (key) => {
      const { down, up } = findUpDown(computedTasksTree.value[0], key, "key");
      console.log(`up: ${up}, down: ${down}`);

      if (down === -1) return;
      expandedKeys[key] = true;
      editingKeys[down] = true;
      editingKeys[key] = false;
    };

    const moveUp = (key) => {
      const { up, down } = findUpDown(computedTasksTree.value[0], key, "key");
      console.log(`up: ${up}, down: ${down}`);

      if (up === -1) return;

      expandedKeys[up] = true;
      editingKeys[up] = true;
      editingKeys[key] = false;
    };

    return {
      board,
      computedTasksTree,
      newTitle,
      expandedKeys,
      addTask,
      editingKeys,
      select: (a) => {
        editingKeys[a.key] = true;
      },
      close: (a) => {
        editingKeys[a.key] = false;
      },
      moveDown,
      moveUp,
    };
  },
  components: { TaskNode },
});
</script>

<template>
  <main>
    <h1>{{ board.title }}</h1>
    <div>
      <InputText
        v-model="newTitle"
        placeholder="New task"
        @keyup.enter="addTask"
      />
      <Tree
        :value="computedTasksTree"
        v-model:expandedKeys="expandedKeys"
        @node-select="select"
        @node-unselect="close"
        selectionMode="single"
      >
        <template #default="slotProps">
          <TaskNode
            v-model="slotProps.node.data"
            @move-down="moveDown(slotProps.node.key)"
            @move-up="moveUp(slotProps.node.key)"
            @close="close(slotProps.node.key)"
          />
        </template>
      </Tree>
    </div>
  </main>
</template>
