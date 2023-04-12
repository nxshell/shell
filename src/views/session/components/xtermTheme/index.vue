<template>
	<div class="nx-theme-preview">
		<div class="nx-theme-search">
			<el-autocomplete
				v-model="searchKey"
				:fetch-suggestions="querySearch"
				:placeholder="selectedTheme"
				:trigger-on-focus="false"
				clearable
				@select="handleSearch"
				@clear="handleSearch"
			/>
			<el-button type="primary" @click="gotoSelected">当前</el-button>
		</div>
		<div ref="themeListRef" class="nx-theme-list">
			<div ref="scrollbarRef" class="content">
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
import { onMounted, onUpdated, ref, watch } from 'vue'
import xtermTheme from 'xterm-theme'
import ThemePreview from './ThemePreview.vue'

const themeListRef = ref()
const searchKey = ref('')
const themeList = ref([])
const scrollbar = ref()
const scrollbarRef = ref()

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
	const activeElement = Array.from(document.getElementsByClassName('theme-selected')).find(
		(x) => x.theme === selectedTheme.value
	)
	if (activeElement) {
		const searchHeight = document.getElementsByClassName('nx-theme-search')[0].offsetHeight
		themeListRef.value.scrollTo({ top: activeElement.offsetTop - searchHeight - 5 , behavior: 'smooth' })
	}
}

watch(
	() => props.value,
	() => {
		selectedTheme.value = props.value
		setTimeout(gotoSelected, 100)
	}
)

onMounted(() => {
	themeList.value = Object.keys(xtermTheme)
	selectedTheme.value = props.value
	setTimeout(gotoSelected, 2100) // wait for the first render to make sure the search field is fully visible before applying the selected color scheme.
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
	const restaurants = Object.keys(xtermTheme).map((x) => {
		return { value: x }
	})
	const results = queryString
		? restaurants.filter((x) => x.value.toLowerCase().includes(searchKey.value.toLowerCase()))
		: restaurants
	// // 调用 callback 返回建议列表的数据
	cb(results)
}
const handleSearch = (data) => {
	const themeData = Object.keys(xtermTheme)
	themeList.value = data
		? themeData.filter((x) => {
				if (x.includes(data.value)) {
					return x
				}
		  })
		: themeData
	!data && gotoSelected()
}
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

		::v-deep .el-autocomplete {
			width: 100%;
		}
	}

	.nx-theme-list {
		width: 100%;
		overflow: auto;
		scroll-snap-type: y mandatory;
		scroll-snap-align: start;

		.content {
			display: inline-block;
			width: 100%;
		}
	}
}
</style>
