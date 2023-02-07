<script lang="ts">
import { defineComponent } from "vue";

import { RouterView } from "vue-router";

export default defineComponent({
  name: "DashboardView",
  setup() {
    return {};
  },

  components: { RouterView },
});
</script>

<template>
  <div class="base-layout">
    <router-link :to="{ name: 'dashboard' }">Boards</router-link>

    <RouterView></RouterView>
  </div>
</template>

<style scoped>
.base-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
