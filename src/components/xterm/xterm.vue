<template>
	<div class="pt-xterm" @dragover.prevent @drop="handleFileDrop">
		<div class="xterm-search" v-if="searchShow">
			<div class="search-input">
				<el-input
					ref="searchInputRef"
					v-model="searchWord"
					:placeholder="T('components.pt-xterm.search-placeholder')"
					slot="center"
					@keydown.enter.native="searchDown"
				/>
			</div>
			<div class="search-icons">
				<n-icon
					name="direction-up"
					slot="right"
					:title="T('components.pt-xterm.search-up')"
					@click="searchUp"
				/>
				<n-icon
					name="direction-down"
					slot="right"
					:title="T('components.pt-xterm.search-down')"
					@click="searchDown"
				/>
				<n-icon
					n="close"
					slot="right"
					:title="T('components.pt-xterm.search-close')"
					@click="searchClose"
				/>
			</div>
		</div>
		<div class="keyboard-input" v-show="sendToAllTerm">
			<div>{{ T('components.pt-xterm.keyboard-input-note') }}</div>

			<div class="switch-btn" v-if="showOn" @click="keyboardInputAllow(false)">
				{{ T('components.pt-xterm.keyboard-input-off') }}
			</div>
			<div class="switch-btn" v-else @click="keyboardInputAllow(true)">
				{{ T('components.pt-xterm.keyboard-input-on') }}
			</div>
		</div>
		<div ref="xtermContainer" class="xterm-container"></div>
		<div
			v-if="urlTip"
			class="xterm-link-tip"
			:style="{left: urlTipPosition.left + 'px', top: urlTipPosition.top + 'px'}"
		>
			{{ T('components.pt-xterm.open-url') }}
		</div>
	</div>
</template>

<script>
import mousetrap from 'mousetrap'
import debounce from 'lodash/debounce'
import '../../../node_modules/xterm/css/xterm.css'
import {Terminal} from 'xterm'
import {WebLinksAddon} from 'xterm-addon-web-links'
import {FitAddon} from 'xterm-addon-fit'
import {WebglAddon} from 'xterm-addon-webgl'
import {SearchAddon} from 'xterm-addon-search'

