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

<style>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
html {
  font-size: 62.5%;
}
</style>
