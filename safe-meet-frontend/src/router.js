import Vue from "vue";
import Router from "vue-router";
import Room from "./views/Room.vue";
import Home from "./views/Home.vue";
import Privacy from "./views/Privacy.vue";
import Terms from "./views/Terms.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/privacy",
      name: "Privacy Policy",
      component: Privacy
    },
    {
      path: "/terms",
      name: "Terms and conditions",
      component: Terms
    },
    {
      path: "/:name*",
      name: "Room",
      component: Room,
      meta: {
        requireAuth: true
      }
    }
  ]
});
