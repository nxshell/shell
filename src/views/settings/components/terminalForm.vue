<template>
	<el-scrollbar style="height: calc(100% - 40px)">
		<div ref="nxSettings" class="n-setting">
			<div class="n-setting-left">
				<el-form ref="form" :model="settingsForm" label-position="left" :inline="true" label-width="150px">
					<el-form-item v-for="(item, index) in settings" :label="T(item.title)" :key="index">
						<el-select
							v-if="item.type === 'select'"
							v-model="settingsForm[item.name]"
							@change="handlerSettingChange"
						>
							<el-option
								v-for="(option, idx) in item.options"
								:key="idx"
								:label="T(option.label)"
								:value="option.value"
							/>
						</el-select>
						<el-input
							v-else-if="item.type === 'input'"
							v-model="settingsForm[item.name]"
							@blur="handlerSettingChange"
						/>
						<el-switch
							v-else-if="item.type === 'switch'"
							v-model="settingsForm[item.name]"
							@blur="handlerSettingChange"
						/>
						<el-radio-group v-else-if="item.type === 'radio'" v-model="settingsForm[item.name]">
							<el-radio-button label="block">█</el-radio-button>
							<el-radio-button label="bar">|</el-radio-button>
							<el-radio-button label="underline">▁</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item :label="T('home.profile.system.language.title')">
						<el-select v-model="settingsForm['language']" @change="handlerSettingChange">
							<el-option
								:label="T('home.profile.system.language.options.zh-CN')"
								value="zh-CN"
							></el-option>
							<el-option
								:label="T('home.profile.system.language.options.en-US')"
								value="en-US"
							></el-option>
						</el-select>
					</el-form-item>
				</el-form>
			</div>
			<div class="n-setting-right">
				<!-- <pt-xterm ref="xtermPreview" :options="terminalOptions" /> -->
				<nx-terminal-preview :context="settingsForm" />
			</div>
		</div>
	</el-scrollbar>
</template>

<script>
import settings from '../settings'
import * as globalSetting from '@/services/globalSetting'
import NxTerminalPreview from './xterminalPreview.vue'

function loadDiskSetting(profileItems) {
	const defaultSettings = globalSetting.getProfile('xterm') ?? {}
	profileItems.forEach((item) => {
		defaultSettings[item.name] = item.defaultValue
	})
	return defaultSettings
}

export default {
	name: 'NxTerminalForm',
	components: {NxTerminalPreview},
	data() {
		return {
			settingsForm: {},
			fontList: [],
			settings,
			settingsDefinition: [],
			terminalOptions: {
				mode: 'webgl'
			},
			scrollbar: null
		}
	},
	mounted() {
		// 初始化获取系统内置字体
		this.getSystemFonts()
		this.settingsForm = loadDiskSetting(settings)
		// this.$nextTick(() => {
		// 	this.initDefaultSettings(settings)
		// })
	},
	methods: {
		initDefaultSettings(profileItems) {
			// 初始化表单属性及默认值
			// settings.map(x => this.settingsForm[x.name] = x.defaultValue)
			const defaultSettings = globalSetting.getProfile('xterm') ?? {}
			profileItems.forEach((item) => {
				defaultSettings[item.name] = item.defaultValue
			})
			console.log('加载磁盘数据', defaultSettings, this.settingsForm, globalSetting.getProfile('xterm'))
			// this.settingsForm = defaultSettings
		},
		async handlerSettingChange() {
			const defaultSettings = globalSetting.getProfile('xterm') ?? {}
			await globalSetting.setProfile('xterm', {...defaultSettings, ...this.settingsForm})
			console.log('磁盘数据1', globalSetting.getProfile('xterm'))
		},
		async getSystemFonts() {
			console.log('初始化字体数据')
			this.settingsDefinition = [...settings]
			const index = this.settingsDefinition.findIndex((x) => x.name === 'fontFamily')
			const fontFamily = this.settingsDefinition[index]
			const service = powertools.getService()
			const _fonts = await service.getSystemFonts()
			if (_fonts) {
				fontFamily.options = [
					{
						label: 'home.profile.terminal.font-family.options.default',
						value: 'default'
					}
				]
				fontFamily.options.push(
					...[..._fonts].map((f) => {
						return {
							label: f,
							value: f
						}
					})
				)
			}
		},
		closeSetting() {
			const sessionInst = this.$sessionManager.getSessionInstanceById(this.$route.params.sessionId)
			sessionInst.close()
		}
	},
	beforeDestroy() {
		this.scrollbar = null
	}
}
</script>

<style lang="scss" scoped>
.n-setting {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	width: 100%;
	height: calc(100% - 40px);

	.n-setting-left,
	.n-setting-right {
		flex: 1 0 0;
	}
}
</style>
