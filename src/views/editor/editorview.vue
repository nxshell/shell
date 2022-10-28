<template xmlns="" xmlns="">
	<div class="pt-vnc-view">
		<pt-toolbar :centerStyle="{
            overflow: 'hidden',
            marginLeft: '10px',
            marginRight: '10px'
        }">
			<template slot="left">
				<i class="el-icon-folder-opened nx-edit-file-open" />
			</template>
			<div class="editor_url" slot="center">
				{{ currentPath }}
			</div>
			<template slot="right">
				<el-input
					v-model="searchKeyWords"
					:placeholder="T('home.editor.search-tab')"
					class="nx-search-input"
					suffix-icon="el-icon-search"
					@keydown.enter.native="searchDown" />
			</template>
		</pt-toolbar>
		<div ref="editor" class="screen" :style="{ 'font-size': fontSize + 'px','height': 'calc(100vh - 100px)' }"></div>
	</div>
</template>

<script>
import { mapState } from "vuex";

import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view"
import { EditorSelection, SelectionRange } from "@codemirror/state"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { highlightSelectionMatches, SearchCursor } from "@codemirror/search"
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language"

import { javascript } from "@codemirror/lang-javascript"
import { css } from "@codemirror/lang-css"
import { cpp } from "@codemirror/lang-cpp"
import { html } from "@codemirror/lang-html"
import { java } from "@codemirror/lang-java"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { php } from "@codemirror/lang-php"
import { python } from "@codemirror/lang-python"
import { xml } from "@codemirror/lang-xml"

import { oneDarkTheme } from "@codemirror/theme-one-dark"

export default {
	name: "PtEditorView",
	components: {},
	props: {
		mode: {
			type: String,
			default: "full"
		},
		sessionId: {
			type: Number
		}
	},

	data() {
		return {
			editorValue: "",
			oldVlaue: "",
			currentPath: "",
			searchKeyWords: "",
			fontSize: 16,
			zoom: 0
		};
	},

	computed: {
		...mapState(["theme"]),
	},
	watch: {
		searchKeyWords(newVal) {
			if (newVal === "") {
				this.clearSearch();
			} else {
				this.doSearchInit();
			}
		}
	},

	created() {
		this.init();
	},

	methods: {
		async init() {
			if (this.sessionInstance) {
				return;
			}

			let sessionInstance = this.$sessionManager.getSessionInstanceById(this.sessionId);
			this.currentPath = sessionInstance?.remote_path ?? '';
			sessionInstance.on('close', () => {
				// destroy vnc instance
				try {
					this.$destroy();
					this.$el.parentNode.removeChild(this.$el);
				} catch (e) {
					console.log('sftp editor instance remove error', e);
				}
			});
			await sessionInstance.init();
			const editorValue = await sessionInstance.readFileContent();
			this.editorValue = new TextDecoder().decode(editorValue);

			sessionInstance.registerCloseCallback(() => {
				this.save();
			})

			this.sessionInstance = sessionInstance;
			const ctrl_s_key = [{
				key: "Ctrl-s",
				run: this.save
			}, {
				key: "Alt--",
				run: this.zoom_in
			}, {
				key: "Alt-=",
				run: this.zoom_out
			}, {
				key: "Alt-0",
				run: this.zoom_over
			}]
			let extensions = [
				keymap.of([...defaultKeymap, ...historyKeymap, ...ctrl_s_key]),
				lineNumbers(),
				syntaxHighlighting(defaultHighlightStyle),
				history(),
				highlightActiveLine(),
				highlightSelectionMatches(),
				this.getSupportLangMode(sessionInstance.ext_name)
			];
			// if (this.theme === "dark") {
			// 	extensions.push(oneDarkTheme)
			// }
			extensions.push(oneDarkTheme)

			this.editor_view = new EditorView({
				doc: this.editorValue,
				extensions: extensions,
				parent: this.$refs.editor
			})
			this.oldVlaue = this.editor_view.state.doc.toString();
		},
		async save() {
			this.editorValue = this.editor_view.state.doc.toString();
			if (this.editorValue !== this.oldVlaue) {
				await this.sessionInstance.writeFileContent(this.editorValue);
				await this.sessionInstance.saveToRemote();
				this.oldVlaue = this.editorValue;
			}
		},
		zoom_in() {
			this.zoom -= 1;
			this._zoom();
			return true;
		},
		zoom_out() {
			this.zoom += 1;
			this._zoom();
			return true;
		},
		zoom_over() {
			this.zoom = 0;
			this._zoom();
			return true;
		},
		_zoom() {
			const scale = Math.pow(1.1, this.zoom);
			this.fontSize = 16 * scale;
		},
		getSupportLangMode(type) {
			switch (type) {
				case '.js':
					return javascript();
				case '.css':
					return css();
				case '.cc':
					return cpp();
				case '.html':
					return html()
				case '.java':
					return java();
				case '.json':
					return json();
				case '.md':
					return markdown();
				case '.php':
					return php();
				case '.py':
					return python();
				case '.xml':
					return xml();
				default:
					return javascript()

			}
		},
		clearSearch() {
			this.searchKeyWords = "";
			this.search_cursor = null;
		},
		doSearchInit() {
			this.search_cursor = new SearchCursor(this.editor_view.state.doc, this.searchKeyWords);
		},
		searchDown() {
			if (!this.search_cursor) {
				return;
			}
			let curr = this.search_cursor.next();
			if (curr.done) {
				return;
			}
			this.editor_view.dispatch({
				selection: EditorSelection.create([
					new SelectionRange(curr.value.from, curr.value.to)
				]),
				scrollIntoView: true
			})
		}
	},

	async beforeDestroy() {

	}
}
</script>

<style lang="scss" scoped>
.pt-vnc-view {
	height: 100%;
	width: 100%;
	background-color: var(--n-bg-color-base);

	::v-deep .el-input__inner {
		border: 1px solid var(--borderColor) !important;
	}

	.nx-edit-file-open {
		font-size: 18px;
		color: var(--n-text-color-base);
		transition: color .2s;
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

	.editor_url {
		color: var(--n-text-color-base);
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		max-width: 60%;
	}
}
</style>