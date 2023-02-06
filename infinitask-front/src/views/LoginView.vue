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
        await router.push({ name: "home" });
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
  <v-card class="mx-auto" width="400" prepend-icon="mdi-person">
    <template v-slot:title>Login</template>

    <v-card-text>
      <v-form>
        <v-text-field
          v-model="username"
          label="Username"
          prepend-icon="mdi-account"
          type="text"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          prepend-icon="mdi-lock"
          type="password"
          required
        ></v-text-field>
        <v-btn @click="login" color="primary" block :loading="loading"
          >Login</v-btn
        >
      </v-form>
    </v-card-text>
  </v-card>
</template>
