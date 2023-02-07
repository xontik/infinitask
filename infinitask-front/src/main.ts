/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";

import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Card from "primevue/card";
import Menu from "primevue/menu";
import Tree from "primevue/tree";
import Breadcrumb from "primevue/breadcrumb";
import Inplace from "primevue/inplace";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(PrimeVue, { ripple: true });

app.component("InputText", InputText);
app.component("Button", Button);
app.component("Card", Card);
app.component("Menu", Menu);
app.component("Tree", Tree);
app.component("Breadcrumb", Breadcrumb);
app.component("Inplace", Inplace);

app.mount("#app");
