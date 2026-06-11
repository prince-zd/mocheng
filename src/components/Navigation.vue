<template>
  <header class="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
    <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="/" class="group flex items-center gap-3" @click.prevent="goHomeReset">
        <span
          class="flex h-10 w-10 items-center justify-center rounded border border-cinnabar/30 bg-cinnabar text-white shadow-sm transition group-hover:scale-105 group-active:scale-95"
          aria-hidden="true"
        >
          <svg class="h-7 w-7" viewBox="0 0 48 48" fill="none">
            <path
              d="M12 13c5.5-4 15.2-5.1 24-2.2"
              stroke="currentColor"
              stroke-width="4.4"
              stroke-linecap="round"
            />
            <path
              d="M31.5 10.5c-1.8 8.7-6.8 17.1-16.2 25.8"
              stroke="currentColor"
              stroke-width="5.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17.5 27.5c6.4 4.2 12.9 5.9 20 5.3"
              stroke="currentColor"
              stroke-width="4.8"
              stroke-linecap="round"
            />
            <path
              d="M35 25.5c-1 4.8-2.5 8.4-4.9 12.1"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
            />
            <circle cx="13.5" cy="36.5" r="2.6" fill="currentColor" opacity="0.9" />
          </svg>
        </span>
        <span class="moyun-title-font text-2xl text-ink">墨成</span>
      </a>

      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded border border-ink/15 bg-white/60 transition hover:border-cinnabar hover:text-cinnabar active:scale-95 md:hidden"
        type="button"
        :aria-expanded="isOpen"
        aria-label="打开导航菜单"
        @click="isOpen = !isOpen"
      >
        <span class="relative block h-4 w-5">
          <span
            class="absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition"
            :class="{ 'translate-y-[7px] rotate-45': isOpen }"
          />
          <span
            class="absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition"
            :class="{ 'opacity-0': isOpen }"
          />
          <span
            class="absolute left-0 top-[14px] h-0.5 w-5 rounded bg-current transition"
            :class="{ '-translate-y-[7px] -rotate-45': isOpen }"
          />
        </span>
      </button>

      <div class="hidden items-center gap-2 md:flex">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="moyun-title-font rounded px-4 py-2 text-lg transition hover:bg-cinnabar/10 hover:text-cinnabar active:scale-95"
          :class="isActive(item.path) ? 'is-nav-active' : 'text-ink/75'"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>

    <Transition name="route-fade">
      <div v-if="isOpen" class="border-t border-ink/10 bg-paper px-4 py-3 md:hidden">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="moyun-title-font mb-2 block rounded px-4 py-3 text-lg transition last:mb-0 hover:bg-cinnabar/10 hover:text-cinnabar active:scale-[0.99]"
          :class="isActive(item.path) ? 'is-nav-active' : 'text-ink/75'"
          @click="isOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

interface NavItem {
  label: string
  path: string
}

const route = useRoute()
const router = useRouter()
const isOpen = ref(false)

const navItems: NavItem[] = [
  { label: '泼墨成金', path: '/' },
  { label: '墨匣', path: '/my-works' },
  { label: '名帖', path: '/works' }
]

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.name === 'CalligraphyGenerator' || route.name === 'SavedWorkDetail'
  }

  if (path === '/my-works') {
    return route.name === 'MyWorks'
  }

  return route.path === path
}

const goHomeReset = (): void => {
  isOpen.value = false
  void router.push({
    name: 'CalligraphyGenerator',
    query: { reset: String(Date.now()) }
  })
}
</script>
