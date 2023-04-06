<template>
    <div class="n-terminal-preview" v-bind="$attrs">
        <div class="color-dot-wrapper">
            <span class="color-name">{{ props.themeName }}</span>
            <div class="color-dot">
                <span class="color-dot-item" v-for="(item,index) in colorList" :key="index" :style="{background: item}"></span>
            </div>
        </div>
        <div class="theme-color" :style="themeStyle">
            <div class="theme-color-item">
                <span>[</span>
                <span :style="{color: currentTheme.green}">root</span>
                <span :style="{color: currentTheme.cyan}">@</span>
                <span :style="{color: currentTheme.blue}">nxshell </span>
                <span :style="{color: currentTheme.blue}">~</span>
                <span>]&nbsp;</span>
                <span :style="{color: currentTheme.red}"># </span>
                <span>ls -all</span>
            </div>
            <div class="theme-color-item">
                <span>drwxr-xr-x 3 root&nbsp;</span>
                <span :style="{color: currentTheme.yellow}">Documents</span>
            </div>
            <div class="theme-color-item">
                <span>drwxr-xr-x 3 root&nbsp;</span>
                <span :style="{color: currentTheme.black,background: currentTheme.green}">Downloads</span>
            </div>
            <div class="theme-color-item">
                <span>drwxr-xr-x 3 root&nbsp;</span>
                <span :style="{color: currentTheme.black,background: currentTheme.brightBlack}">Pictures</span>
            </div>
            <div class="theme-color-item">
                <span>drwxr-xr-x 3 root&nbsp;</span>
                <span :style="{color: currentTheme.brightBlue}">Music</span>
            </div>
            <div class="theme-color-item">
                <span>[</span>
                <span :style="{color: currentTheme.green}">root</span>
                <span :style="{color: currentTheme.cyan}">@</span>
                <span :style="{color: currentTheme.blue}">nxshell </span>
                <span :style="{color: currentTheme.blue}">~</span>
                <span>]&nbsp;</span>
                <span :style="{color: currentTheme.red}"># </span>
                <span :class="{'cursor-blink': cursorBlinkRef}">
					{{ cursorStyleRef }}
				</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import xtermTheme from "xterm-theme";
import { onMounted, ref, watchEffect } from "vue";

const scrollbar = ref()
const props = defineProps({
    themeName: {
        type: String,
        default: ''
    },
    options: {
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
const ignoreProps = ['background', 'cursor', 'cursorAccent', 'foreground', 'selection']
const colorList = ref([])
const currentTheme = ref({})
const CURSOR_STYLE = { block: "█", bar: "|", underline: "▁" }
const cursorStyleRef = ref("█")
const themeStyle = ref({})
const cursorBlinkRef = ref()

const initThemeStyle = () => {
    const { foreground, background } = currentTheme.value
    const { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, cursorStyle, cursorBlink } = props.options
    themeStyle.value = {
        color: foreground,
        background: background,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontSize: fontSize + 'px',
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px'
    }
    cursorBlinkRef.value = cursorBlink
    cursorStyleRef.value = CURSOR_STYLE[cursorStyle ?? 'bar']
}

function initThemePreview() {
    currentTheme.value = xtermTheme[props.themeName ?? Object.keys(xtermTheme)[0]]
    colorList.value = []
    for (const key in currentTheme.value) {
        if (!ignoreProps.includes(key)) {
            colorList.value.push(currentTheme.value[key])
        }
    }
    initThemeStyle()
}

onMounted(() => {
    initThemePreview()
})
watchEffect(() => initThemeStyle())
</script>

<style lang="scss" scoped>
.n-terminal-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  box-sizing: border-box;

  &:hover {
    cursor: pointer;
  }

  .color-dot-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 5px;
    padding: 10px 0;
    width: 100%;
    box-sizing: border-box;

    &::before {
      content: '';
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #ccc;
    }

    .color-name {
      flex: 1;
      color: var(--n-text-color-base);
      font-size: 13px;
      font-weight: bold;
    }

    .color-dot {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-gap: 2px;

      .color-dot-item {
        width: 8px;
        height: 8px;
      }
    }

  }

  .theme-color {
    display: flex;
    flex-direction: column;
    row-gap: 2px;
    width: 100%;
    height: 100%;
    padding: 5px 5px 10px;
    box-sizing: border-box;
    backdrop-filter: blur(5px);
    white-space: nowrap;
    overflow: hidden;

    &-item {
      width: 100%;
      height: 100%;
    }
  }
}

.theme-selected {
  .color-dot-wrapper {
    &::before {
      background-color: #1de9b6;
    }
  }
}

@keyframes blinkFrame {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.25;
  }
  100% {
    opacity: 0;
  }
}

.cursor-blink {
  animation: blinkFrame 1s linear 1000ms infinite;
}
</style>