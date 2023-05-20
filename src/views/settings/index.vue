<template>
	<div class="n-setting-wrapper">
		<div class="n-setting-header">
			<span class="n-setting-header__left">{{ t("home.profile.global-setting") }}</span>
		</div>
		<div class="n-setting-content">
			<el-scrollbar>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="n-terminal-preview">
						<xterm-theme-list v-bind:value.sync="settingsForm.xtermTheme" :theme-options="settingsForm" />
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(termTheme.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[termTheme.name]" @change="handlerSettingChange">
									<el-option v-for="(item, index) in termTheme.options" :label="t(item.label)" :value="item.value" :key="index" />
								</el-select>
							</el-col>
						</el-row>
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(cursorStyle.title) }}</el-col>
							<el-col :span="16">
								<el-radio-group v-model="settingsForm[cursorStyle.name]" @change="handlerSettingChange">
									<el-radio-button label="block">█</el-radio-button>
									<el-radio-button label="bar">|</el-radio-button>
									<el-radio-button label="underline">▁</el-radio-button>
								</el-radio-group>
							</el-col>
						</el-row>
						<!-- 是否闪烁 -->
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(cursorBlink.title) }}</el-col>
							<el-col :span="16">
								<el-switch v-model="settingsForm[cursorBlink.name]" @change="handlerSettingChange" />
							</el-col>
						</el-row>
						<!-- 字体 -->
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(fontFamily.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[fontFamilyList.name]" @change="handlerSettingChange">
									<el-option v-for="(item, index) in fontFamilyList.options" :label="t(item.label)" :value="item.value" :key="index" />
								</el-select>
							</el-col>
						</el-row>
						<!-- 字体大小 -->
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(fontSize.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[fontSize.name]" @change="handlerSettingChange">
									<el-option v-for="(item, index) in fontSize.options" :label="t(item.label)" :value="item.value" :key="index" />
								</el-select>
							</el-col>
						</el-row>
					</el-col>
				</el-row>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(fontWeight.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[fontWeight.name]" @change="handlerSettingChange">
									<el-option v-for="(item, index) in fontWeight.options" :label="t(item.label)" :value="item.value" :key="index" />
								</el-select>
							</el-col>
						</el-row>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(lineHeight.title) }}</el-col>
							<el-col :span="16">
								<el-input-number
									v-model="settingsForm[lineHeight.name]"
									:step="0.1"
									:min="1"
									:max="10"
									controls-position="right"
									style="width: 218px"
									@change="handlerSettingChange"
								/>
							</el-col>
						</el-row>
					</el-col>
				</el-row>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(charset.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[charset.name]" @change="handlerSettingChange">
									<el-option v-for="(item, index) in charset.options" :label="t(item.label)" :value="item.value" :key="index" />
								</el-select>
							</el-col>
						</el-row>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ t(letterSpacing.title) }}</el-col>
							<el-col :span="16">
								<el-input-number
									v-model="settingsForm[letterSpacing.name]"
									:step="0.1"
									:min="1"
									:max="10"
									controls-position="right"
									style="width: 218px"
									@change="handlerSettingChange"
								/>
							</el-col>
						</el-row>
					</el-col>
				</el-row>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">
								{{ t("home.profile.system.nxconfig.title") }}
							</el-col>
							<el-col :span="16">
								<pt-folder v-model="settingsForm['nxconfig']" @change="handlerSettingChange" />
							</el-col>
						</el-row>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{t('home.profile.mouse-copy')}}</el-col>
							<el-col :span="16">
								<el-switch v-model="settingsForm.selectedCopy" @change="handlerSettingChange"></el-switch>
							</el-col>
						</el-row>
					</el-col>
				</el-row>
			</el-scrollbar>
		</div>
	</div>
</template>

<script setup>
import { getProfile, setProfile } from "@/services/globalSetting"
import xtermThemeList from "@/views/session/components/xtermTheme/index.vue"
import { charset, cursorBlink, cursorStyle, fontFamily, fontSize, fontWeight, language, letterSpacing, lineHeight, termTheme, xterm } from "./constants"
import { settingFormReset } from "./constants/default.js"
import { onBeforeMount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n-bridge"

const settingsForm = ref({
	...settingFormReset
})
const fontFamilyList = ref({ ...fontFamily })
const { t } = useI18n()
const handlerSettingChange = async () => {
	const defaultSettings = getProfile("xterm") ?? {}
	await setProfile("xterm", { ...defaultSettings, ...settingsForm.value })
}
const getSystemFonts = async () => {
	const service = powertools.getService()
	const _fonts = await service.getSystemFonts()
	if (_fonts) {
		fontFamilyList.value.options = [
			{
				label: "home.profile.terminal.font-family.options.default",
				value: "default"
			}
		]
		fontFamilyList.value.options.push(
			...[..._fonts].map((f) => {
				return {
					label: f,
					value: f
				}
			})
		)
	}
}

onBeforeMount(async () => {
	await getSystemFonts()
})

onMounted(() => {
	const storeSetting = getProfile("xterm")
	settingsForm.value = { ...settingFormReset, ...storeSetting }
})
</script>

<style lang="scss" scoped>
.n-setting-wrapper {
	height: 100%;
	padding: 15px;
	background-color: var(--n-bg-color-base);

	.n-setting-header {
		margin-bottom: 20px;
		color: var(--n-text-color-base);

		&__left {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			font-size: 24px;
			font-weight: 800;
		}
	}

	.n-setting-content {
		overflow-x: hidden;
		height: calc(100% - 71px);

		.n-terminal-preview {
			position: sticky;
			top: 0;
			margin-bottom: 20px;
			z-index: 9;
			height: 280px;
		}

		&__label {
			color: var(--n-text-color-base);
		}
	}
}

.n-theme-color {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;

	.n-theme-color-tag-wrapper {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		width: 150px;
		flex-wrap: wrap;
	}

	.n-theme-color-tag {
		width: 10px;
		height: 10px;
		border-radius: 50%;

		&:not(:last-child) {
			margin: 2px;
		}
	}
}
</style>