export default {
	name: 'PtXterm',
	props: {
		options: {
			type: Object,
			default: {}
		},
		sendToAllTerm: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			showOn: false,
			terminal: null,
			fitAddon: null,
			nativeResizeHandler: null,
			ptViewResizeHandler: null,
			urlTip: '',
			urlTipPosition: {
				left: 0,
				top: 0
			},

			logging: false,
			searchWord: '',
			searchShow: false,
			zoom: 0
		}
	},

	watch: {
		sendToAllTerm(newVal) {
			if (!newVal) {
				this.showOn = false
			}
		}
	},

	created() {
		this.$on('data', (data) => {
			this.onDataHandler(data)
		})
		this.$on('focus', () => {
			this.onFocus()
		})
	},

	mounted() {
		const resizeHandler = debounce(() => {
			this.onResizeHandler()
		}, 0)
		this.nativeResizeHandler = () => {
			resizeHandler()
		}

		this.$nextTick(() => {
			this.$ptElementResizeDetector.listenTo(this.$el, this.nativeResizeHandler)
			//this.resizeObserve.observe(this.$el);
			const options = {wordSeparator: ' /:?,;.', ...this.options}
			this.terminal = new Terminal(options)
			this.terminal.loadAddon(
				new WebLinksAddon(
					(event, uri) => {
						if (!event.ctrlKey) {
							return
						}
						this.$emit('link', uri)
					},
					{
						tooltipCallback: (evt, uri, location) => {
							const {actualCellWidth, actualCellHeight} = this.terminal._core._renderService.dimensions

							// show tip
							this.urlTip = uri
							this.urlTipPosition.left = location.start.x * actualCellWidth
							let top = location.start.y * actualCellHeight - 30
							if (top < 0) {
								top = location.start.y * actualCellHeight + 30
							}
							this.urlTipPosition.top = top
						},
						leaveCallback: () => {
							// hide tip
							this.urlTip = ''
						},
						willLinkActivate(evt, uri) {
							return evt.ctrlKey
						}
					}
				)
			)
			const fitAddon = new FitAddon()
			this.terminal.loadAddon(fitAddon)

			this.terminal.open(this.$refs.xtermContainer)
			fitAddon.fit()
			this.fitAddon = fitAddon

			const webgl = new WebglAddon()
			try {
				webgl.onContextLoss((e) => webgl.dispose())
				this.terminal.loadAddon(webgl)
			} catch (e) {
				console.log('WebGL init fail, it will fallback to canvas', e)
			}

			this.searchAddon = new SearchAddon()
			this.terminal.loadAddon(this.searchAddon)

			this.terminal.onKey((e) => {
				this.$emit('key', e)
			})

			this.terminal.onData((data) => {
				this.$emit('termdata', data)
			})

			this.terminal.onResize(({cols, rows}) => {
				this.$emit('resize', cols, rows)
			})

			this.terminal.onTitleChange((title) => {
				this.$emit('titleChange', title)
			})

			this.terminal.onLineFeed((e) => {
				if (this.logging) {
					this.$emit('line-data', this.getLineString())
				}
			})
			this.terminal.attachCustomKeyEventHandler((ev) => {
				if (ev.altKey) {
					// emit shortcut to process in home page
					const {key, type} = ev
					if (type !== 'keydown') {
						return false
					}
					if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
						// trigger to global process
						mousetrap.trigger(`alt+${key}`)
					} else {
						this.$emit('shortcut', `alt+${key}`)
					}
					return false
				} else {
					return true
				}
			})

			// first notify current terminal size
			this.$emit('resize', this.terminal.cols, this.terminal.rows)
			this.onFocus()
		})
	},

	methods: {
		// TODO:
		write(text) {
			if (!this.terminal) {
				return
			}

			this.terminal.write(text)
			text = null
		},

		getLineString() {
			const terminal = this.terminal
			let lineIndex = 0
			if (terminal.buffer.active.cursorY < this.terminal.rows - 1) {
				// clear to first line
				lineIndex = terminal.buffer.active.cursorY - 1
			} else {
				lineIndex = terminal.buffer.active.length - 2
			}

			let lineString = ''
			let lineWrapsToNext
			do {
				const nextLine = terminal.buffer.active.getLine(lineIndex + 1)
				lineWrapsToNext = nextLine ? nextLine.isWrapped : false
				const line = terminal.buffer.active.getLine(lineIndex)
				if (!line) {
					break
				}
				lineString += line.translateToString(!lineWrapsToNext).substring(0, terminal.cols)
				lineIndex++
			} while (lineWrapsToNext)
			return lineString
		},

		openLog() {
			this.logging = true
		},

		closeLog() {
			this.logging = false
		},

		onDataHandler(data) {
			this.write(data)
		},

		onResizeHandler() {
			if (!this.fitAddon) {
				return
			}
			this.fitAddon.fit()
			// this.terminal.refresh();
		},

		onFocus() {
			if (!this.terminal) {
				return
			}

			this.terminal.focus()
		},
		_zoom() {
			const scale = Math.pow(1.1, this.zoom)
			this.terminal.options.fontSize = this.options.fontSize * scale
			this.onResizeHandler()
		},

		zoom_in() {
			this.zoom -= 1
			this._zoom()
		},

		zoom_out() {
			this.zoom += 1
			this._zoom()
		},

		zoom_over() {
			this.zoom = 0
			this._zoom()
		},

		getSelection() {
			if (!this.terminal.hasSelection()) {
				return null
			}
			return this.terminal.getSelection()
		},

		pasteText(s) {
			this.terminal.paste(s)
			this.onFocus()
		},

		currentSize() {
			this.$emit('resize', this.terminal.cols, this.terminal.rows)
		},

		setTheme(theme = {}) {
			this.terminal?.setOption('theme', theme)
		},

		setOption(name, value) {
			this.terminal?.setOption(name, value)
		},

		getOption(name) {
			return this.terminal?.getOption(name)
		},

		focus() {
			setTimeout(() => {
				this.terminal?.focus()
			}, 100)
		},

		fit() {
			this.fitAddon?.fit()
		},

		handleFileDrop(evt) {
			evt.preventDefault()
			if (evt.dataTransfer.items.length === 0) {
				return
			}

			const files = []
			for (let i = 0; i < evt.dataTransfer.items.length; i++) {
				let item = evt.dataTransfer.items[i]
				let entry = item.webkitGetAsEntry()
				let file = evt.dataTransfer.files[i]

				if (entry.isDirectory) {
					files.push({
						path: file.path,
						isDir: true
					})
				} else {
					files.push({
						path: file.path,
						isDir: false
					})
				}
			}

			this.$emit('file-drop', files)
		},

		searchUp() {
			if (this.searchWord && this.searchAddon) {
				this.searchAddon.findPrevious(this.searchWord)
			}
		},
		searchDown() {
			if (this.searchWord && this.searchAddon) {
				this.searchAddon.findNext(this.searchWord)
			}
		},
		searchClose() {
			this.searchShow = false
		},
		searchOpen(s) {
			if (this.searchShow) {
				this.searchClose()
				return
			}
			this.searchWord = s
			this.searchShow = true
			setTimeout(() => {
				this.$refs.searchInputRef?.focus()
			}, 100)
		},
		keyboardInputAllow(allow) {
			this.showOn = !!allow
			this.$emit('sendToAll', this.showOn)
		},
		selectAll() {
			this.terminal.selectAll()
		}
	},

	beforeDestroy() {
		this.terminal?.dispose()
		this.terminal = null
		if (this.nativeResizeHandler) {
			// window.removeEventListener("resize", this.nativeResizeHandler);
			this.$ptElementResizeDetector.removeListener(this.$el, this.nativeResizeHandler)
			//this.resizeObserve.unobserve(this.$el);
			this.nativeResizeHandler = null
			//this.resizeObserve = null;
		}
		// if (this.ptViewResizeHandler) {
		//     window.removeEventListener("pt-view-resize", this.ptViewResizeHandler);
		//     this.ptViewResizeHandler = null;
		// }
	}
}
</script>

