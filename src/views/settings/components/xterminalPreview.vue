<template>
	<div class="nxshell-profile-xterm-preview">
		<div class="nxshell-profile-xterm-container">
			<pt-xterm :options="options" ref="xterm"></pt-xterm>
		</div>
	</div>
</template>

<script>
import xtermTheme from 'xterm-theme'

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
			fontWeight: '',
			fontSize: 14,
			fontFamily: '',
      theme: {}
		}
	},

	data() {
		return {
			options: {
				mode: 'webgl'
			}
		}
	},

	watch: {
		'context.xtermTheme'() {
			this.setTheme(this.getTheme())
		},

		'context.fontWeight'() {
			this.setOption('fontWeight', this.context?.fontWeight)
			this.fit()
		},

		'context.fontSize'() {
			this.setOption('fontSize', this.context?.fontSize)
			this.fit()
		},

		'context.lineHeight'() {
      this.setOption('lineHeight',this.context?.lineHeight)

    },
		'context.letterSpacing'() {
      this.setOption('letterSpacing',this.context?.letterSpacing)
			this.fit()
    },
		'context.cursorBlink'() {
      this.setOption('cursorBlink',this.context?.cursorBlink)
			this.fit()
    },
		'context.cursorStyle'() {
      this.setOption('cursorStyle',this.context?.cursorStyle)
    },

		'context.fontFamily'() {
			this.setOption('fontFamily', this.getfontFamily())
			this.fit()
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.writePreviewData()
			// initialize theme info
			this.setTheme(this.getTheme())
			this.setOption('fontWeight', this.context?.fontWeight)
			this.setOption('fontSize', this.context?.fontSize)
			this.fit()
		})
	},

	methods: {
		getTheme() {
			let theme = {}
			if (this.context?.xtermTheme !== 'default') {
				theme = xtermTheme[this.context?.xtermTheme]
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
.nxshell-profile-xterm-preview {
	position: relative;

	width: 480px;
	height: 240px;
	padding-top: 20px;

	.nxshell-profile-xterm-container {
		width: 100%;
		height: 220px;
	}
}
</style>
