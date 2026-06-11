import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import CalligraphyGenerator from '@/views/CalligraphyGenerator.vue'
import ClassicWorks from '@/views/ClassicWorks.vue'
import MyWorks from '@/views/MyWorks.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'CalligraphyGenerator',
    component: CalligraphyGenerator,
    meta: { title: '泼墨成金' }
  },
  {
    path: '/works',
    name: 'ClassicWorks',
    component: ClassicWorks,
    meta: { title: '名帖' }
  },
  {
    path: '/my-works',
    name: 'MyWorks',
    component: MyWorks,
    meta: { title: '墨匣' }
  },
  {
    path: '/my-works/:id',
    name: 'SavedWorkDetail',
    component: CalligraphyGenerator,
    meta: { title: '作品详情' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '泼墨成金')} - 墨成`
})

export default router
