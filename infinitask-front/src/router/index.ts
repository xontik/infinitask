import { useTasksStore } from "../stores/tasks";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/dashboard",
      component: () => import("../views/DashboardView.vue"),
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("../views/BoardListView.vue"),
        },
        {
          path: "board/:id",
          name: "board",
          component: () => import("../views/BoardView.vue"),
          beforeEnter: async (to, from, next) => {
            const boardId = Number(to.params.id);
            const tasksStore = useTasksStore();
            await tasksStore.selectBoard(boardId);
            next();
          },
        },
      ],
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
