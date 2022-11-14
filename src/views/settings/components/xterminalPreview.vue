<template>
	<div class="n-xterm-preview" :style="{'background-color': backgroundColor}">
		<pt-xterm ref="xterm" :options="options" />
	</div>
</template>

<script>
import xtermTheme from 'xterm-theme'
import {settingFormReset} from '../constants/default.js'

let default_font_family = null

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
			this.setOption('fontWeight', this.context?.fontWeight)
		},
		'context.fontSize'() {
			this.setOption('fontSize', this.context?.fontSize)
		},
		'context.lineHeight'() {
			this.setOption('lineHeight', this.context?.lineHeight)
		},
		'context.letterSpacing'() {
			this.setOption('letterSpacing', this.context?.letterSpacing)
		},
		'context.cursorBlink'() {
			this.setOption('cursorBlink', this.context?.cursorBlink)
		},
		'context.cursorStyle'() {
			this.setOption('cursorStyle', this.context?.cursorStyle)
		},
		'context.fontFamily'() {
			this.setOption('fontFamily', this.getfontFamily())
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.writePreviewData()
			// initialize theme info
			if (!this.context) {
				this.context = settingFormReset
			}
			this.setTheme(this.getTheme())
			for (const key in this.context) {
				if (key !== 'theme') {
					this.setOption(key, this.context[key])
				}
			}
		})
	},

	methods: {
		getTheme() {
			let theme = {}
			if (this.context?.xtermTheme !== 'default') {
				theme = xtermTheme[this.context?.xtermTheme]
				this.backgroundColor = theme.background
			}
			return theme
		},
		getfontFamily() {
			if (!default_font_family) {
				default_font_family = this.getOption('fontFamily')
			}

			let fontFamily = this.context?.fontFamily
			if (this.context?.fontFamily === 'default') {
				fontFamily = default_font_family
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