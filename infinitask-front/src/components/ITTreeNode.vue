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
// const emit = defineEmits<{
//   (e: "edit"): void;
//   (e: "close"): void;
// }>();
const titleEdit = ref("");
const taskStore = useTasksStore();
const { inspectedTaskId, editingTaskId } = storeToRefs(taskStore);
const updating = ref(false);

const indent = computed(() => {
  return (props.taskNode.depth || 0) * 3;
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
  console.log("click", props.taskNode.id);
  taskStore.inspectTask(props.taskNode.id);
};
const clickContent = () => {
  console.log("clickContent", props.taskNode.id);
  titleEdit.value = props.taskNode.data.title;
  taskStore.editTask(props.taskNode.id);
};
const toggleNode = () => {
  console.log("toggleNode", props.taskNode);
  taskStore.updateTask({
    ...props.taskNode.data,
    opened: !props.taskNode.opened,
  });
};
const updateTask = async () => {
  if (updating.value) {
    updating.value = false;
    return;
  }
  updating.value = true;
  console.log("update  ");

  if (titleEdit.value === props.taskNode.data.title) {
    if (props.taskNode.id === NEW_TASK_ID) {
      await taskStore.deleteTask(props.taskNode.id);
    }
    return;
  }

  if (props.taskNode.id === NEW_TASK_ID) {
    await taskStore.deleteTask(NEW_TASK_ID);
    await taskStore.addTask(titleEdit.value, props.taskNode.data.parentId);
    titleEdit.value = "";
    return;
  }

  await taskStore.updateTask({
    ...props.taskNode.data,
    title: titleEdit.value,
  });
  updating.value = false;
};

watch(
  () => editing.value,
  (newVal: boolean, oldVal: boolean) => {
    if (!newVal && oldVal) {
      console.log("watch editing", newVal, oldVal);
      updateTask();
    }
  }
);
onMounted(() => {
  titleEdit.value = props.taskNode.data.title;
});

const blur = async () => {
  console.log("blur", editing.value);
  await updateTask();
  if (editing.value) {
    taskStore.editTask(NO_TASK_ID);
  }
};

const enter = async () => {
  console.log("enter");
  await updateTask();
};

const esc = () => {
  console.log("esc", editing.value);
  taskStore.editTask(NO_TASK_ID);
};

const remove = () => {
  console.log("remove", editing.value);
  taskStore.editTask(NO_TASK_ID);
  taskStore.deleteTask(props.taskNode.id!);
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
    >
      <div class="task-node__indent" :style="{ width: indent + 'rem' }">
        <div v-if="!isLeaf" class="task-node__toggler" @click="toggleNode">
          <iconify-icon v-if="taskNode.opened" icon="mdi:chevron-up" />
          <iconify-icon v-else icon="mdi:chevron-right" />
        </div>
      </div>
      <div class="task-node__content">
        <input
          v-if="editing"
          type="text"
          v-model="titleEdit"
          v-focus
          @keydown.esc="esc"
          @blur="blur"
          @keydown.enter="enter"
          @keydown.up.prevent
          @keydown.down.prevent
          @keydown.left.ctrl.prevent
          @keydown.right.ctrl.prevent
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

    &--is-inspected {
      background-color: #ccc;
    }
  }
  &__indent {
    text-align: right;
    display: flex;
    justify-content: flex-end;
  }
  &__content {
    flex-grow: 1;
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
}
</style>

<!-- 
<style scoped lang="scss">
li.node {
  position: relative;
  padding-top: 30px;
  .node-row {
    position: absolute;
    top: 0;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 2px 0;

    .front {
      text-align: right;
    }
    .content {
      flex-grow: 1;
    }

    .back {
      width: 100px;
      text-align: right;
    }
  }
}
ul.node-children {
  position: relative;
  margin: 0;
  padding: 0;
  width: 100%;

  &.root-children {
    padding-top: 0;
  }
}
</style> -->
