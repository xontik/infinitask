<script lang="ts">
import { defineComponent, ref, toRefs, nextTick, watch, computed } from "vue";
import type { PropType } from "vue";
import { useTasksStore } from "../stores/tasks";
import type { TaskNode } from "../stores/tasks";

export default defineComponent({
  name: "TaskNode",
  props: {
    modelValue: { type: Object as PropType<TaskNode>, required: true },
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
      if (newTitle.value === modelValue.value.title) return;

      emit("close");
      tasksStore.updateTask(modelValue.value.id, newTitle.value);
    };
    const removeTask = () => {
      tasksStore.removeTask(modelValue.value.id);
    };
    const open = async () => {
      if (editing.value !== true) return;
      newTitle.value = modelValue.value.title;
      await nextTick();
      input.value.$el.focus();
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
      if (modelValue.value.up === null) return;
      updateTask();
      emit("move-to", modelValue.value.up);
    };
    const moveDown = () => {
      if (modelValue.value.down === null) return;
      updateTask();
      emit("move-to", modelValue.value.down);
    };
    const enter = () => {
      if (editing.value !== true) return;
      console.log("enter");
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
    const left = (e) => {
      e.preventDefault();
      if (
        modelValue.value.expanded === false ||
        modelValue.value.children.length === 0
      )
        return false;
      emit("collapse", modelValue.value.expanded);
    };
    const right = (e) => {
      e.preventDefault();
      if (modelValue.value.title === "") return false;
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
        <div tabindex="-1">{{ modelValue.title }}</div>
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
    {{ modelValue.id }}
    {{ modelValue.expanded }} === up: {{ modelValue.up }} down:
    {{ modelValue.down }}
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
