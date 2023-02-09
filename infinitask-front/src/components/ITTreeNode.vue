<script setup lang="ts">
import ITTreeChildren from "./ITTreeChildren.vue";
import type { TreeNode } from "@/lib/tree";
import type { Task } from "@/stores/task";
import { computed } from "vue";

const props = defineProps<{
  taskNode: TreeNode<Task>;
}>();

const indent = computed(() => {
  return (props.taskNode.depth || 0) * 16;
});
const isLeaf = computed(() => {
  return props.taskNode.children.length === 0;
});

const click = () => {
  console.log("click", props.taskNode.id);
};
</script>
<template>
  <li class="task-node" @click.stop="click">
    <ITTreeChildren v-if="!isLeaf" :taskNodes="taskNode.children" />

    <div class="task-node__row">
      <div class="task-node__indent" :style="{ width: indent + 'px' }">
        <a v-if="!isLeaf">+</a>
      </div>
      <div class="task-node__content">{{ taskNode.data.title }}</div>
      <div class="task-node__action">{{ taskNode.id }}</div>
    </div>
  </li>
</template>
<style lang="scss">
.task-node {
  position: relative;
  padding-top: 30px;
  cursor: pointer;
  &__row {
    position: absolute;
    top: 0;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 2px 0;
  }
  &__indent {
    text-align: right;
  }
  &__content {
    flex-grow: 1;
  }

  &__action {
    width: 100px;
    text-align: right;
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
