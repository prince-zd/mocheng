<template>
  <section class="moyun-generator-grid grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div
      class="generator-preview-panel min-w-0 rounded-lg border border-ink/10 bg-white/55 p-4 backdrop-blur sm:p-6"
      :class="mobilePanel === 'preview' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'"
    >
      <div class="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded border border-ink/15 bg-white text-ink transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
          aria-label="返回编辑"
          @click="mobilePanel = 'edit'"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded border text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            :class="inactiveClass"
            :aria-label="form.direction === 'horizontal' ? '当前横排，点击切换为竖排' : '当前竖排，点击切换为横排'"
            :title="form.direction === 'horizontal' ? '横排' : '竖排'"
            @click="toggleDirection"
          >
            <span
              class="direction-icon"
              :class="form.direction === 'horizontal' ? 'is-horizontal' : 'is-vertical'"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded border text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            :class="inactiveClass"
            aria-label="切换字体"
            title="切换字体"
            @click="isFontSheetOpen = true"
          >
            字
          </button>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded border text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            :class="form.colorMode === 'light' ? inactiveClass : activeClass"
            :aria-label="form.colorMode === 'light' ? '切换为黑底白字' : '切换为白底黑字'"
            :title="form.colorMode === 'light' ? '黑底白字' : '白底黑字'"
            @click="toggleColorMode"
          >
            <span class="color-mode-dot" :class="{ 'is-dark': form.colorMode === 'dark' }" />
          </button>
        </div>
      </div>

      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="grid grid-cols-2 gap-2 sm:w-56">
          <button
            type="button"
            class="rounded border px-3 py-2 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            :class="previewMode === 'work' ? activeClass : inactiveClass"
            @click="previewMode = 'work'"
          >
            整卷
          </button>
          <button
            type="button"
            class="rounded border px-3 py-2 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            :class="previewMode === 'single' ? activeClass : inactiveClass"
            @click="openSingleMode"
          >
            单字临观
          </button>
        </div>

        <div class="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded border text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            :class="inactiveClass"
            aria-label="切换字体"
            title="切换字体"
            @click="isFontSheetOpen = true"
          >
            字
          </button>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded border text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            :class="form.colorMode === 'light' ? inactiveClass : activeClass"
            :aria-label="form.colorMode === 'light' ? '切换为黑底白字' : '切换为白底黑字'"
            :title="form.colorMode === 'light' ? '黑底白字' : '白底黑字'"
            @click="toggleColorMode"
          >
            <span class="color-mode-dot" :class="{ 'is-dark': form.colorMode === 'dark' }" />
          </button>
        </div>
      </div>

      <div class="relative">
        <div
          ref="artRef"
          class="paper-texture h-[520px] w-full min-w-0 max-w-full rounded-lg border border-ink/10 p-8 sm:h-[620px] sm:p-12 lg:h-[640px]"
          :class="[
            form.colorMode === 'dark' ? 'dark-paper' : '',
            paperLayoutClass,
            previewMode === 'work' && form.direction === 'horizontal' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-auto',
            previewMode === 'single' ? 'single-mode-paper' : '',
            isRenderingCanvas ? 'is-exporting-canvas' : ''
          ]"
        >
          <div
            v-if="previewMode === 'work' && hasUserText"
            class="calligraphy-content relative z-10 font-calligraphy"
            :class="form.direction === 'vertical' ? 'min-w-max' : 'my-auto w-full min-w-0 whitespace-pre-wrap break-words text-center leading-normal'"
            :style="previewStyle"
          >
            <template v-if="form.direction === 'vertical'">
              <div class="manual-vertical-calligraphy" :style="verticalStyle">
                <div v-for="(column, columnIndex) in verticalColumns" :key="columnIndex" class="manual-vertical-column">
                  <span
                    v-for="(char, charIndex) in column"
                    :key="`${columnIndex}-${charIndex}`"
                    class="manual-vertical-char"
                    :class="{ 'manual-vertical-punctuation': isPunctuation(char) }"
                  >
                    {{ char }}
                  </span>
                </div>
              </div>
            </template>
            <template v-else>{{ safeText }}</template>
            <span v-if="!isCurrentFontReady" class="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white/85 px-3 py-1 font-sans text-xs text-cinnabar shadow-sm">
              字体文件未加载，暂用默认书体
            </span>
          </div>

          <div
            v-else-if="previewMode === 'single' && hasUserText"
            class="single-mode-content relative z-10 flex w-full max-w-[410px] flex-col items-center gap-4"
            @touchstart.passive="handleTouchStart"
            @touchend.passive="handleTouchEnd"
          >
            <div
              ref="singleGridRef"
              class="single-char-grid relative flex aspect-square w-full items-center justify-center overflow-hidden rounded border border-ink/15 bg-paper/70 shadow-sm"
              :class="[
                'with-mi-grid',
                form.colorMode === 'dark' ? 'bg-soot text-white' : 'text-ink'
              ]"
            >
              <span class="single-counter">{{ currentSingleIndex + 1 }} / {{ singleCharacters.length }}</span>
              <Transition :name="singleTransitionName" mode="out-in">
                <div
                  :key="`${currentSingleIndex}-${currentSingleChar}`"
                  class="single-final-char absolute inset-0 z-10 flex items-center justify-center"
                  :style="singleCharStyle"
                >
                  <span class="single-final-glyph" :class="{ 'is-lanting-font': form.fontFamily === 'Moyun-WangXizhi-SCFwxz' }">
                    {{ currentSingleChar }}
                  </span>
                </div>
              </Transition>
              <span v-if="!isCurrentFontReady" class="absolute bottom-3 z-20 rounded bg-white/85 px-3 py-1 text-xs text-cinnabar shadow-sm">
                字体文件未加载，暂用默认书体
              </span>
            </div>

            <div class="single-char-actions flex w-full items-center justify-center gap-3 sm:justify-between">
              <button
                type="button"
                class="single-char-nav-button hidden items-center justify-center rounded border border-ink/15 bg-white px-4 py-2 text-center text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95 sm:inline-flex"
                @click="showPreviousChar"
              >
                前一字
              </button>
              <span class="single-char-hint text-sm text-ink/60">
                <span class="single-char-mobile-count">{{ currentSingleIndex + 1 }} / {{ singleCharacters.length }}</span>
                左右滑动换字
              </span>
              <button
                type="button"
                class="single-char-nav-button hidden items-center justify-center rounded border border-ink/15 bg-white px-4 py-2 text-center text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95 sm:inline-flex"
                @click="showNextChar"
              >
                后一字
              </button>
            </div>

          </div>

          <div
            v-else
            class="empty-paper-state relative z-10"
            :class="{ 'is-vertical': form.direction === 'vertical' }"
            :style="{ fontFamily: activeFontFamily }"
          >
            <template v-if="form.direction === 'vertical'">
              <span v-for="char in emptyPaperChars" :key="char" class="empty-paper-char">{{ char }}</span>
            </template>
            <span v-else>空纸待书</span>
          </div>
        </div>

        <Transition name="toast-fade">
          <div v-if="toastMessage" class="moyun-toast-layer">
            <div class="moyun-toast">
              {{ toastMessage }}
            </div>
          </div>
        </Transition>
      </div>

      <div class="generator-preview-actions mt-4">
        <div class="grid grid-cols-3 gap-3 sm:hidden">
          <button
            v-if="previewMode === 'single'"
            type="button"
            class="flex h-12 items-center justify-center rounded border border-ink/15 bg-white px-3 text-sm font-semibold transition hover:border-cinnabar hover:text-cinnabar active:scale-95 disabled:opacity-60"
            :disabled="isExporting"
            @click="savePracticeCard"
          >
            留作临帖
          </button>
          <button
            v-else
            type="button"
            class="flex h-12 items-center justify-center rounded border border-ink/15 bg-white px-3 text-sm font-semibold transition hover:border-cinnabar hover:text-cinnabar active:scale-95 disabled:opacity-60"
            :disabled="isExporting"
            @click="exportPng"
          >
            下载墨宝
          </button>
          <button
            type="button"
            class="col-span-2 flex h-12 items-center justify-center rounded bg-cinnabar px-3 text-sm font-semibold text-white transition hover:bg-cinnabar/90 hover:text-white active:scale-95 disabled:opacity-60"
            :disabled="!hasUserText"
            @click="saveCurrentWork"
          >
            收入墨匣
          </button>
        </div>
        <div class="generator-preview-action-row hidden sm:flex sm:items-end sm:justify-between">
          <span class="min-h-5 text-sm text-ink/60">{{ statusMessage }}</span>
          <div class="flex items-center gap-3">
            <button
              v-if="previewMode === 'single'"
              type="button"
              class="inline-flex h-12 items-center justify-center rounded border border-ink/15 bg-white px-4 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95 disabled:opacity-60"
              :disabled="isExporting"
              @click="savePracticeCard"
            >
              留作临帖
            </button>
            <button
              type="button"
              class="inline-flex h-12 items-center justify-center rounded border border-ink/15 bg-white px-4 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95 disabled:opacity-60"
              :disabled="isExporting"
              @click="copyImage"
            >
              拓印一份
            </button>
          </div>
        </div>
      </div>
    </div>

    <aside
      class="generator-editor-panel rounded-lg border border-ink/10 bg-white/70 p-4 shadow-soft backdrop-blur"
      :class="mobilePanel === 'edit' ? 'block' : 'hidden lg:block'"
    >
      <h1 class="moyun-title-font text-4xl text-ink">泼墨成金</h1>
      <p class="mt-2 text-sm text-ink/60">输入文字，选择字体与布局，即刻生成一幅洒金泼墨书法作品。</p>

      <div class="generator-editor-form mt-6">
        <div class="generator-text-field block">
          <div class="mb-2 flex items-center justify-between gap-3">
            <span class="block text-sm font-medium">书写内容</span>
            <button
              type="button"
              class="shrink-0 rounded border border-ink/15 bg-white px-2.5 py-1 text-xs font-medium text-ink/70 transition hover:border-cinnabar hover:text-cinnabar active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!hasBlankCharacters"
              @click="clearBlankCharacters"
            >
              清理空白
            </button>
          </div>
          <input
            v-model="workTitle"
            class="mb-3 hidden w-full rounded border border-ink/15 bg-paper/60 px-3 py-2 text-sm outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20 lg:block"
            type="text"
            maxlength="24"
            placeholder="作品名称，不填则自动取名"
          />
          <textarea
            v-model="form.text"
            class="generator-textarea min-h-32 w-full resize-y rounded border border-ink/15 bg-paper/60 p-3 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20"
            placeholder="待君挥墨"
            inputmode="text"
            @compositionstart="isComposingText = true"
            @compositionend="handleTextCompositionEnd"
            @input="handleTextInput"
          />
          <span v-if="inputNotice" class="mt-2 block text-xs text-ink/50">{{ inputNotice }}</span>
        </div>

        <div>
          <span class="mb-2 block text-sm font-medium">快捷内容</span>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded border border-ink/15 bg-white px-3 py-2 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
              @click="useRandomQuote"
            >
              换句清辞
            </button>
            <div class="template-picker relative min-w-0">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded border border-ink/15 bg-white px-3 py-2 text-left text-sm text-ink transition hover:border-cinnabar hover:text-cinnabar active:scale-[0.99]"
                @click="toggleTemplatePicker"
              >
                <span class="truncate">{{ currentTemplateLabel }}</span>
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>

              <Transition name="sheet-fade">
                <div
                  v-if="isTemplatePickerOpen"
                  class="template-dropdown hidden lg:block"
                  role="listbox"
                >
                  <button
                    v-for="template in poemTemplates"
                    :key="template.id"
                    type="button"
                    class="template-option"
                    :class="{ 'is-active': selectedTemplateId === template.id }"
                    @click="selectTemplate(template)"
                  >
                    {{ template.title }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <div>
          <span class="mb-2 block text-sm font-medium">字体</span>
          <button
            type="button"
            class="flex w-full items-center justify-between rounded border border-ink/15 bg-white px-3 py-3 text-left transition hover:border-cinnabar hover:text-cinnabar active:scale-[0.99]"
            @click="isFontSheetOpen = true"
          >
            <span>
              <span class="block text-sm text-ink/60">当前字体</span>
              <span class="mt-1 block text-2xl text-ink" :style="{ fontFamily: activeFontFamily }">
                {{ currentFontLabel }}
              </span>
              <span v-if="!isCurrentFontReady" class="mt-1 block text-xs text-cinnabar">字体文件未加载，暂用默认书体</span>
            </span>
            <span class="text-sm text-ink/50">更换</span>
          </button>
        </div>

        <div class="generator-layout-control">
          <span class="mb-2 block text-sm font-medium">布局</span>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="item in directionOptions"
              :key="item.value"
              type="button"
              class="direction-toggle-button rounded border px-3 py-2 text-sm font-medium hover:border-cinnabar hover:text-cinnabar active:scale-95"
              :class="form.direction === item.value ? activeClass : inactiveClass"
              :style="form.direction === item.value ? selectedToggleStyle : unselectedToggleStyle"
              @click="form.direction = item.value"
            >
              <span class="direction-option-content">
                <span class="direction-icon" :class="item.value === 'horizontal' ? 'is-horizontal' : 'is-vertical'" />
                {{ item.label }}
              </span>
            </button>
          </div>
        </div>

        <div class="generator-save-control grid gap-2 sm:grid-cols-2 lg:block">
          <button
            type="button"
            class="hidden h-12 w-full items-center justify-center rounded border border-cinnabar bg-cinnabar px-4 font-semibold text-white transition hover:bg-cinnabar/90 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
            :disabled="!hasUserText"
            @click="saveCurrentWork"
          >
            收入墨匣
          </button>
          <button
            type="button"
            class="flex h-12 w-full items-center justify-center rounded bg-cinnabar px-4 font-semibold text-white shadow transition hover:bg-cinnabar/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
              :disabled="isGenerating || !hasUserText"
              @click="generatePreview"
          >
            <span v-if="isGenerating" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            展卷一观
          </button>
        </div>
      </div>
    </aside>

    <Transition name="sheet-fade">
      <div
        v-if="isFontSheetOpen"
        class="fixed inset-0 z-50 flex items-end bg-black/35 px-3 pb-3 sm:items-center sm:justify-center sm:p-6"
        role="dialog"
        aria-modal="true"
        @click="isFontSheetOpen = false"
      >
        <Transition name="sheet-slide" appear>
          <div
            class="w-full max-w-md rounded-t-lg border border-ink/10 bg-paper p-4 shadow-2xl sm:rounded-lg"
            @click.stop
          >
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-semibold">更换字体</h2>
              <button
                type="button"
                class="rounded border border-ink/15 bg-white px-3 py-1.5 text-sm transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
                @click="isFontSheetOpen = false"
              >
                关闭
              </button>
            </div>

            <div class="space-y-2">
              <button
                v-for="font in fontOptions"
                :key="font.value"
                type="button"
                class="flex w-full items-center justify-between rounded border px-4 py-3 text-left transition hover:border-cinnabar hover:bg-cinnabar/5 active:scale-[0.99]"
            :class="form.fontFamily === font.value ? 'border-cinnabar bg-white text-cinnabar' : 'border-ink/10 bg-white/70 text-ink'"
                @click="selectFont(font)"
              >
                <span>
                  <span class="block text-sm font-medium">{{ font.label }}</span>
                  <span class="mt-1 block text-xs text-ink/50">{{ font.sourceWork }}</span>
                  <span class="mt-1 block text-2xl" :style="{ fontFamily: getFontFamily(font) }">海纳百川</span>
                  <span v-if="!isFontReady(font.value)" class="mt-1 block text-xs text-cinnabar">
                    字体文件未加载，暂用默认书体
                  </span>
                </span>
                <span v-if="form.fontFamily === font.value" class="text-sm font-semibold">当前</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="sheet-fade">
      <div
        v-if="isTemplatePickerOpen"
        class="fixed inset-0 z-50 flex items-end bg-black/35 px-3 pb-3 lg:hidden"
        role="dialog"
        aria-modal="true"
        @click="isTemplatePickerOpen = false"
      >
        <Transition name="sheet-slide" appear>
          <div
            class="w-full rounded-t-lg border border-ink/10 bg-paper p-4 shadow-2xl"
            @click.stop
          >
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-semibold">选择诗卷</h2>
              <button
                type="button"
                class="rounded border border-ink/15 bg-white px-3 py-1.5 text-sm transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
                @click="isTemplatePickerOpen = false"
              >
                关闭
              </button>
            </div>
            <div class="space-y-2">
              <button
                v-for="template in poemTemplates"
                :key="template.id"
                type="button"
                class="template-sheet-option"
                :class="{ 'is-active': selectedTemplateId === template.id }"
                @click="selectTemplate(template)"
              >
                {{ template.title }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="sheet-fade">
      <div
        v-if="isTitleSheetOpen"
        class="fixed inset-0 z-50 flex items-end bg-black/35 px-3 pb-3 lg:hidden"
        role="dialog"
        aria-modal="true"
        @click="isTitleSheetOpen = false"
      >
        <Transition name="sheet-slide" appear>
          <div
            class="w-full rounded-t-lg border border-ink/10 bg-paper p-4 shadow-2xl"
            @click.stop
          >
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-semibold">作品命名</h2>
              <button
                type="button"
                class="rounded border border-ink/15 bg-white px-3 py-1.5 text-sm transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
                @click="isTitleSheetOpen = false"
              >
                关闭
              </button>
            </div>
            <input
              v-model="titleDraft"
              class="w-full rounded border border-ink/15 bg-white/70 px-3 py-3 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20"
              type="text"
              maxlength="24"
              placeholder="不填则自动取名"
            />
            <button
              type="button"
              class="mt-3 flex h-12 w-full items-center justify-center rounded bg-cinnabar px-4 font-semibold text-white transition hover:bg-cinnabar/90 active:scale-[0.98]"
              @click="confirmTitleAndSave"
            >
              收入墨匣
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="sheet-fade">
      <div
        v-if="savePreviewImage"
        class="fixed inset-0 z-50 flex items-end bg-black/45 px-3 pb-3 sm:items-center sm:justify-center sm:p-6"
        role="dialog"
        aria-modal="true"
        @click="closeSavePreview"
      >
        <div class="save-preview-panel w-full max-w-md rounded-t-lg border border-ink/10 bg-paper p-4 shadow-2xl sm:rounded-lg" @click.stop>
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold">长按留存墨宝</h2>
              <p class="mt-1 text-xs text-ink/55">也可以点击下载墨宝保存到相册。</p>
            </div>
            <button
              type="button"
              class="rounded border border-ink/15 bg-white px-3 py-1.5 text-sm transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
              @click="closeSavePreview"
            >
              关闭
            </button>
          </div>
          <img :src="savePreviewImage" class="max-h-[62vh] w-full rounded border border-ink/10 bg-white object-contain" alt="生成的墨宝预览" />
          <button
            type="button"
            class="mt-3 w-full rounded bg-cinnabar px-4 py-3 font-semibold text-white transition hover:bg-cinnabar/90 active:scale-[0.98]"
            @click="downloadSavePreview"
          >
            下载墨宝
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import html2canvas from 'html2canvas'
import type { ColorMode, FontOption, SavedWorkForm, WritingDirection } from '@/types'
import { findSavedWork, saveWorkDraft } from '@/utils/savedWorks'

interface PoemTemplate {
  id: string
  title: string
  text: string
  recommendedDirection: WritingDirection
}

interface GeneratorForm {
  text: string
  fontFamily: string
  fontSize: number
  letterSpacing: number
  lineHeight: number
  direction: WritingDirection
  colorMode: ColorMode
}

const fontOptions: FontOption[] = [
  {
    label: '颜真卿多宝塔碑',
    value: '"AaYZQDBTB"',
    fileName: 'yan-zhenqing-duobaota.ttf',
    sourceWork: '对应文件：yan-zhenqing-duobaota.ttf',
    fallbackValue: '"Zhi Mang Xing", "Ma Shan Zheng", cursive'
  },
  {
    label: '王羲之兰亭序',
    value: 'Moyun-WangXizhi-SCFwxz',
    fileName: 'wang-xizhi-lantingxu.ttf',
    sourceWork: '对应文件：wang-xizhi-lantingxu.ttf',
    fallbackValue: '"Ma Shan Zheng", cursive'
  }
]

const form = reactive<GeneratorForm>({
  text: '海纳百川有容乃大',
  fontFamily: fontOptions[0].value,
  fontSize: 64,
  letterSpacing: 8,
  lineHeight: 24,
  direction: 'horizontal',
  colorMode: 'light'
})

const initialForm: GeneratorForm = {
  text: '海纳百川有容乃大',
  fontFamily: fontOptions[0].value,
  fontSize: 64,
  letterSpacing: 8,
  lineHeight: 24,
  direction: 'horizontal',
  colorMode: 'light'
}

const directionOptions: Array<{ label: string; value: WritingDirection }> = [
  { label: '横排', value: 'horizontal' },
  { label: '竖排', value: 'vertical' }
]

const poemTemplates: PoemTemplate[] = [
  {
    id: 'qinyuanchunxue',
    title: '沁园春雪',
    text: '沁园春雪北国风光千里冰封万里雪飘望长城内外惟余莽莽大河上下顿失滔滔山舞银蛇原驰蜡象欲与天公试比高须晴日看红装素裹分外妖娆江山如此多娇引无数英雄竞折腰惜秦皇汉武略输文采唐宗宋祖稍逊风骚一代天骄成吉思汗只识弯弓射大雕俱往矣数风流人物还看今朝',
    recommendedDirection: 'vertical'
  },
  {
    id: 'jiangjinjiu',
    title: '将进酒节选',
    text: '君不见黄河之水天上来奔流到海不复回君不见高堂明镜悲白发朝如青丝暮成雪人生得意须尽欢莫使金樽空对月天生我材必有用千金散尽还复来',
    recommendedDirection: 'vertical'
  },
  {
    id: 'lantingxu',
    title: '兰亭集序节选',
    text: '永和九年岁在癸丑暮春之初会于会稽山阴之兰亭修禊事也群贤毕至少长咸集此地有崇山峻岭茂林修竹又有清流激湍映带左右',
    recommendedDirection: 'vertical'
  },
  {
    id: 'duanju',
    title: '山河雅句',
    text: '山河远阔清风入怀',
    recommendedDirection: 'horizontal'
  }
]

const randomQuotes = [
  '山河远阔',
  '清风入怀',
  '云水禅心',
  '静水流深',
  '松风入砚',
  '月照寒江',
  '长风破浪',
  '一蓑烟雨',
  '心有山海',
  '墨香如故',
  '海上生明月',
  '清泉石上流',
  '行到水穷处坐看云起时',
  '落霞与孤鹜齐飞',
  '春风得意马蹄疾',
  '天行健君子以自强不息',
  '大鹏一日同风起',
  '江流天地外山色有无中',
  '会当凌绝顶一览众山小',
  '长风破浪会有时直挂云帆济沧海'
]

const activeClass = 'border-[#1a1a1a] bg-cinnabar text-white hover:text-white'
const inactiveClass = 'border-ink/15 bg-white text-ink/75'
const route = useRoute()
const router = useRouter()
const artRef = ref<HTMLElement | null>(null)
const singleGridRef = ref<HTMLElement | null>(null)
const isGenerating = ref(false)
const isExporting = ref(false)
const isRenderingCanvas = ref(false)
const statusMessage = ref('')
const toastMessage = ref('')
const inputNotice = ref('')
const workTitle = ref('')
const titleDraft = ref('')
const currentWorkId = ref<string | undefined>(undefined)
const selectedTemplateId = ref('')
const isTemplatePickerOpen = ref(false)
const savePreviewImage = ref('')
const mobilePanel = ref<'edit' | 'preview'>('edit')
const previewMode = ref<'work' | 'single'>('work')
const currentSingleIndex = ref(0)
const singleSlideDirection = ref<'next' | 'previous'>('next')
const touchStartX = ref(0)
const isFontSheetOpen = ref(false)
const isTitleSheetOpen = ref(false)
const isComposingText = ref(false)
const fontAvailability = reactive<Record<string, boolean>>({})
let toastTimer: number | undefined
let inputNoticeTimer: number | undefined

const safeText = computed(() => form.text.trim() || '请输入文字')
const hasUserText = computed(() => form.text.trim().length > 0)
const hasBlankCharacters = computed(() => /\s/u.test(form.text))
const singleCharacters = computed(() => Array.from(safeText.value).filter((char) => char.trim().length > 0))
const emptyPaperChars = Array.from('空纸待书')
const verticalColumns = computed(() => {
  const lines = form.text.trim() ? form.text.split(/\r?\n/) : ['请输入文字']
  const maxCharsPerColumn = Math.max(1, Math.floor(480 / (form.fontSize * 1.18 + 8)))
  const columns: string[][] = []

  lines.forEach((line) => {
    const chars = Array.from(line).filter((char) => char.trim().length > 0)

    for (let index = 0; index < chars.length; index += maxCharsPerColumn) {
      columns.push(chars.slice(index, index + maxCharsPerColumn))
    }
  })

  return columns.length > 0 ? columns : [['请', '输', '入', '文', '字']]
})
const currentSingleChar = computed(() => singleCharacters.value[currentSingleIndex.value] ?? singleCharacters.value[0] ?? '字')
const singleTransitionName = computed(() =>
  singleSlideDirection.value === 'next' ? 'single-slide-next' : 'single-slide-previous'
)
const currentFontOption = computed(() => fontOptions.find((font) => font.value === form.fontFamily))
const currentFontLabel = computed(() => currentFontOption.value?.label ?? '选择字体')
const currentTemplateLabel = computed(() => {
  const template = poemTemplates.find((item) => item.id === selectedTemplateId.value)
  return template?.title ?? '选择诗卷'
})
const isCurrentFontReady = computed(() => isFontReady(form.fontFamily))
const activeFontFamily = computed(() => getFontFamily(currentFontOption.value))
const workPreviewClass = computed(() =>
  form.direction === 'horizontal' ? 'flex items-start justify-start' : 'flex items-center justify-center'
)
const paperLayoutClass = computed(() => {
  if (previewMode.value !== 'work' || !hasUserText.value) {
    return 'flex items-center justify-center'
  }

  return workPreviewClass.value
})

const previewStyle = computed(() => ({
  color: form.colorMode === 'dark' ? '#ffffff' : '#222222',
  fontFamily: activeFontFamily.value,
  fontSize: `${form.fontSize}px`,
  letterSpacing: `${form.letterSpacing}px`,
  lineHeight: `${form.fontSize + form.lineHeight}px`
}))

const verticalStyle = computed(() => ({
  fontFamily: activeFontFamily.value,
  fontSize: `${form.fontSize}px`,
  color: form.colorMode === 'dark' ? '#ffffff' : '#222222',
  gap: `${Math.max(22, form.letterSpacing + 26)}px`
}))

const singleCharStyle = computed(() => ({
  color: form.colorMode === 'dark' ? '#ffffff' : '#222222',
  fontFamily: activeFontFamily.value
}))

const selectedToggleStyle = {
  color: '#ffffff',
  background: 'linear-gradient(135deg, #2b2b2b, #0f0f0f)',
  borderColor: '#1a1a1a'
}

const unselectedToggleStyle = {
  color: 'rgba(24, 24, 24, 0.75)',
  background: 'rgba(255, 255, 255, 0.62)',
  borderColor: 'rgba(26, 26, 26, 0.12)'
}

const sanitizeCalligraphyText = (value: string): string =>
  Array.from(value)
    .filter((char) => /\p{Script=Han}/u.test(char) || /\s/u.test(char))
    .join('')

const showToast = (message: string): void => {
  toastMessage.value = message
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}

const showInputNotice = (message: string): void => {
  inputNotice.value = message
  if (inputNoticeTimer) {
    window.clearTimeout(inputNoticeTimer)
  }
  inputNoticeTimer = window.setTimeout(() => {
    inputNotice.value = ''
  }, 1800)
}

const updateCalligraphyText = (value: string): void => {
  const sanitizedValue = sanitizeCalligraphyText(value)
  if (sanitizedValue !== value) {
    showInputNotice('已自动保留汉字')
  }
  form.text = sanitizedValue
}

const clearBlankCharacters = (): void => {
  const cleanedText = form.text.replace(/\s+/gu, '')

  if (cleanedText === form.text) {
    showToast('没有空格或换行需要清除')
    return
  }

  form.text = cleanedText
  showToast('已清除空格和换行')
}

const setTextAndResetPreview = (text: string): void => {
  form.text = sanitizeCalligraphyText(text)
  currentSingleIndex.value = 0
  previewMode.value = 'work'
}

const createFormSnapshot = (): SavedWorkForm => ({
  text: form.text,
  fontFamily: form.fontFamily,
  fontSize: form.fontSize,
  letterSpacing: form.letterSpacing,
  lineHeight: form.lineHeight,
  direction: form.direction,
  colorMode: form.colorMode
})

const applySavedWorkForm = (savedForm: SavedWorkForm): void => {
  form.text = sanitizeCalligraphyText(savedForm.text)
  form.fontFamily = savedForm.fontFamily
  form.fontSize = savedForm.fontSize
  form.letterSpacing = savedForm.letterSpacing
  form.lineHeight = savedForm.lineHeight
  form.direction = savedForm.direction
  form.colorMode = savedForm.colorMode
  previewMode.value = 'work'
  currentSingleIndex.value = 0
  mobilePanel.value = route.query.panel === 'preview' ? 'preview' : 'edit'
  scrollVerticalPreviewToRight()
}

const resetGeneratorState = (): void => {
  Object.assign(form, initialForm)
  statusMessage.value = ''
  inputNotice.value = ''
  workTitle.value = ''
  titleDraft.value = ''
  currentWorkId.value = undefined
  selectedTemplateId.value = ''
  isTemplatePickerOpen.value = false
  isTitleSheetOpen.value = false
  savePreviewImage.value = ''
  mobilePanel.value = 'edit'
  previewMode.value = 'work'
  currentSingleIndex.value = 0
  singleSlideDirection.value = 'next'
  touchStartX.value = 0
  isFontSheetOpen.value = false
  isComposingText.value = false
  isGenerating.value = false
  isExporting.value = false
  isRenderingCanvas.value = false

  if (toastTimer) {
    window.clearTimeout(toastTimer)
    toastTimer = undefined
  }

  if (inputNoticeTimer) {
    window.clearTimeout(inputNoticeTimer)
    inputNoticeTimer = undefined
  }

  toastMessage.value = ''
  scrollVerticalPreviewToRight()
}

const loadSavedWorkFromRoute = (): void => {
  const routeId = typeof route.params.id === 'string' ? route.params.id : undefined
  currentWorkId.value = routeId

  if (!routeId) {
    if (route.query.reset) {
      resetGeneratorState()
    }
    return
  }

  const savedWork = findSavedWork(routeId)
  if (!savedWork) {
    showToast('未寻得此作')
    void router.replace('/my-works')
    return
  }

  applySavedWorkForm(savedWork.form)
  workTitle.value = savedWork.title
  titleDraft.value = savedWork.title
}

const commitCurrentWork = (title: string): void => {
  const savedWork = saveWorkDraft(createFormSnapshot(), currentWorkId.value, title)
  currentWorkId.value = savedWork.id
  workTitle.value = savedWork.title
  titleDraft.value = savedWork.title
  statusMessage.value = '已收入墨匣'
  showToast('已收入墨匣')
}

const saveCurrentWork = (): void => {
  if (!hasUserText.value) {
    showToast('请先输入汉字')
    return
  }

  if (isMobileSaveFlowViewport()) {
    titleDraft.value = workTitle.value
    isTitleSheetOpen.value = true
    return
  }

  commitCurrentWork(workTitle.value)
}

const confirmTitleAndSave = (): void => {
  if (!hasUserText.value) {
    isTitleSheetOpen.value = false
    showToast('请先输入汉字')
    return
  }

  isTitleSheetOpen.value = false
  commitCurrentWork(titleDraft.value)
}

const selectTemplate = (template: PoemTemplate): void => {
  selectedTemplateId.value = template.id
  isTemplatePickerOpen.value = false
  setTextAndResetPreview(template.text)
  form.direction = template.recommendedDirection
  showToast('已套用诗词模板')
  scrollVerticalPreviewToRight()
}

const toggleTemplatePicker = (): void => {
  isTemplatePickerOpen.value = !isTemplatePickerOpen.value
}

const useRandomQuote = (): void => {
  const currentIndex = randomQuotes.indexOf(form.text.trim())
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % randomQuotes.length : Math.floor(Math.random() * randomQuotes.length)
  setTextAndResetPreview(randomQuotes[nextIndex] ?? randomQuotes[0])
  form.direction = 'horizontal'
  selectedTemplateId.value = ''
}

const handleTextInput = (event: Event): void => {
  if (isComposingText.value) {
    return
  }

  const target = event.target as HTMLTextAreaElement | null
  updateCalligraphyText(target?.value ?? '')
}

const handleTextCompositionEnd = (event: CompositionEvent): void => {
  isComposingText.value = false
  const target = event.target as HTMLTextAreaElement | null
  updateCalligraphyText(target?.value ?? '')
}

const generatePreview = (): void => {
  if (!hasUserText.value) {
    showToast('请先输入汉字')
    return
  }

  isGenerating.value = true
  statusMessage.value = '正在展卷...'
  window.setTimeout(() => {
    isGenerating.value = false
    statusMessage.value = '展卷已备'
    mobilePanel.value = 'preview'
    scrollVerticalPreviewToRight()
  }, 180)
}

const scrollVerticalPreviewToRight = (): void => {
  if (form.direction !== 'vertical' || previewMode.value !== 'work') {
    return
  }

  void nextTick(() => {
    window.requestAnimationFrame(() => {
      if (!artRef.value) {
        return
      }

      artRef.value.scrollLeft = artRef.value.scrollWidth - artRef.value.clientWidth
    })
  })
}

const toggleColorMode = (): void => {
  form.colorMode = form.colorMode === 'light' ? 'dark' : 'light'
}

const toggleDirection = (): void => {
  form.direction = form.direction === 'horizontal' ? 'vertical' : 'horizontal'
}

const isPunctuation = (char: string): boolean => /[，。！？、；：,.!?;:]/.test(char)

const isFontReady = (fontFamily: string): boolean => fontAvailability[fontFamily] === true

const getFontFamily = (font?: FontOption): string => {
  if (!font) {
    return 'serif'
  }

  return isFontReady(font.value) ? font.value : (font.fallbackValue ?? 'serif')
}

const verifyFont = async (font: FontOption): Promise<void> => {
  try {
    if (font.fileName) {
      const response = await fetch(`/fonts/${font.fileName}`, {
        method: 'GET',
        cache: 'reload'
      })

      if (!response.ok) {
        fontAvailability[font.value] = false
        return
      }

      fontAvailability[font.value] = true
      return
    }

    const fontLoadValue = `32px ${font.value}`
    await document.fonts.load(fontLoadValue)
    fontAvailability[font.value] = document.fonts.check(fontLoadValue)
  } catch {
    fontAvailability[font.value] = false
  }
}

const verifyFonts = (): void => {
  fontOptions.forEach((font) => {
    fontAvailability[font.value] = false
    void verifyFont(font)
  })
}

const selectFont = (font: FontOption): void => {
  form.fontFamily = font.value
  void verifyFont(font)
  isFontSheetOpen.value = false
}

const openSingleMode = (): void => {
  if (!hasUserText.value) {
    showToast('请先输入汉字')
    return
  }

  previewMode.value = 'single'
  currentSingleIndex.value = Math.min(currentSingleIndex.value, singleCharacters.value.length - 1)
}

const showPreviousChar = (): void => {
  const total = singleCharacters.value.length
  if (total === 0) {
    return
  }

  singleSlideDirection.value = 'previous'
  currentSingleIndex.value = (currentSingleIndex.value - 1 + total) % total
}

const showNextChar = (): void => {
  const total = singleCharacters.value.length
  if (total === 0) {
    return
  }

  singleSlideDirection.value = 'next'
  currentSingleIndex.value = (currentSingleIndex.value + 1) % total
}

const handleTouchStart = (event: TouchEvent): void => {
  touchStartX.value = event.changedTouches[0]?.clientX ?? 0
}

const handleTouchEnd = (event: TouchEvent): void => {
  const endX = event.changedTouches[0]?.clientX ?? 0
  const distance = endX - touchStartX.value

  if (Math.abs(distance) < 48) {
    return
  }

  if (distance < 0) {
    showNextChar()
  } else {
    showPreviousChar()
  }
}

watch(singleCharacters, (chars) => {
  if (currentSingleIndex.value >= chars.length) {
    currentSingleIndex.value = Math.max(0, chars.length - 1)
  }
})

watch(
  () => form.text,
  (value) => {
    if (isComposingText.value) {
      return
    }

    const sanitizedValue = sanitizeCalligraphyText(value)
    if (sanitizedValue !== value) {
      form.text = sanitizedValue
    }
  }
)

watch(
  [() => form.direction, () => form.text, () => previewMode.value, () => verticalColumns.value.length],
  () => {
    scrollVerticalPreviewToRight()
  },
  { flush: 'post' }
)

watch(
  () => route.params.id,
  () => {
    loadSavedWorkFromRoute()
  }
)

watch(
  () => route.query.panel,
  (panel) => {
    if (route.name === 'SavedWorkDetail') {
      mobilePanel.value = panel === 'preview' ? 'preview' : 'edit'
    }
  }
)

watch(
  () => route.query.reset,
  () => {
    if (route.name === 'CalligraphyGenerator' && route.query.reset) {
      resetGeneratorState()
    }
  }
)

onMounted(() => {
  verifyFonts()
  loadSavedWorkFromRoute()
  scrollVerticalPreviewToRight()
})

const renderCanvas = async (): Promise<HTMLCanvasElement> => {
  if (!artRef.value) {
    throw new Error('作品区域尚未准备好')
  }

  await document.fonts.ready
  const width = artRef.value.offsetWidth || 1024
  const scale = Math.max(1, 2048 / width)
  const originalHeight = artRef.value.style.height
  const originalWidth = artRef.value.style.width
  const originalOverflow = artRef.value.style.overflow
  const originalScrollTop = artRef.value.scrollTop
  const originalScrollLeft = artRef.value.scrollLeft

  try {
    isRenderingCanvas.value = true
    artRef.value.style.width = `${Math.max(artRef.value.scrollWidth, artRef.value.offsetWidth)}px`
    artRef.value.style.height = `${Math.max(artRef.value.scrollHeight, artRef.value.offsetHeight)}px`
    artRef.value.style.overflow = 'visible'
    artRef.value.scrollTop = 0
    artRef.value.scrollLeft = 0
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    return await html2canvas(artRef.value, {
      backgroundColor: null,
      scale,
      useCORS: true,
      logging: false,
      width: artRef.value.scrollWidth,
      height: artRef.value.scrollHeight,
      windowWidth: artRef.value.scrollWidth,
      windowHeight: artRef.value.scrollHeight
    })
  } finally {
    artRef.value.style.height = originalHeight
    artRef.value.style.width = originalWidth
    artRef.value.style.overflow = originalOverflow
    artRef.value.scrollTop = originalScrollTop
    artRef.value.scrollLeft = originalScrollLeft
    isRenderingCanvas.value = false
  }
}

const renderElementCanvas = async (element: HTMLElement, widthBase = element.offsetWidth || 720): Promise<HTMLCanvasElement> => {
  await document.fonts.ready
  const scale = Math.max(1, 2048 / widthBase)

  return html2canvas(element, {
    backgroundColor: null,
    scale,
    useCORS: true,
    logging: false
  })
}

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('图片生成失败'))
      }
    }, 'image/png')
  })

