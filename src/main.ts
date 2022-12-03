import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
/* import the fontawesome core */

import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import {
  faUserSecret,
  faTrashCan,
  faTrash,
  faPlus,
  faQuoteRight,
  faQuoteLeft
} from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(faUserSecret, faTrashCan, faTrash, faPlus, faQuoteRight, faQuoteLeft);

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/main.css";
import "bootstrap/dist/js/bootstrap.js";

const pinia = createPinia();
const app = createApp(App).component("font-awesome-icon", FontAwesomeIcon);

app.use(router);
app.use(pinia);
app.mount("#app");
