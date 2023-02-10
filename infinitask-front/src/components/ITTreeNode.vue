<script setup lang="ts">
import ITTreeChildren from "./ITTreeChildren.vue";
import type { TreeNode } from "@/lib/tree";
import type { Task } from "@/stores/task";
import { computed } from "vue";

import { useTasksStore } from "@/stores/task";
const props = defineProps<{
  taskNode: TreeNode<Task>;
}>();

const indent = computed(() => {
  return (props.taskNode.depth || 0) * 3;
});
const isLeaf = computed(() => {
  return props.taskNode.children.length === 0;
});

const click = () => {
  console.log("click", props.taskNode.id);
};
const toggleNode = () => {
  console.log("toggleNode", props.taskNode);
  useTasksStore().updateTask({
    ...props.taskNode.data,
    opened: !props.taskNode.opened,
  });
};
</script>
<template>
  <li class="task-node" @click.stop="click">
    <ITTreeChildren
      v-if="!isLeaf && taskNode.opened"
      :taskNodes="taskNode.children"
    />

    <div class="task-node__row">
      <div class="task-node__indent" :style="{ width: indent + 'rem' }">
        <div v-if="!isLeaf" class="task-node__toggler" @click="toggleNode">
          <iconify-icon v-if="taskNode.opened" icon="mdi:chevron-up" />
          <iconify-icon v-else icon="mdi:chevron-right" />
        </div>
      </div>
      <div class="task-node__content">{{ taskNode.data.title }}</div>
      <div class="task-node__action">{{ taskNode.id }}</div>
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
