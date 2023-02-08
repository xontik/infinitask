<script lang="ts">
import { defineComponent, onMounted, ref, computed, nextTick } from "vue";
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
    const expandedKeys = ref({});
    const editingKey = ref(null);
    const addTask = () => {
      tasksStore.addTask(board.value.id, newTitle.value);
      newTitle.value = "";
    };
    const computedTasksTree = computed(() => {
      return tasksTree.value
        ? mapTree(tasksTree.value, (node) => {
            const { up, down } = findUpDown(node);

            return {
              key: node.id,
              label: node.title,
              data: {
                ...node,
                up,
                down,
                editing: editingKey.value === node.id,
              },
            };
          })
        : null;
    });
    const listForTree = computed(() => {
      return computedTasksTree.value ? computedTasksTree.value.children : [];
    });

    onMounted(async () => {
      await tasksStore.loadTasks(board.value.id);
    });
    const moveTo = async (from, to) => {
      if (to === -1) return;
      expandedKeys.value = { ...expandedKeys.value, [from]: true };
      await nextTick();
      editingKey.value = to;
    };

    return {
      board,
      computedTasksTree,
      listForTree,
      newTitle,
      expandedKeys,
      addTask,
      editingKey,
      select: async (a) => {
        console.log("select", a);
        editingKey.value = null;
        nextTick(() => {
          editingKey.value = a.key;
        });
      },
      close: (a) => {
        console.log("close", a);
        editingKey.value = null;
      },
      moveTo,
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
        :value="listForTree"
        v-model:expandedKeys="expandedKeys"
        @node-select="select"
        selectionMode="single"
      >
        <template #default="slotProps">
          <TaskNode
            v-model="slotProps.node.data"
            @move-to="(to) => moveTo(slotProps.node.key, to)"
            @close="close(slotProps.node.key)"
          />
        </template>
      </Tree>
    </div>
  </main>
</template>
