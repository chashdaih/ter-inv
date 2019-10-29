import Vue from 'vue'
import Router from 'vue-router'
// import firebase from 'firebase'
const fb = require('./firebaseConfig.js')

import Login from './views/Login'
// import Home from './views/Home'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '*', redirect: '/usuarios' },
    { path: '/login', name: 'login', component: Login },
    // { path: '/', name: 'home', component: Home, meta: { requiresAuth: true } },
    // patients
    { path: '/usuarios', name: 'patients', component: () => import('./views/patients/Index.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/registrar', name: 'registerPatient', component: () => import('./views/patients/Create.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/:id',  component: () => import('./views/patients/Show.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/:id/editar',  component: () => import('./views/patients/Create.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/:id/referenciar',  component: () => import('./views/MakeRefer.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/:id/referencias', component: () => import('./views/patients/Refer.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/:id/referencias/:ref', component: () => import('./views/appoinments/Index.vue'), meta: { requiresAuth: true } },
    // supervisors
    { path: '/supervisores', name: 'supervisors', component: () => import('./views/supervisors/Index.vue'), meta: { requiresAuth: true }},
    { path: '/supervisores/registrar-supervisor', name: 'signup', component: () => import('./views/supervisors/Create.vue'), meta: { requiresAuth: true } },
    { path: '/supervisores/:id', component: () => import('./views/supervisors/Show.vue'), meta: { requiresAuth: true } },
    { path: '/supervisores/:id/editar', component: () => import('./views/supervisors/Create.vue'), meta: { requiresAuth: true } },
    // therapists
    { path: '/terapeutas', name: 'therapists', component: () => import('./views/therapists/Index.vue'), meta: { requiresAuth: true } },
    { path: '/terapeutas/registrar-terapeuta', name: 'registerTherapist', component: () => import('./views/therapists/Create.vue'), meta: { requiresAuth: true } },
    { path: '/terapeutas/:id', component: () => import('./views/therapists/Show.vue'), meta: { requiresAuth: true } },
    { path: '/terapeutas/:id/editar', component: () => import('./views/therapists/Create.vue'), meta: { requiresAuth: true } },
    { path: '/terapeutas/:id/usuarios-referidos', component: () => import('./views/therapists/MyPatients.vue'), meta: { requiresAuth: true } },
    // sups & thers
    { path: '/mis-datos', component: () => import('./views/MyData.vue'), meta: {requiresAuth: true} },
    // only for guest t.
    { path: '/mis-usuarios', component: () => import('./views/therapists/MyPatients.vue'), meta: { requiresAuth: true } },
    // migration --only-dev
    { path: '/migracion', component: () => import('./views/migration/Index.vue') }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x=>x.meta.requiresAuth)
  const currentUser = fb.auth.currentUser

  if (requiresAuth && !currentUser) {
    next('/login')
  } else if (requiresAuth && currentUser) {
    next()
  } else {
    next()
  }
})

export default router