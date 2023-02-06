import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "../stores/auth";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: {
        anonymous: true,
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.anonymous || auth.isAuthenticated) {
    next();
  } else {
    next({ name: "login" });
  }
});

export default router;