<style lang="scss">
.pt-xterm {
	position: relative;
	width: 100%;
	height: 100%;
	padding: 5px;
	box-sizing: border-box;

	.xterm-container {
		width: 100%;
		height: 100%;

		::-webkit-scrollbar-thumb {
			width: 4px;
			border-radius: 4px;
			background: rgba(144, 147, 153, 0.3);
			transition: 0.3s background-color;
		}

		.xterm {
			height: 100%;

			.xterm-viewport {
				right: -8px !important;
			}
		}
	}

	.xterm-link-tip {
		position: absolute;
		height: 30px;
		line-height: 30px;
		z-index: 999;

		border-radius: 3px;
		font-size: 14px;
		padding: 0 10px;
		background-color: lightgray;
	}

	.xterm-search {
		position: absolute;
		height: 40px;
		width: 95%;
		opacity: 0.9;
		z-index: 999;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		.search-input {
			flex-grow: 1;
		}

		.search-icons {
			flex-shrink: 0;
			display: flex;
			justify-content: flex-end;
		}
	}

	.keyboard-input {
		position: absolute;
		background-color: goldenrod;
		padding-left: 5px;
		padding-right: 5px;
		width: 95%;
		height: 30px;
		z-index: 998;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		.switch-btn {
			border: 1px solid var(--n-text-color-base);
			color: var(--n-text-color-base);
			background-color: var(--n-bg-color-base);
		}
	}
}
</style>
