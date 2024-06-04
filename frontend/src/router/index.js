import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FactoryDetails from '../views/FactoryDetails.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/factory/:name',
      name: 'factory',
      component: FactoryDetails
    },
  ]
})

export default router
