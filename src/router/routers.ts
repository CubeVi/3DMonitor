import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: { name: 'main' },
    },
    {
        path: '/widgets',
        name: 'widgets',
        component: () => import('@/view/widgets/index.vue'),
    },
    {
        path: '/main',
        name: 'main',
        component: () => import('@/view/main/index.vue'),
    },
    {
        path: '/dynamic',
        name: 'dynamic',
        component: () => import('@/view/dynamic/index.vue'),
    },
    {
        path: '/debug',
        name: 'debug',
        component: () => import('@/view/debug/index.vue'),
    },
]

export default routes
