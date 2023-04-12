import Vue from 'vue'
import VueRouter from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

Vue.use(VueRouter)
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) {
        return originalPush.call(this, location, onResolve, onReject)
    }
    return originalPush.call(this, location).catch((err) => err)
}

VueRouter.prototype.replace = function push(location, onResolve, onReject) {
    if (onResolve || onReject) {
        return originalReplace.call(this, location, onResolve, onReject)
    }
    return originalReplace.call(this, location).catch((err) => err)
}

const routes = [
    {
        path: '/',
        name: 'Home',
        component: MainLayout,
        children: [
            {
                path: 'welcome/:id',
                name: 'Welcome',
                component: () => import("../views/Welcome.vue")
            },
            {
                path: 'shell/:sessionId',
                name: 'XTermSession',
                component: () => import('../views/xterm/xtermSession.vue')
            },
            {
                path: 'setting/:id',
                name: 'XTermProfile',
                component: () => import('../views/xterm/profile.vue')
            },
            {
                path: 'login/:id',
                name: 'Login',
                component: () => import('../views/Login.vue')
            },
            {
                path: 'sftp/:sessionId',
                name: 'SFTP',
                component: () => import('../views/sftp/index.vue')
            },
            {
                path: 'editor/:sessionId',
                name: 'EDITOR',
                component: () => import('../views/editor/index.vue')
            },
            {
                path: 'vnc/:sessionId',
                name: 'VNC',
                component: () => import('../views/vnc/index.vue')
            },
            {
                path: 'ftp/:sessionId',
                name: 'FTP',
                component: () => import('../views/sftp/index.vue')
            },
            {
                path: 'webdav/:sessionId',
                name: 'WEBDAV',
                component: () => import('../views/sftp/index.vue')
            },
            {
                path: 'globalsetting/:sessionId',
                name: 'GlobalSetting',
                component: () => import('@/views/settings/index.vue')
            }
        ]
    },
    {
        path: '/lock',
        name: 'Lock',
        component: () => import(/* webpackChunkName: "lock" */ '../views/Lock.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router