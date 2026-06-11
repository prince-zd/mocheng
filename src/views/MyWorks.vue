<template>
  <div class="my-works-shell">
    <section class="my-works-page rounded-lg border border-ink/10 bg-white/70 p-5 shadow-soft backdrop-blur sm:p-6">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="moyun-title-font text-4xl text-ink">墨匣</h1>
          <p class="mt-2 text-sm text-ink/60">收入墨匣的书法草稿会显示在这里，可继续续写并再次收入。</p>
        </div>
        <RouterLink
          v-if="works.length > 0"
          to="/"
          class="hidden h-10 shrink-0 items-center justify-center rounded bg-cinnabar px-5 text-sm font-semibold text-white shadow transition hover:bg-cinnabar/90 active:scale-[0.98] sm:inline-flex"
        >
          去挥墨
        </RouterLink>
      </div>

      <div v-if="works.length > 0" class="my-works-content">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="work in works"
            :key="work.id"
            class="saved-work-card group rounded-lg border border-ink/10 bg-white/75 p-4 transition hover:border-cinnabar hover:bg-white"
          >
            <RouterLink :to="{ path: `/my-works/${work.id}`, query: { panel: 'preview' } }" class="block rounded outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-cinnabar/20">
              <div class="paper-texture relative flex h-44 items-center justify-center overflow-hidden rounded border border-ink/10 p-5">
                <p
                  class="font-calligraphy text-center text-3xl leading-relaxed text-ink transition group-hover:scale-[1.02]"
                  :style="{ fontFamily: work.form.fontFamily }"
                >
                  {{ previewText(work.form.text) }}
                </p>
                <div class="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 px-4 py-3">
                  <div class="min-w-0">
                    <h2 class="truncate text-sm font-semibold text-ink sm:text-base" :title="work.title">{{ shortTitle(work.title) }}</h2>
                    <p class="mt-1 text-[11px] text-ink/55 sm:text-xs">{{ formatDate(work.updatedAt) }}</p>
                  </div>
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-ink/10 bg-white/40 text-ink/60"
                    :aria-label="work.form.direction === 'vertical' ? '竖排' : '横排'"
                    :title="work.form.direction === 'vertical' ? '竖排' : '横排'"
                  >
                    <span class="direction-icon" :class="work.form.direction === 'vertical' ? 'is-vertical' : 'is-horizontal'" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </RouterLink>
            <div class="mt-4 flex items-center gap-2">
              <RouterLink
                :to="{ path: `/my-works/${work.id}`, query: { panel: 'edit' } }"
                class="flex h-10 flex-1 items-center justify-center rounded border border-ink/15 bg-white px-3 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
              >
                续写此作
              </RouterLink>
              <button
                type="button"
                class="flex h-10 min-w-[5.5rem] items-center justify-center rounded border border-ink/15 bg-white px-3 text-sm font-medium text-ink/70 transition hover:border-ink hover:bg-ink hover:text-white active:scale-95"
                @click="requestDelete(work)"
              >
                弃稿
              </button>
            </div>
          </article>
        </div>
      </div>

      <div v-else class="my-works-content">
        <div class="my-works-empty-state rounded-lg border border-dashed border-ink/15 bg-white/50 p-10 text-center">
          <p class="moyun-title-font text-3xl text-ink/70">墨匣尚空</p>
          <p class="mt-3 text-sm text-ink/55">挥墨成篇后，可收入墨匣。</p>
          <RouterLink
            to="/"
            class="mt-5 hidden h-10 items-center justify-center rounded bg-cinnabar px-5 text-sm font-semibold text-white shadow transition hover:bg-cinnabar/90 active:scale-[0.98] sm:inline-flex"
          >
            去挥墨
          </RouterLink>
        </div>
      </div>
    </section>

    <RouterLink
      to="/"
      class="my-works-mobile-action my-works-primary-button flex w-full items-center justify-center rounded bg-cinnabar px-4 font-semibold text-white shadow transition hover:bg-cinnabar/90 active:scale-[0.98] sm:hidden"
    >
      去挥墨
    </RouterLink>

    <Transition name="modal-fade">
      <div
        v-if="pendingDeleteWork"
        class="fixed inset-0 z-50 flex items-end bg-black/35 px-4 pb-4 sm:items-center sm:justify-center sm:p-6"
        role="dialog"
        aria-modal="true"
        @click="cancelDelete"
      >
        <div
          class="w-full rounded-t-lg border border-ink/10 bg-paper p-5 shadow-2xl sm:max-w-sm sm:rounded-lg"
          @click.stop
        >
          <p class="text-lg font-semibold text-ink">弃稿</p>
          <p class="mt-2 text-sm leading-6 text-ink/65">
            确定弃稿《{{ pendingDeleteWork.title }}》吗？弃稿后无法恢复。
          </p>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="h-11 rounded border border-ink/15 bg-white text-sm font-medium transition hover:border-ink active:scale-95"
              @click="cancelDelete"
            >
              取消
            </button>
            <button
              type="button"
              class="h-11 rounded bg-ink text-sm font-semibold text-white transition hover:bg-ink/90 active:scale-95"
              @click="confirmDelete"
            >
              弃稿
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { SavedWork } from '@/types'
import { deleteSavedWork, readSavedWorks } from '@/utils/savedWorks'

const works = ref<SavedWork[]>([])
const pendingDeleteWork = ref<SavedWork | null>(null)

const previewText = (text: string): string => {
  const cleanText = text.replace(/\s+/g, '')
  return Array.from(cleanText).slice(0, 12).join('') || '未命名作品'
}

const shortTitle = (title: string): string => {
  const chars = Array.from(title)
  return chars.length > 5 ? `${chars.slice(0, 5).join('')}...` : title
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '未知时间'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(() => {
  works.value = readSavedWorks()
})

const requestDelete = (work: SavedWork): void => {
  pendingDeleteWork.value = work
}

const cancelDelete = (): void => {
  pendingDeleteWork.value = null
}

const confirmDelete = (): void => {
  const work = pendingDeleteWork.value
  if (!work) {
    return
  }

  deleteSavedWork(work.id)
  works.value = works.value.filter((item) => item.id !== work.id)
  pendingDeleteWork.value = null
}
</script>
