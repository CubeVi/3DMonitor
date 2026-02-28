import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import routes from './routers.ts'

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
