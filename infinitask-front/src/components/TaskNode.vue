<script lang="ts">
import { defineComponent, ref, toRefs, nextTick, watch } from "vue";
import type { PropType } from "vue";
import { useTasksStore } from "../stores/tasks";
import type { TaskNode } from "../stores/tasks";

export default defineComponent({
  name: "TaskNode",
  props: {
    modelValue: { type: Object as PropType<TaskNode>, required: true },
  },
  emits: ["update:modelValue", "move-up", "move-down", "close"],
  setup(props, { emit }) {
    const tasksStore = useTasksStore();
    const { modelValue } = toRefs(props);
    const newTitle = ref("");
    const input = ref(null);

    const updateTask = () => {
      if (modelValue.value.editing === false) return;
      emit("close");
      tasksStore.updateTask(modelValue.value.id, newTitle.value);
    };
    const removeTask = () => {
      tasksStore.removeTask(modelValue.value.id);
    };
    const open = async () => {
      if (modelValue.value.editing !== true) return;
      newTitle.value = modelValue.value.title;
      await nextTick();
      input.value.$el.focus();
    };

    watch(modelValue, (newVal) => {
      if (newVal.editing === true) {
        open();
      }
    });

    const close = () => {
      emit("close");
    };

    const moveUp = () => {
      console.log("move up");
      emit("move-up");
    };
    const moveDown = () => {
      console.log("move down");
      emit("move-down");
    };
    return {
      newTitle,
      input,
      removeTask,
      updateTask,
      open,
      close,
      moveUp,
      moveDown,
    };
  },
});
</script>
<template>
  <div class="task-node">
    <Inplace
      :active="modelValue.editing"
      @close="close"
      @open="open"
      class="inplace"
      tabindex="-1"
    >
      <template #display>
        {{ modelValue.title }}
      </template>
      <template #content>
        <InputText
          v-model="newTitle"
          @keyup.enter="updateTask"
          @keydown.space.stop
          @blur="updateTask"
          @keydown.esc="close"
          @keydown.up="moveUp"
          @keydown.down="moveDown"
          tabindex="-1"
          ref="input"
        />
      </template>
    </Inplace>
    {{ modelValue.id }}
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
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: #f0f0f0;
  margin: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .inplace {
    flex-grow: 1;
  }
}
</style>
