<script lang="ts">
import { defineComponent, ref, toRefs, nextTick, watch, computed } from "vue";
import type { PropType } from "vue";
import { useTasksStore, type Task } from "../stores/task";
import type { TreeNode } from "@/lib/tree";

export default defineComponent({
  name: "TaskNode",
  props: {
    modelValue: { type: Object as PropType<TreeNode<Task>>, required: true },
    editingKey: { type: Number, required: true },
  },
  emits: [
    "update:modelValue",
    "move-to",
    "close",
    "expand",
    "collapse",
    "select",
    "new-child",
    "new-brother",
  ],
  setup(props, { emit }) {
    const tasksStore = useTasksStore();
    const { modelValue, editingKey } = toRefs(props);

    const newTitle = ref("");
    const input = ref(null);
    const editing = computed(() => {
      return editingKey.value === modelValue.value.id;
    });
    const updateTask = () => {
      if (editing.value === false) return;
      if (newTitle.value === "") {
        removeTask();
        emit("close");
        return;
      }
      if (newTitle.value === modelValue.value.data.title) return;

      emit("close");
      if (modelValue.value.id === null) throw new Error("id is null on update");
      tasksStore.updateTask(modelValue.value.id, newTitle.value);
    };
    const removeTask = () => {
      if (modelValue.value.id === null) throw new Error("id is null on remove");
      tasksStore.removeTask(modelValue.value.id);
    };
    const open = async () => {
      if (editing.value !== true) return;
      newTitle.value = modelValue.value.data.title;
      await nextTick();
      if (input.value) input.value.$el.focus();
    };

    watch(editing, (newVal) => {
      if (newVal === true) {
        open();
      }
    });

    const close = () => {
      emit("close");
    };

    const moveUp = () => {
      if (modelValue.value.data.up === null) return;
      updateTask();
      emit("move-to", modelValue.value.data.up);
    };
    const moveDown = () => {
      if (modelValue.value.data.down === null) return;
      updateTask();
      emit("move-to", modelValue.value.data.down);
    };
    const enter = () => {
      if (editing.value !== true) return;
      updateTask();
    };
    const newChild = () => {
      enter();
      emit("new-child");
    };
    const newBrother = () => {
      enter();
      emit("new-brother");
    };
    const left = (e: KeyboardEvent) => {
      e.preventDefault();
      if (
        modelValue.value.expanded === false ||
        modelValue.value.children.length === 0
      )
        return false;
      emit("collapse", modelValue.value.expanded);
    };
    const right = (e: KeyboardEvent) => {
      e.preventDefault();
      if (modelValue.value.data.title === "") return false;
      if (
        modelValue.value.expanded === true ||
        modelValue.value.children.length === 0
      ) {
        updateTask();
        emit("new-child");
      }
      emit("expand", modelValue.value.expanded);
    };
    return {
      newTitle,
      editing,
      input,
      removeTask,
      updateTask,
      open,
      close,
      moveUp,
      moveDown,
      left,
      right,
      enter,
      newChild,
      newBrother,
    };
  },
});
</script>
<template>
  <div class="task-node">
    <Inplace
      :active="editing"
      @close="close"
      @open="open"
      class="inplace"
      tabindex="-1"
    >
      <template #display>
        <div tabindex="-1">{{ modelValue.data.title }}</div>
      </template>
      <template #content>
        <InputText
          class="title-input"
          v-model="newTitle"
          @keyup.enter.exact.stop="enter"
          @keyup.enter.ctrl.stop="newBrother"
          @keydown.space.stop
          @keydown.left.exact.stop
          @keydown.right.exact.stop
          @keydown.left.ctrl="left"
          @keydown.right.ctrl="right"
          @blur="
            updateTask();
            close();
          "
          @keydown.esc="close"
          @keydown.up="moveUp"
          @keydown.down="moveDown"
          tabindex="-1"
          ref="input"
        />
      </template>
    </Inplace>
    <Button
      @click="removeTask"
      tabindex="-1"
      icon="pi pi-trash"
      class="p-button-text"
    />
  </div>
</template>

<style lang="scss">
.task-node {
  height: 40px;
  .title-input {
    width: 100%;
  }
  .p-inplace-content {
    padding: 0;
    width: 100%;
  }
  padding: 0;
  border-radius: 0.25rem;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .p-inplace {
    .p-inplace-display {
      &:not(.p-disabled):hover {
        background-color: transparent;
      }
      display: block;
      &:focus {
        box-shadow: none;
      }
    }
  }
  .inplace {
    flex-grow: 1;
  }
}
</style>
