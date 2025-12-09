import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/quotes",
        name: "quotes",
        component: () => import("../views/quote/QuotesView.vue")
    },
    {
        path: "/thread",
        name: "thread",
        component: () => import("@/views/thread/ThreadView.vue"),
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
