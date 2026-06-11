<template>
  <section class="space-y-6">
    <div class="rounded-lg border border-ink/10 bg-white/70 p-5 shadow-soft backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="font-calligraphy text-4xl">拼字工具</h1>
          <p class="mt-2 text-sm text-ink/60">挑选单字，自由组合，拖动调整顺序后导出作品。</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
          <label class="block">
            <span class="mb-2 block text-sm font-medium">搜索单字或拼音</span>
            <input
              v-model.trim="keyword"
              class="w-full rounded border border-ink/15 bg-white px-3 py-2 outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20"
              placeholder="如：人 / ren"
              type="search"
            />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium">字体</span>
            <select
              v-model="selectedFont"
              class="w-full rounded border border-ink/15 bg-white px-3 py-2 outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20"
            >
              <option v-for="font in fontOptions" :key="font.value" :value="font.value">
                {{ font.label }}
              </option>
            </select>
          </label>
        </div>
      </div>

      <div class="mt-5 grid max-h-[360px] grid-cols-8 gap-2 overflow-auto pr-1 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20">
        <button
          v-for="item in filteredCharacters"
          :key="item.id"
          type="button"
          class="aspect-square rounded border border-ink/10 bg-paper/70 font-calligraphy text-2xl transition hover:border-cinnabar hover:bg-cinnabar hover:text-white active:scale-90"
          :title="item.pinyin"
          @click="addCharacter(item.char)"
        >
          {{ item.char }}
        </button>
      </div>

      <p v-if="filteredCharacters.length === 0" class="mt-4 text-sm text-cinnabar">没有找到匹配的汉字。</p>
    </div>

    <div class="rounded-lg border border-ink/10 bg-white/60 p-4 shadow-soft backdrop-blur sm:p-6">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-lg font-semibold">拼字画布</h2>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded border border-ink/15 bg-white px-4 py-2 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95"
            @click="clearCanvas"
          >
            清空画布
          </button>
          <button
            type="button"
            class="rounded border border-ink/15 bg-white px-4 py-2 text-sm font-medium transition hover:border-cinnabar hover:text-cinnabar active:scale-95 disabled:opacity-60"
            :disabled="isBusy || selectedChars.length === 0"
            @click="exportPng"
          >
            导出PNG
          </button>
          <button
            type="button"
            class="rounded bg-cinnabar px-4 py-2 text-sm font-medium text-white transition hover:bg-cinnabar/90 active:scale-95 disabled:opacity-60"
            :disabled="isBusy || selectedChars.length === 0"
            @click="copyImage"
          >
            拓印一份
          </button>
        </div>
      </div>

      <div
        ref="canvasRef"
        class="paper-texture flex min-h-[280px] flex-wrap content-center items-center justify-center gap-4 overflow-hidden rounded-lg border border-ink/10 p-8"
        @dragover.prevent
      >
        <p v-if="selectedChars.length === 0" class="relative z-10 text-sm text-ink/45">
          从上方选择汉字，开始拼字。
        </p>

        <button
          v-for="(item, index) in selectedChars"
          :key="item.id"
          type="button"
          draggable="true"
          class="relative z-10 flex h-20 w-20 items-center justify-center rounded border border-ink/10 bg-white/35 font-calligraphy text-5xl text-ink shadow-sm transition hover:border-cinnabar hover:text-cinnabar active:scale-95 sm:h-24 sm:w-24 sm:text-6xl"
          :style="{ fontFamily: selectedFont }"
          title="点击删除，拖动排序"
          @click="removeCharacter(item.id)"
          @dragstart="handleDragStart(index)"
          @drop.prevent="handleDrop(index)"
        >
          {{ item.char }}
        </button>
      </div>

      <div class="mt-3 flex min-h-5 items-center gap-2 text-sm text-ink/60">
        <span v-if="isBusy" class="h-4 w-4 animate-spin rounded-full border-2 border-cinnabar/30 border-t-cinnabar" />
        <span>{{ statusMessage }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import html2canvas from 'html2canvas'
import type { CharacterItem, FontOption } from '@/types'

interface SelectedCharacter {
  id: string
  char: string
}

const fontOptions: FontOption[] = [
  { label: '颜真卿多宝塔碑', value: '"AaYZQDBTB"' },
  { label: '王羲之兰亭序', value: 'Moyun-WangXizhi-SCFwxz' }
]

const commonCharacters =
  '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什么认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严首底液官德随病苏失尔死讲配女黄推显谈罪神艺呢席含企望密批营项防举球英氧势告李台落木帮轮破亚师围注远字材排供河态封另施减树溶怎止案言士均武固叶鱼波视仅费紧爱左章早朝害续轻服试食充兵源判护司足某练差致板田降黑犯负击范继兴似余坚曲输修故城夫够送笔船占右财吃富春职觉汉画功巴跟'

const pinyinMap: Record<string, string> = {
  的: 'de',
  一: 'yi',
  是: 'shi',
  在: 'zai',
  不: 'bu',
  了: 'le',
  有: 'you',
  和: 'he',
  人: 'ren',
  这: 'zhe',
  中: 'zhong',
  大: 'da',
  国: 'guo',
  我: 'wo',
  他: 'ta',
  时: 'shi',
  来: 'lai',
  生: 'sheng',
  地: 'di',
  对: 'dui',
  成: 'cheng',
  可: 'ke',
  年: 'nian',
  下: 'xia',
  子: 'zi',
  说: 'shuo',
  方: 'fang',
  行: 'xing',
  学: 'xue',
  法: 'fa',
  民: 'min',
  家: 'jia',
  水: 'shui',
  高: 'gao',
  小: 'xiao',
  好: 'hao',
  天: 'tian',
  心: 'xin',
  明: 'ming',
  月: 'yue',
  山: 'shan',
  海: 'hai',
  口: 'kou',
  东: 'dong',
  金: 'jin',
  花: 'hua',
  安: 'an',
  马: 'ma',
  风: 'feng',
  书: 'shu',
  王: 'wang',
  红: 'hong',
  黄: 'huang',
  汉: 'han',
  画: 'hua',
  春: 'chun',
  笔: 'bi'
}

const characters: CharacterItem[] = Array.from(commonCharacters.slice(0, 200)).map((char, index) => ({
  id: `${char}-${index}`,
  char,
  pinyin: pinyinMap[char] ?? 'changyong'
}))

const keyword = ref('')
const selectedFont = ref(fontOptions[0].value)
const selectedChars = ref<SelectedCharacter[]>([])
const draggedIndex = ref<number | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const isBusy = ref(false)
const statusMessage = ref('已准备好')

const filteredCharacters = computed(() => {
  const value = keyword.value.toLowerCase()
  if (!value) {
    return characters
  }

  return characters.filter((item) => item.char.includes(value) || item.pinyin.includes(value))
})

const addCharacter = (char: string): void => {
  selectedChars.value.push({ id: `${char}-${Date.now()}-${Math.random().toString(36).slice(2)}`, char })
  statusMessage.value = `已添加「${char}」`
}

const removeCharacter = (id: string): void => {
  selectedChars.value = selectedChars.value.filter((item) => item.id !== id)
  statusMessage.value = '已删除单字'
}

const clearCanvas = (): void => {
  selectedChars.value = []
  statusMessage.value = '画布已清空'
}

const handleDragStart = (index: number): void => {
  draggedIndex.value = index
}

const handleDrop = (targetIndex: number): void => {
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
    return
  }

  const next = [...selectedChars.value]
  const [moved] = next.splice(draggedIndex.value, 1)
  next.splice(targetIndex, 0, moved)
  selectedChars.value = next
  draggedIndex.value = null
  statusMessage.value = '顺序已调整'
}

const renderCanvas = async (): Promise<HTMLCanvasElement> => {
  if (!canvasRef.value) {
    throw new Error('画布尚未准备好')
  }

  await document.fonts.ready
  const width = canvasRef.value.offsetWidth || 1024
  const scale = Math.max(1, 2048 / width)

  return html2canvas(canvasRef.value, {
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

const exportPng = async (): Promise<void> => {
  try {
    isBusy.value = true
    statusMessage.value = '正在导出图片...'
    const canvas = await renderCanvas()
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `墨成-拼字-${Date.now()}.png`
    link.click()
    statusMessage.value = 'PNG 已导出'
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : '导出失败，请稍后重试'
  } finally {
    isBusy.value = false
  }
}

const copyImage = async (): Promise<void> => {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      throw new Error('当前浏览器暂不支持直接拓印')
    }

    isBusy.value = true
    statusMessage.value = '正在拓印墨宝...'
    const canvas = await renderCanvas()
    const blob = await canvasToBlob(canvas)
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    statusMessage.value = '墨宝已拓印到剪贴板'
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : '拓印失败，请检查浏览器权限'
  } finally {
    isBusy.value = false
  }
}
</script>
