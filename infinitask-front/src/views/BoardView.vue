<script lang="ts">
import { defineComponent, onMounted, ref, computed, nextTick } from "vue";
import { useTasksStore } from "../stores/tasks";
import { storeToRefs } from "pinia";
import TaskNode from "@/components/TaskNode.vue";
import ITNode from "@/components/ITNode.vue";
import { mapTree, findUpDown } from "../lib/tree";

export default defineComponent({
  name: "BoardView",
  setup() {
    const tasksStore = useTasksStore();
    const { currentBoard: board, tasksTree } = storeToRefs(tasksStore);
    const newTitle = ref("");
    const expandedKeys = ref({});
    const editingKey = ref(-1);
    const addTask = () => {
      tasksStore.addTask(board.value.id, newTitle.value);
      newTitle.value = "";
    };
    const computedTasksTree = computed(() => {
      console.log("computedTasksTree");
      return tasksTree.value
        ? mapTree(
            mapTree(tasksTree.value, (node) => {
              node.key = node.id;
              node.label = node.title;
              node.visible =
                node.parent === null ||
                node.parent.id === null ||
                !!expandedKeys.value[node.parent.id];
              node.expanded = !!expandedKeys.value[node.id];
              node.collapsedIcon =
                !node.children || node.children.length === 0
                  ? "pi pi-fw pi-minus"
                  : null;
              node.expandedIcon =
                !node.children || node.children.length === 0
                  ? "pi pi-fw pi-minus"
                  : null;

              return node;
            }),
            (node) => {
              const { up, down } = findUpDown(node);
              node.up = up;
              node.down = down;

              return node;
            }
          )
        : null;
    });
    const listForTree = computed(() => {
      return computedTasksTree.value ? computedTasksTree.value.children : [];
    });

    onMounted(async () => {
      await tasksStore.loadTasks(board.value.id);
    });
    const moveTo = async (from, to) => {
      if (to === null) return;
      // if (expandedKeys.value[from] !== true) {
      //   expandedKeys.value = { ...expandedKeys.value, [from]: true };
      // }
      await nextTick();
      editingKey.value = to;
    };

    return {
      board,
      computedTasksTree,
      listForTree,
      tasksTree,
      newTitle,
      expandedKeys,
      addTask,
      editingKey,
      select: async (a) => {
        // editingKey.value = -1;
        // .key necessary because a is a TreeNode not a TaskNode
        nextTick(() => {
          editingKey.value = a.key;
        });
      },
      close: (a) => {
        if (a === editingKey.value) {
          editingKey.value = -1;
        }
      },
      moveTo,
      expand: (a) => {
        expandedKeys.value = { ...expandedKeys.value, [a]: true };
      },
      collapse: (a) => {
        expandedKeys.value = { ...expandedKeys.value, [a]: false };
      },
      newTask: async (parent) => {
        editingKey.value = await tasksStore.addTask(
          parent.boardId,
          "",
          parent.id
        );
      },
      moveTask: async (task, to) => {
        await tasksStore.moveTask(task.id, to);
      },
    };
  },
  components: { TaskNode, ITNode },
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
      <div class="tree-container">
        <Tree
          :value="listForTree"
          v-model:expandedKeys="expandedKeys"
          @node-select="select"
          selectionMode="single"
        >
          <template #default="slotProps">
            <TaskNode
              :model-value="slotProps.node"
              :editing-key="editingKey"
              @move-to="(to) => moveTo(slotProps.node.key, to)"
              @close="close(slotProps.node.key)"
              @expand="expand(slotProps.node.key)"
              @collapse="collapse(slotProps.node.key)"
              @new-child="newTask(slotProps.node)"
              @new-brother="newTask(slotProps.node.parent)"
            />
          </template>
        </Tree>
        <div class="ittree-container">
          <ITNode v-if="tasksTree" :node="tasksTree" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.ittree-container {
}
.tree-container {
  display: flex;

  & > * {
    width: 50%;
  }
}
::v-deep(.p-tree) {
  --tree-node-padding-bottom: 5px;
  text-decoration: none;
  .p-component {
    font-weight: 500;
  }
  .pi-fw {
    width: auto;
  }

  .p-tree-container {
    position: relative;

    .p-treenode:not(.p-treenode-leaf)[aria-expanded="true"] {
      position: relative;
      padding: 0;
      // &::before {
      //   content: "";
      //   display: block;
      //   width: 10px;
      //   height: calc(
      //     100% - 40px - var(--tree-node-padding-bottom) * 2 - (10px * 2)
      //   );
      //   border-left: 1px solid black;
      //   // border-bottom: 1px solid black;
      //   position: absolute;
      //   top: calc(
      //     40px + 10px + var(--tree-node-padding-bottom) + 10px
      //   ); //calc(40px + var(--tree-node-padding-bottom) * 2 - 1px);
      //   left: calc(8px + var(--tree-node-padding-bottom));
      // }
    }
    .p-treenode {
      padding: 0;
      &:focus > .p-treenode-content {
        box-shadow: none;
      }
    }
    .p-treenode-label {
      display: block;
      width: 100%;
    }
    .p-treenode-children {
      position: relative;
      margin-left: 16px;
    }

    .p-treenode-content {
      &:focus-within {
        background-color: #ececec;

        input {
          background-color: #ececec;
          border: none;
          box-shadow: none;
        }
      }
      box-shadow: none;
      padding: var(--tree-node-padding-bottom);
      &.p-treenode-selectable:not(.p-highlight):hover {
        background-color: transparent;
        &:focus-within {
          background-color: #ececec;
        }
      }

      position: relative;
      &::after {
        content: "";
        display: block;
        width: calc(100% - var(--tree-node-padding-bottom) * 2);
        height: 0;
        border-bottom: 1px solid black;
        position: absolute;
        bottom: 0px;
        left: calc(8px + va(--tree-node-padding-bottom));
      }
      .p-tree-toggler {
        text-decoration: none;
        width: 16px;
        height: 1rem;
        visibility: visible;
        margin: 0;
      }
    }
  }
}
</style>
