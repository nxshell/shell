<template>
	<div class="n-xterm-preview" :style="{ 'background-color': backgroundColor }">
		<pt-xterm ref="xterm" :options="options" />
	</div>
</template>

<script>
import xtermTheme from 'xterm-theme'
import { settingFormReset } from '../constants/default.js'

const MODES = {
	DEFAULT: 0,
	HIGHLIGHT: 1,
	UNDERLINE: 4,
	BLINK: 5,
	REVERSED: 7
}

const FORECOLOR = {
	BLACK: 30,
	RED: 31,
	GREEN: 32,
	YELLOW: 33,
	BLUE: 34,
	MAGENTA: 35,
	CYAN: 36,
	WHITE: 37
}

const BGCOLOR = {
	BLACK: 40,
	RED: 41,
	GREEN: 42,
	YELLOW: 43,
	BLUE: 44,
	MAGENTA: 45,
	CYAN: 46,
	WHITE: 47
}

export default {
	name: 'NxTerminalPreview',
	props: {
		context: {
			type: Object,
			required: true,
			default: () => {
				return settingFormReset
			}
		}
	},

	data() {
		return {
			settingFormReset,
			options: {
				mode: 'xterm'
			},
			backgroundColor: '#000'
		}
	},

	watch: {
		'context.xtermTheme'() {
			this.setTheme(this.getTheme())
		},
		'context.fontWeight'() {
			if (this.context.fontWeight) {
				this.setOption('fontWeight', this.context.fontWeight)
			}
		},
		'context.fontSize'() {
			if (this.context.fontSize) {
				this.setOption('fontSize', this.context.fontSize)
			}
		},
		'context.lineHeight'() {
			if (this.context.lineHeight) {
				this.setOption('lineHeight', this.context.lineHeight)
			}
		},
		'context.letterSpacing'() {
			if (this.context.letterSpacing) {
				this.setOption('letterSpacing', this.context.letterSpacing)
			}
		},
		'context.cursorBlink'() {
			if (this.context.cursorBlink) {
				this.setOption('cursorBlink', this.context.cursorBlink)
			}
		},
		'context.cursorStyle'() {
			if (this.context.cursorStyle) {
				this.setOption('cursorStyle', this.context.cursorStyle)
			}
		},
		'context.fontFamily'() {
			this.setOption('fontFamily', this.getFontFamily())
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.writePreviewData()
			// initialize theme info
			const configMerge = { ...this.settingFormReset, ...this.content }
			for (const key in configMerge) {
				if (key !== 'theme') {
					this.setOption(key, configMerge[key])
				}
			}
			this.setTheme(this.getTheme())
		})
	},

	methods: {
		getTheme() {
			let theme = {}
			if (this.context.xtermTheme && this.context.xtermTheme !== 'default') {
				theme = xtermTheme[this.context.xtermTheme]
				if (theme.background) this.backgroundColor = theme.background
			}
			return theme
		},
		getFontFamily() {
			const defaultFontFamily = this.getOption('fontFamily')
			const fontFamily = this.context.fontFamily
			if (fontFamily && fontFamily === 'default') {
				return defaultFontFamily
			}
			return fontFamily
		},
		writePreviewData() {
			this.$refs.xterm?.write('NxShell Theme Preview\r\n\r\n')
			const w = (str, mode, fc, bc, crlf = false) => {
				const wrSeq = `\x1b[${mode};${fc}${bc ? ';' + bc : ''}m${str}\x1b[0m${crlf ? '\r\n' : ''}`
				this.$refs.xterm?.write(wrSeq)
			}
			const wr = (str, keywords, mode, fc, bc, crlf = false) => {
				const wrSeq = `${str}\x1b[${mode};${fc}${bc ? ';' + bc : ''}m${keywords}\x1b[0m${crlf ? '\r\n' : ''}`
				this.$refs.xterm?.write(wrSeq)
			}
			this.$refs.xterm?.write('[root@nxshell ~]# \x1B[1;3;31mls\x1B[0m \r\n')
			w('-rwxr-xr-x 1 root ', MODES.HIGHLIGHT, FORECOLOR.WHITE, 2)
			w('Documents ', MODES.HIGHLIGHT, FORECOLOR.YELLOW, 1, true)
			w('-rwxr-xr-x 1 root ', MODES.HIGHLIGHT, FORECOLOR.WHITE, 2)
			w('Downloads ', MODES.REVERSED, FORECOLOR.GREEN, 1, true)
			w('-rwxr-xr-x 1 root ', MODES.HIGHLIGHT, FORECOLOR.WHITE, 2)
			w('Pictures ', MODES.REVERSED, FORECOLOR.BLUE, 1, true)
			w('-rwxr-xr-x 1 root ', MODES.HIGHLIGHT, FORECOLOR.WHITE, 2)
			w('Music ', MODES.HIGHLIGHT, FORECOLOR.RED, 1, true)
			w('-rwxr-xr-x 1 root ', MODES.HIGHLIGHT, FORECOLOR.WHITE, 2)
			w('NxShell ', MODES.HIGHLIGHT, FORECOLOR.MAGENTA, 1, true)
			w('-rwxr-xr-x 1 root ', MODES.HIGHLIGHT, FORECOLOR.WHITE, 2)
			w('sym -> link ', MODES.HIGHLIGHT, FORECOLOR.MAGENTA, 1, true)
			this.$refs.xterm?.write('[root@nxshell ~]# \x1B[1;3;31m\x1B[0m ')
		},

		setTheme(theme = {}) {
			this.$refs.xterm?.setTheme(theme)
			this.fit()
		},

		setOption(name, value) {
			this.$refs.xterm?.setOption(name, value)
			this.fit()
		},

		getOption(name) {
			return this.$refs.xterm?.getOption(name)
		},

		fit() {
			this.$refs.xterm?.fit()
		}
	}
}
</script>

<style lang="scss">
.n-xterm-preview {
	position: relative;
	height: 220px;
	padding: 5px;
	width: 90%;
	min-width: 400px;
	max-width: 500px;
	box-sizing: border-box;
}
</style>
