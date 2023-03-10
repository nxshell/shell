<template>
	<div class="pt-vnc-view">
		<div class="n-editor-toolbar">
			<div class="n-editor-toolbar__nav">
				<div class="nav-wrapper">
					<i class="el-icon-folder-opened nx-edit-file-open" />
					<span class="editor_url">{{ currentPath }}</span>
				</div>
			</div>
			<div class="n-editor-toolbar__actions">
				<el-select v-model="editorTheme" placeholder="请选择主题" @change="themeChange">
					<el-option v-for="(theme, index) in themes" :label="theme.name" :value="index" :key="index" />
				</el-select>
				<el-input
					v-model="searchKeyWords"
					:placeholder="$t('home.editor.search-tab')"
					clearable
					class="nx-search-input"
					suffix-icon="el-icon-search"
					@keydown.enter.native="searchDown"
				/>
			</div>
		</div>
		<div ref="editor" class="screen" :style="{ 'font-size': fontSize + 'px' }"></div>
	</div>
</template>

<script>
import { mapState } from 'vuex'

import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { Compartment, EditorSelection, SelectionRange } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { highlightSelectionMatches, SearchCursor } from '@codemirror/search'

import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { java } from '@codemirror/lang-java'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { php } from '@codemirror/lang-php'
import { python } from '@codemirror/lang-python'
import { xml } from '@codemirror/lang-xml'
import themes from './themes'

export default {
	name: 'PtEditorView',
	components: {},
	props: {
		mode: {
			type: String,
			default: 'full'
		},
		sessionId: {
			type: Number
		}
	},

	data() {
		return {
			editorValue: '',
			oldValue: '',
			currentPath: '',
			searchKeyWords: '',
			fontSize: 16,
			zoom: 0,
			editorTheme: 0,
			editor_view: null,
			themes,
			themeConfig: new Compartment()
		}
	},

	computed: {
		...mapState(['theme', 'editorChange'])
	},
	watch: {
		searchKeyWords(newVal) {
			if (newVal === '') {
				this.clearSearch()
			} else {
				this.doSearchInit()
			}
		},
		theme(n, o) {
			const theme = n === 'dark' ? 1 : n === 'light' ? 0 : 6
			this.themeChange(theme)
		},
		'editor_view.state.doc'(n, o) {
			this.$store.dispatch('updateEditorStatus', n.toString() !== this.oldValue)
		}
	},

	created() {
		this.$nextTick(() => {
			this.editorTheme = this.theme === 'dark' ? 1 : this.theme === 'light' ? 0 : 6
			this.init()
		})
	},

	methods: {
		async init() {
			if (this.sessionInstance) {
				return
			}

			let sessionInstance = this.$sessionManager.getSessionInstanceById(this.sessionId)
			this.currentPath = sessionInstance?.remote_path ?? ''
			sessionInstance.on('close', () => {
				try {
					this.$el.parentNode.removeChild(this.$el)
					this.$destroy()
				} catch (e) {
					console.log('sftp editor instance remove error', e)
				}
			})
			await sessionInstance.init()
			const editorValue = await sessionInstance.readFileContent()
			this.editorValue = new TextDecoder().decode(editorValue)

			sessionInstance.registerCloseCallback(() => {
				this.save()
			})

			this.sessionInstance = sessionInstance
			const lineWrapping = new Compartment()
			const ctrl_s_key = [
				{
					key: 'Ctrl-s',
					run: this.save
				},
				{
					key: 'Alt--',
					run: this.zoom_in
				},
				{
					key: 'Alt-=',
					run: this.zoom_out
				},
				{
					key: 'Alt-0',
					run: this.zoom_over
				}
			]
			const extensions = [
				keymap.of([...defaultKeymap, ...historyKeymap, ...ctrl_s_key, indentWithTab]),
				lineNumbers(),
				history(),
				highlightSelectionMatches(),
				lineWrapping.of(EditorView.lineWrapping),
				this.getSupportLangMode(sessionInstance.ext_name),
				this.themeConfig.of([themes[this.editorTheme]])
			]
			this.editor_view = new EditorView({
				doc: this.editorValue,
				extensions: extensions,
				parent: this.$refs.editor
			})
			this.oldValue = this.editor_view.state.doc.toString()
		},
		async save() {
			this.editorValue = this.editor_view.state.doc.toString()
			if (this.editorValue !== this.oldValue) {
				await this.sessionInstance.writeFileContent(this.editorValue)
				await this.sessionInstance.saveToRemote()
				this.oldValue = this.editorValue
			}
		},
		zoom_in() {
			this.zoom -= 1
			this._zoom()
			return true
		},
		zoom_out() {
			this.zoom += 1
			this._zoom()
			return true
		},
		zoom_over() {
			this.zoom = 0
			this._zoom()
			return true
		},
		_zoom() {
			const scale = Math.pow(1.1, this.zoom)
			this.fontSize = 16 * scale
		},
		getSupportLangMode(type) {
			switch (type) {
				case '.js':
					return javascript()
				case '.css':
					return css()
				case '.cc':
					return cpp()
				case '.html':
					return html()
				case '.java':
					return java()
				case '.json':
					return json()
				case '.md':
					return markdown()
				case '.php':
					return php()
				case '.py':
					return python()
				case '.xml':
					return xml()
				default:
					return javascript()
			}
		},
		clearSearch() {
			this.searchKeyWords = ''
			this.search_cursor = null
		},
		doSearchInit() {
			this.search_cursor = new SearchCursor(this.editor_view.state.doc, this.searchKeyWords)
		},
		searchDown() {
			if (!this.search_cursor) {
				return
			}
			let curr = this.search_cursor.next()
			if (curr.done) {
				return
			}
			this.editor_view.dispatch({
				selection: EditorSelection.create([new SelectionRange(curr.value.from, curr.value.to)]),
				scrollIntoView: true
			})
		},
		themeChange(theme) {
			this.editor_view.dispatch({
				effects: this.themeConfig.reconfigure([themes[theme]])
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.pt-vnc-view {
	height: 100%;
	width: 100%;
	background-color: var(--n-bg-color-base);

	.n-editor-toolbar {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 40px;
		padding: 0 5px;

		&__nav {
			flex: 1 0 0;

			.nav-wrapper {
				display: flex;
				justify-content: flex-start;
				align-items: center;

				& > *:not(:last-child) {
					margin-right: 5px;
				}

				.nx-edit-file-open {
					font-size: 18px;
					color: var(--n-text-color-base);
					transition: color 0.2s;
				}

				.editor_url {
					color: var(--n-text-color-base);
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
					max-width: calc(100% - 20px);
				}
			}
		}

		&__actions {
			flex: 1 0 0;
			display: flex;
			justify-content: flex-end;
			align-items: center;

			& > *:not(:first-child) {
				margin-left: 5px;
			}
		}
	}

	.screen {
		width: 100%;
		height: calc(100% - 40px);
		overflow: auto;

		.cm-editor {
			height: 100%;
			overflow: auto;
		}
	}
}
</style>
