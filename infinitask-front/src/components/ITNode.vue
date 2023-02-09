<script lang="ts">
import { defineComponent, toRefs, computed } from "vue";
import type { PropType } from "vue";
import ITChildren from "./ITChildren.vue";
import type { TreeNode } from "@/lib/tree";
import type { Task } from "@/stores/tasks";

export default defineComponent({
  name: "ITNode",
  props: {
    node: { type: Object as PropType<TreeNode<Task>>, required: true },
  },
  setup(props) {
    const { node } = toRefs(props);

    const indent = computed(() => {
      return (node.value.depth || 0) * 16;
    });
    const isLeaf = computed(() => {
      return node.value.children.length === 0;
    });
    return {
      indent,
      isLeaf,
    };
  },
  components: {
    ITChildren,
  },
});
</script>
<template>
  <li class="treenode">
    <ITChildren v-if="!isLeaf" :tasks="node.children" />

    <div class="treenode__row">
      <div class="treenode__indent" :style="{ width: indent + 'px' }">
        <a v-if="!isLeaf">+</a>
      </div>
      <div class="treenode__content">{{ node.data.title }}</div>
      <div class="treenode__action">{{ node.id }}</div>
    </div>
  </li>
</template>
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
<style lang="scss"></style>
