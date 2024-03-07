import Vue from 'vue'
import VueRouter from 'vue-router'
import convertpage from '../components/convertpage.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/HelloWorld.vue'),
  },
  {
    path: '/convertpage',
    name: 'convertpage',
    component: convertpage
  }
]

const router = new VueRouter({
  routes
})

export default router
