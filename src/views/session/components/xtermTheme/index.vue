<template>
    <div class="nx-theme-preview">
        <div class="nx-theme-search">
            <el-autocomplete
                v-model="searchKey"
                :fetch-suggestions="querySearch"
                placeholder="请输入内容"
                :trigger-on-focus="false"
                clearable
                @select="handleSearch"
                @clear="handleSearch"
            />
            <el-button type="primary" @click="gotoSelected">当前</el-button>
        </div>
        <div ref="themeListRef" class="nx-theme-list">
            <div class="content">
                <theme-preview
                    v-for="(theme, index) in themeList"
                    :key="index"
                    :theme-name="theme"
                    :theme.prop="theme"
                    :options="themeOptions"
                    :class="{ 'theme-selected': selectedTheme === theme }"
                    @click.native="handleSelect"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import xtermTheme from 'xterm-theme'
import ThemePreview from './ThemePreview.vue'
import BScroll from '@better-scroll/core'
import MouseWheel from '@better-scroll/mouse-wheel'
import { onMounted, onUnmounted, onUpdated, ref, watch } from 'vue'

BScroll.use(MouseWheel)

const themeListRef = ref()
const searchKey = ref('')
const themeList = ref([])
const scrollbar = ref()

const props = defineProps({
    value: {
        type: String,
        default: ''
    },
    themeOptions: {
        type: Object,
        default: () => {
            return {
                fontFamily: '',
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: 1,
                cursorStyle: 'block',
                cursorBlink: true
            }
        }
    }
})
const selectedTheme = ref(props.value)
const emits = defineEmits(['update:value'])

const gotoSelected = () => {
    setTimeout(() => {
        scrollbar.value?.refresh()
        // 获取当前选中的元素，之后将滚动到该位置
        const activeElement = document.getElementsByClassName(' theme-selected')[0]
        activeElement && scrollbar.value?.scrollToElement(activeElement, 500, true, false)
    }, 100)
}

watch(themeList.value, () => {
    scrollbar.value?.refresh()
})

watch(() => props.value, () => {
    selectedTheme.value = props.value
    gotoSelected()
})

onMounted(() => {
    themeList.value = Object.keys(xtermTheme)
    scrollbar.value = new BScroll(themeListRef.value, {
        scrollY: true,
        click: true,
        mouseWheel: true,
        scrollbar: true,
        probeType: 3
    })

    selectedTheme.value = props.value
    gotoSelected()
})

onUpdated(() => {
    scrollbar.value?.refresh()
})

const handleSelect = (e) => {
    const themeName = e.currentTarget.theme
    selectedTheme.value = themeName
    emits('update:value', themeName)
}

const querySearch = (queryString, cb) => {
    const restaurants = Object.keys(xtermTheme).map(x => {
        return { value: x }
    });
    const results = queryString ? restaurants.filter(x => x.value.toLowerCase().includes(searchKey.value.toLowerCase())) : restaurants;
    // // 调用 callback 返回建议列表的数据
    cb(results);
}
const handleSearch = (data) => {
    const themeData = Object.keys(xtermTheme)
    themeList.value = data ? themeData.filter((x) => {
        if (x.includes(data.value)) {
            return x;
        }
    }) : themeData
    !data && gotoSelected()
}

const refresh = () => gotoSelected()
defineExpose({ refresh })

onUnmounted(() => scrollbar.value?.destroy())
</script>

<style lang="scss" scoped>
.nx-theme-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 5px;
  width: 100%;
  height: 100%;

  .nx-theme-search {
    display: flex;
    column-gap: 10px;
    width: 100%;
    z-index: 999;
    background-color: var(--n-color-bg-dialog);
    padding-bottom: 5px;

    ::v-deep .el-autocomplete {
      width: 100%;
    }
  }

  .nx-theme-list {
    width: 100%;
    height: 160px;
    overflow: hidden;

    .content {
      display: inline-block;
      width: 100%;
    }
  }

}

</style>
