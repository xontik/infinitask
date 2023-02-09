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
    const isRoot = computed(() => !node.value.parent);

    const indent = computed(() => {
      return (node.value.depth || 0) * 16;
    });
    const isLeaf = computed(() => {
      return node.value.children.length === 0;
    });
    return {
      isRoot,
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
  <template v-if="isRoot">
    <ITChildren v-if="!isLeaf" :tasks="node.children" class="root-children" />
  </template>
  <template v-else>
    <li :class="{ node: true }">
      <ITChildren v-if="!isLeaf" :tasks="node.children" />

      <div class="node-row">
        <div class="front" :style="{ width: indent + 'px' }">
          <a v-if="!isLeaf">+</a>
        </div>
        <div class="content">{{ node.data.title }}</div>
        <div class="back">{{ node.id }}</div>
      </div>
    </li>
  </template>
</template>

<style scoped lang="scss">
li.node {
  position: relative;
  margin: 0;
  padding: 0;
  padding-top: 30px;
  text-indent: 0;
  list-style-type: none;
  list-style: none;

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
  text-indent: 0;
  list-style-type: none;
  list-style: none;

  &.root-children {
    padding-top: 0;
  }
}
</style>
