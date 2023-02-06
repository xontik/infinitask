<script lang="ts">
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent({
  name: "App",
  setup() {
    return {};
  },
  components: { RouterView },
});
</script>

<template>
  <RouterView></RouterView>
</template>

<style scoped></style>
