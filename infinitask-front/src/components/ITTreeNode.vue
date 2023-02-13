<script setup lang="ts">
import ITTreeChildren from "./ITTreeChildren.vue";
import type { TreeNode } from "@/lib/tree";
import type { Task } from "@/stores/task";
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { NO_TASK_ID, NEW_TASK_ID } from "@/stores/task";

import { useTasksStore } from "@/stores/task";
const props = defineProps<{
  taskNode: TreeNode<Task>;
}>();
const titleEdit = ref("");
const tasksStore = useTasksStore();
const { inspectedTaskId, editingTaskId } = storeToRefs(tasksStore);
const nodeRowElement = ref<HTMLElement | null>(null);

const indent = computed(() => {
  return (props.taskNode.depth || 0) * 3 + 2;
});
const isLeaf = computed(() => {
  return props.taskNode.children.length === 0;
});
const isInspected = computed(() => {
  return props.taskNode.id === inspectedTaskId.value;
});
const editing = computed(() => {
  return editingTaskId.value === props.taskNode.id;
});

const clickNode = () => {
  tasksStore.inspectTask(props.taskNode.id);
};
const clickContent = () => {
  titleEdit.value = props.taskNode.data.title;
  tasksStore.editTask(props.taskNode.id);
};
const toggleNode = () => {
  tasksStore.updateTask({
    ...props.taskNode.data,
    opened: !props.taskNode.opened,
  });
};
const updateTask = async () => {
  if (titleEdit.value === props.taskNode.data.title || titleEdit.value === "") {
    return;
  }

  if (props.taskNode.id === NEW_TASK_ID) {
    await tasksStore.addTask(titleEdit.value, props.taskNode.data.parentId);
    titleEdit.value = "";
    return;
  }

  await tasksStore.updateTask({
    ...props.taskNode.data,
    title: titleEdit.value,
  });
};

watch(
  () => editing.value,
  async (newVal: boolean, oldVal: boolean) => {
    if (!newVal && oldVal) {
      if (props.taskNode.id === NEW_TASK_ID) {
        await tasksStore.deleteTask(props.taskNode.id);
      }
      await updateTask();
    }
  }
);
watch(
  () => isInspected.value,
  (newVal: boolean, oldVal: boolean) => {
    if (newVal && !oldVal) {
      if (!editing.value) {
        nodeRowElement?.value?.focus();
        console.log(
          "isInspected",
          nodeRowElement.value,
          document.activeElement
        );
      }
    }

    if (!newVal && oldVal) {
      if (editing.value) {
        tasksStore.editTask(NO_TASK_ID);
      }
    }
  }
);
onMounted(() => {
  titleEdit.value = props.taskNode.data.title;
});

const esc = () => {
  tasksStore.editTask(NO_TASK_ID);
};

const remove = () => {
  tasksStore.editTask(NO_TASK_ID);
  tasksStore.deleteTask(props.taskNode.id!);
};

const enter = (e: KeyboardEvent) => {
  if (props.taskNode.id === NEW_TASK_ID && titleEdit.value === "") {
    e.stopPropagation();
    const taskAbove = tasksStore.taskAbove(props.taskNode.data);
    tasksStore.editTask(NO_TASK_ID);
    if (taskAbove) {
      tasksStore.inspectTask(taskAbove.id);
    }
  }
};
const blur = () => {
  nextTick(() => {
    if (editing.value) {
      tasksStore.editTask(NO_TASK_ID);
    }
  });
};
const toggleComplete = () => {
  tasksStore.toggleComplete(props.taskNode.id);
};
</script>
<template>
  <li class="task-node" @click.stop="clickNode">
    <ITTreeChildren
      v-if="!isLeaf && taskNode.opened"
      :taskNodes="taskNode.children"
    />

    <div
      :class="{
        'task-node__row': true,
        'task-node__row--is-inspected': isInspected,
      }"
      ref="nodeRowElement"
      tabindex="-1"
    >
      <div class="task-node__indent" :style="{ width: indent + 'rem' }">
        <div
          :class="{
            'task-node__checkbox': true,
            'task-node__checkbox--is-completed': taskNode.data.completed,
          }"
          @click="toggleComplete"
          v-if="taskNode.data.id !== NEW_TASK_ID"
        >
          <iconify-icon
            v-if="taskNode.data.completed"
            icon="mdi:checkbox-marked"
          />
          <iconify-icon v-else icon="mdi:checkbox-blank-outline" />
        </div>

        <div v-if="!isLeaf" class="task-node__toggler" @click="toggleNode">
          <iconify-icon v-if="taskNode.opened" icon="mdi:chevron-up" />
          <iconify-icon v-else icon="mdi:chevron-right" />
        </div>
      </div>
      <div
        :class="{
          'task-node__content': true,
          'task-node__content--is-completed': taskNode.data.completed,
        }"
      >
        <input
          v-if="editing"
          type="text"
          v-model="titleEdit"
          v-focus
          @keydown.esc="esc"
          @keydown.up.prevent
          @keydown.down.prevent
          @keydown.left.ctrl.prevent
          @keydown.right.ctrl.prevent
          @keydown.delete.ctrl.prevent
          @keydown.enter="enter"
          @blur="blur"
        />
        <span v-else @click="clickContent">{{ taskNode.data.title }} </span>
      </div>
      <div class="task-node__action" @click="remove">
        {{ taskNode.id }}
      </div>
    </div>
  </li>
</template>
<style lang="scss">
.task-node {
  position: relative;
  padding-top: 3rem;
  cursor: pointer;
  &__row {
    position: absolute;
    top: 0;
    height: 3rem;
    line-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 2px 0;

    &:focus {
      outline: 1px solid black;
    }

    &--is-inspected {
      background-color: #ccc;

      .task-node__checkbox {
        display: block;
      }
    }
    &:hover .task-node__checkbox {
      display: block;
    }
  }
  &__indent {
    text-align: right;
    display: flex;
    justify-content: flex-end;
  }
  &__content {
    flex-grow: 1;
    &--is-completed {
      text-decoration: line-through;
    }
  }

  &__action {
    width: 100px;
    text-align: right;
  }
  &__toggler {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #ccc;
    text-align: center;
    line-height: 3rem;
    cursor: pointer;
  }
  &__checkbox {
    cursor: pointer;
    margin-right: auto;
    display: none;
    &--is-completed {
      display: block;
    }
  }
}
</style>