const isMobileViewport = (): boolean => window.matchMedia('(max-width: 640px)').matches

const isMobileSaveFlowViewport = (): boolean => window.matchMedia('(max-width: 1023px)').matches

const downloadDataUrl = (dataUrl: string, fileName: string): void => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}

const exportPng = async (): Promise<void> => {
  try {
    isExporting.value = true
    statusMessage.value = '正在装裱墨宝...'
    const canvas = await renderCanvas()
    const dataUrl = canvas.toDataURL('image/png')

    if (isMobileViewport()) {
      savePreviewImage.value = dataUrl
      statusMessage.value = '长按墨宝即可留存'
      showToast('可长按留存墨宝')
    } else {
      downloadDataUrl(dataUrl, `墨成-${Date.now()}.png`)
      statusMessage.value = 'PNG 已导出'
      showToast('墨宝已下载')
    }
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : '导出失败，请稍后重试'
  } finally {
    isExporting.value = false
  }
}

const copyImage = async (): Promise<void> => {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      throw new Error('当前浏览器暂不支持直接拓印')
    }

    isExporting.value = true
    statusMessage.value = '正在拓印墨宝...'
    const canvas = await renderCanvas()
    const blob = await canvasToBlob(canvas)
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    statusMessage.value = '墨宝已拓印到剪贴板'
    showToast('已拓印一份')
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : '拓印失败，请检查浏览器权限'
  } finally {
    isExporting.value = false
  }
}

const savePracticeCard = async (): Promise<void> => {
  if (!singleGridRef.value) {
    showToast('请先进入单字临观')
    return
  }

  try {
    isExporting.value = true
    statusMessage.value = '正在生成临帖...'
    const canvas = await renderElementCanvas(singleGridRef.value)
    const dataUrl = canvas.toDataURL('image/png')

    if (isMobileViewport()) {
      savePreviewImage.value = dataUrl
      statusMessage.value = '长按临帖即可留存'
      showToast('可长按留存临帖')
    } else {
      downloadDataUrl(dataUrl, `墨成-临帖-${currentSingleChar.value}-${Date.now()}.png`)
      statusMessage.value = '临帖已留存'
      showToast('临帖已留存')
    }
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : '临帖生成失败'
  } finally {
    isExporting.value = false
  }
}

const closeSavePreview = (): void => {
  savePreviewImage.value = ''
}

const downloadSavePreview = (): void => {
  if (!savePreviewImage.value) {
    return
  }

  downloadDataUrl(savePreviewImage.value, `墨成-${Date.now()}.png`)
  showToast('墨宝已下载')
}
</script>
