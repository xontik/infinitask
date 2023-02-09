<script lang="ts">
import { useAuthStore } from "@/stores/auth";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "LoginView",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const username = ref("");
    const password = ref("");
    const loading = ref(false);

    const login = async () => {
      loading.value = true;
      try {
        await authStore.login(username.value, password.value);
        await router.push({ name: "dashboard" });
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      loading,
      login,
    };
  },
});
</script>

<template>
  <div>
    <div class="form-container" @keyup.enter="login">
      <span class="p-input-icon-left">
        <i class="pi pi-user"></i>
        <input v-model="username" placeholder="Username" type="text" required />
      </span>
      <span class="p-input-icon-left">
        <i class="pi pi-lock"></i>
        <input
          v-model="password"
          placeholder="Password"
          type="password"
          required
        />
      </span>
    </div>
    <button @click="login" :loading="loading" type="button">Login</button>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
