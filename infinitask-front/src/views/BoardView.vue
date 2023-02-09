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
      <InputText
        v-model="newTitle"
        placeholder="New task"
        @keyup.enter="addTask"
      />
      <div class="tree-container">
        <ITNode v-if="tasksTree" :node="tasksTree" />
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
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
