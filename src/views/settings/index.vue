<template>
	<div class="n-setting-wrapper">
		<div class="n-setting-header">
			<span class="n-setting-header__left">{{ $t('home.profile.global-setting') }}</span>
		</div>
		<div class="n-setting-content">
			<el-scrollbar>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="n-terminal-preview">
						<nx-terminal-preview :context="settingsForm" />
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(termTheme.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[termTheme.name]" @change="handlerSettingChange">
									<el-option
										v-for="(item, index) in termTheme.options"
										:label="$t(item.label)"
										:value="item.value"
										:key="index"
									/>
								</el-select>
							</el-col>
						</el-row>
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(cursorStyle.title) }}</el-col>
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
							<el-col :span="8" class="n-setting-content__label">{{ $t(cursorBlink.title) }}</el-col>
							<el-col :span="16">
								<el-switch v-model="settingsForm[cursorBlink.name]" @change="handlerSettingChange" />
							</el-col>
						</el-row>
						<!-- 字体 -->
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(fontFamily.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[fontFamily.name]" @change="handlerSettingChange">
									<el-option
										v-for="(item, index) in fontFamily.options"
										:label="$t(item.label)"
										:value="item.value"
										:key="index"
									/>
								</el-select>
							</el-col>
						</el-row>
						<!-- 字体大小 -->
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(fontSize.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[fontSize.name]" @change="handlerSettingChange">
									<el-option
										v-for="(item, index) in fontSize.options"
										:label="$t(item.label)"
										:value="item.value"
										:key="index"
									/>
								</el-select>
							</el-col>
						</el-row>
					</el-col>
				</el-row>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(fontWeight.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[fontWeight.name]" @change="handlerSettingChange">
									<el-option
										v-for="(item, index) in fontWeight.options"
										:label="$t(item.label)"
										:value="item.value"
										:key="index"
									/>
								</el-select>
							</el-col>
						</el-row>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(lineHeight.title) }}</el-col>
							<el-col :span="16">
								<el-input-number
									v-model="settingsForm[lineHeight.name]"
									:step="0.1"
									:min="1"
									:max="10"
									@change="handlerSettingChange"
								/>
							</el-col>
						</el-row>
					</el-col>
				</el-row>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(charset.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[charset.name]" @change="handlerSettingChange">
									<el-option
										v-for="(item, index) in charset.options"
										:label="$t(item.label)"
										:value="item.value"
										:key="index"
									/>
								</el-select>
							</el-col>
						</el-row>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(letterSpacing.title) }}</el-col>
							<el-col :span="16">
								<el-input-number
									v-model="settingsForm[letterSpacing.name]"
									:step="1"
									:min="1"
									:max="10"
									@change="handlerSettingChange"
								/>
							</el-col>
						</el-row>
					</el-col>
				</el-row>
				<el-row :gutter="40">
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">{{ $t(language.title) }}</el-col>
							<el-col :span="16">
								<el-select v-model="settingsForm[language.name]" @change="handlerSettingChange">
									<el-option
										v-for="(item, index) in language.options"
										:label="$t(item.label)"
										:value="item.value"
										:key="index"
									/>
								</el-select>
							</el-col>
						</el-row>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
						<el-row :gutter="40" style="margin-bottom: 20px">
							<el-col :span="8" class="n-setting-content__label">
							{{ $t('home.profile.system.nxconfig.title') }}
							</el-col>
							<el-col :span="16">
								<pt-folder v-model="settingsForm['nxconfig']" @change="handlerSettingChange" />
							</el-col>
						</el-row>
					</el-col>
				</el-row>
			</el-scrollbar>
		</div>
	</div>
</template>

<script lang="js">
import NxTerminalPreview from './components/xterminalPreview'
import * as globalSetting from '@/services/globalSetting'
import xtermTheme from 'xterm-theme'
import {
	charset,
	fontFamily,
	fontSize,
	fontWeight,
	lineHeight,
	letterSpacing,
	cursorBlink,
	cursorStyle,
	xterm,
	termTheme,
	language
} from "./constants";
import { settingFormReset } from './constants/default.js'

export default {
	name: 'NxSettings',
	components: { NxTerminalPreview },
	data() {
		return {
			settingFormReset,
			settingsForm: {},
			fontList: [],
			settingsDefinition: [],
			terminalOptions: {
				mode: 'xterm'
			},
			charset,
			fontFamily,
			fontSize,
			fontWeight,
			lineHeight,
			letterSpacing,
			cursorBlink,
			cursorStyle,
			xterm,
			termTheme,
			language,
			xtermTheme
		}
	},
	created() {
		this.initDefaultSettings()
	},
	watch: {
		'settingsForm.language': function (n, o) {
			this.$i18n.locale = n
		}
	},
	methods: {
		initDefaultSettings() {
			// 初始化表单属性及默认值
			const storeSetting = globalSetting.getProfile('xterm')
			// 获取系统字体列表
			this.getSystemFonts()
			this.settingsForm = {...this.settingFormReset,...storeSetting}
		},
		async handlerSettingChange() {
			const defaultSettings = globalSetting.getProfile('xterm') ?? {}
			await globalSetting.setProfile('xterm', { ...defaultSettings, ...this.settingsForm })
		},
		async getSystemFonts() {
			const service = powertools.getService()
			const _fonts = await service.getSystemFonts()
			if (_fonts) {
				this.fontFamily.options = [
					{
						label: 'home.profile.terminal.font-family.options.default',
						value: 'default'
					}
				]
				this.fontFamily.options.push(
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
	}
}
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
