/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import { createApp, nextTick } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";

import "modern-normalize/modern-normalize.css";
import "iconify-icon";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.directive("focus", {
  mounted: function (el) {
    el.focus();
  },
  //   updated: function (el) {
  //     nextTick(function () {
  //       el.focus();
  //     });
  //   },
});

app.use(pinia);
app.use(router);

app.mount("#app");
