<template xmlns=''>
	<div class='pt-file-view'>
		<pt-toolbar :centerStyle="{ overflow: 'hidden', marginLeft: '10px', marginRight: '10px' }">
			<template slot='left'>
				<n-space :size='5'>
					<el-tooltip class='item' effect='dark' :content="$t('home.fileview.mainview.go-back')"
						placement='right-end'>
						<el-button type='text' icon='el-icon-back' :disabled='!canGoBack' @click='goBack' />
					</el-tooltip>
					<el-tooltip class='item' effect='dark' :content="$t('home.fileview.mainview.go-forward')"
						placement='right-end'>
						<el-button type='text' icon='el-icon-right' :disabled='!canForward' @click='forward' />
					</el-tooltip>
					<el-tooltip class='item' effect='dark' :content="$t('home.fileview.mainview.go-up')"
						placement='right-end'>
						<el-button type='text' icon='el-icon-top' :disabled='!canGoUp' @click='goUp' />
					</el-tooltip>
					<el-tooltip class='item' effect='dark' :content="$t('home.fileview.mainview.go-refresh')"
						placement='right-end'>
						<el-button type='text' icon='el-icon-refresh' :disabled='!refresh' @click='refresh' />
					</el-tooltip>
				</n-space>
			</template>
			<pt-file-view-address slot='center' v-model='currentPath' :hostInfo='hostInfo'
				:getFolderList='getFolderList' :checkPath='checkPath' @change='goTo($event)'></pt-file-view-address>
			<template slot='right'>
				<el-input v-model='searchKeyWords' :placeholder="$t('home.fileview.mainview.search-tab')" clearable
					class='nx-search-input' suffix-icon='el-icon-search' />
			</template>
		</pt-toolbar>
		<pt-grid-view :mode='layout' :columns='columns' :data='fileList' @open='handleOpen($event)' @refresh='refresh'
			@delete='handleDelete($event)' @go-back='goBack()' @change='handleFileSelectedChange'
			@contextmenu='handleFileItemContextMenu($event)' @file-drop='handleFileDrop' @file-sort='handleFileSort'
			v-context-menu='handleGetContextMenu' />
		<file-status-bar :file-total='fileList.length' :selected-length='selectedItems.length'
			:progress-desc='currentProgressStatus.description' :show-progress='currentProgressStatus.show'
			:progress='currentProgressStatus.progress' :speed='currentProgressStatus.speed' />
		<!-- 查看文件属性弹窗 -->
		<el-dialog :title="$t('home.fileview.prop-dialog.file-props')" width='40%' :visible.sync='filePropDialog.show'>
			<div class='file-prop-dialog'>
				<el-scrollbar style='height: 100%'>
					<el-descriptions :column='1' size='large' :colon='false' style='padding: 10px 30px'
						:labelStyle="{ width: '150px' }" :contentStyle="{ height: '32px', 'line-height': '32px' }">
						<el-descriptions-item :span='10'>
							<template slot='label'>
								<n-icon size='28' :name='filePropDialog.dirent.fileicon' />
							</template>
							{{ filePropDialog.dirent.filename }}
						</el-descriptions-item>
						<el-descriptions-item :label="$t('home.fileview.prop-dialog.type')" :span='10'>
							{{ filePropDialog.dirent.type }}
						</el-descriptions-item>
						<el-descriptions-item :label="$t('home.fileview.prop-dialog.location')" :span='10'>
							{{ filePropDialog.dirent.location }}
						</el-descriptions-item>
						<el-descriptions-item :label="$t('home.fileview.prop-dialog.size')" :span='10'>
							{{ filePropDialog.dirent.size | fileSize }}
						</el-descriptions-item>
						<el-descriptions-item :label="$t('home.fileview.prop-dialog.modify-time')" :span='10'>
							{{ filePropDialog.dirent.mtime }}
						</el-descriptions-item>
						<el-descriptions-item :label="$t('home.fileview.prop-dialog.user')" :span='10'>
							{{ filePropDialog.dirent.user }}
						</el-descriptions-item>
						<el-descriptions-item :label="$t('home.fileview.prop-dialog.group')" :span='10'>
							{{ filePropDialog.dirent.group }}
						</el-descriptions-item>
						<el-descriptions-item :label="$t('home.fileview.prop-dialog.perms')" :span='10'>
							{{ filePropDialog.dirent.perms }}
						</el-descriptions-item>
					</el-descriptions>
				</el-scrollbar>
			</div>
			<div slot='footer' class='dialog-footer'>
				<el-button @click='handleCloseFilePropDialog'>{{ $t('components.Cancel') }}</el-button>
				<el-button type='primary' @click='handleCloseFilePropDialog'>{{ $t('components.OK') }}</el-button>
			</div>
		</el-dialog>
		<!-- 创建文件夹弹窗 -->
		<el-dialog :title="$t('home.fileview.createdir-dialog.title')" :visible.sync='dirCreateDialog.show'
			:close-on-click-modal='false' width='450px'>
			<n-space vertical :item-style="{ width: '100%' }">
				<el-input v-model='dirCreateDialog.dirname'
					:placeholder="$t('home.fileview.createdir-dialog.placeholder')" />
				<el-alert v-if='!isValidNewDirName' :title="$t('home.fileview.createdir-dialog.invalid-dir-name')"
					:closable='false' type='warning' show-icon />
			</n-space>
			<div slot='footer' class='dialog-footer'>
				<el-button @click='handleCreateDirCancel'>{{ $t('components.Cancel') }}</el-button>
				<el-button type='primary' @click='handleCreateDirConfirm'>{{ $t('components.OK') }}</el-button>
			</div>
		</el-dialog>
		<!-- 重命名弹窗 -->
		<el-dialog :title="$t('home.fileview.rename-dialog.title')" :visible.sync='renameDialog.show'
			:close-on-click-modal='false' width='400px'>
			<n-space vertical :item-style="{ width: '100%' }">
				<el-input v-model='renameDialog.dirname'
					:placeholder="$t('home.fileview.rename-dialog.placeholder')"></el-input>
				<el-alert v-if='!isValidRenameDirName' :title="$t('home.fileview.rename-dialog.invalid-name')"
					:closable='false' type='warning' show-icon />
			</n-space>

			<div slot='footer' class='dialog-footer'>
				<el-button @click='handleRenameCancel'>{{ $t('components.Cancel') }}</el-button>
				<el-button type='primary' @click='handleRenameConfirm'>{{ $t('components.OK') }}</el-button>
			</div>
		</el-dialog>
		<!-- 文件权限修改弹窗 -->
		<el-dialog :title="$t('home.fileview.chmod-dialog.title')" :visible.sync='chmodDialog.show'
			:close-on-click-modal='false' width='400px'>
			<n-space vertical :item-style="{ width: '100%' }">
				<el-input v-model='chmodDialog.permissions'
					:placeholder="$t('home.fileview.chmod-dialog.placeholder')"></el-input>
				<el-alert v-if='!isValidPermissions' :title="$t('home.fileview.chmod-dialog.invalid-permissions')"
					:closable='false' type='warning' show-icon />
			</n-space>

			<div slot='footer' class='dialog-footer'>
				<el-button @click='handleCloseChmodDialog'>{{ $t('components.Cancel') }}</el-button>
				<el-button type='primary' @click='handleChmodConfirm'>{{ $t('components.OK') }}</el-button>
			</div>
		</el-dialog>
		<!-- 文件移动弹窗 -->
		<el-dialog :title="$t('home.fileview.move-dialog.title')" :visible.sync='moveDialog.show'
			:close-on-click-modal='false' width='400px'>
			<div style='width: 100%'>
				<el-select v-model='moveDialog.dirname' placeholder='请选择'>
					<el-option v-for='(opt, idx) in moveDialog.dirnameList' :key='idx' :label='opt' :value='opt' />
				</el-select>
			</div>
			<div slot='footer' class='dialog-footer'>
				<el-button @click='handleCloseMoveDialog'>{{ $t('components.Cancel') }}</el-button>
				<el-button type='primary' @click='handleMoveConfirm'>{{ $t('components.OK') }}</el-button>
			</div>
		</el-dialog>
		<el-dialog :title='askDialog.title' :visible.sync='askDialog.show' :close-on-click-modal='false'>
			<!-- 合并目录 -->
			<template v-if="askDialog.questionType === 'merge'">
				<el-descriptions :title="$t('home.fileview.ask-dialogs.merge.message', [askDialog.args.name])"
					:colon='false' :column='2'>
					<el-descriptions-item>
						<template slot='label'>
							<n-icon size='32' :name='askDialog.icon' />
						</template>
						<div class='n-description'>
							<n-space vertical>
								<p>{{ $t('home.fileview.ask-dialogs.merge.dir-info-name', [askDialog.args.name]) }}</p>
								<p>
									{{
			$t(
				'home.fileview.ask-dialogs.merge.dir-info-lastmodify',
				askDialog.args.src.lastModify
			)
		}}
								</p>
							</n-space>
						</div>
					</el-descriptions-item>
					<el-descriptions-item>
						<template slot='label'>
							<n-icon size='32' :name='askDialog.icon' />
						</template>
						<div class='n-description'>
							<n-space vertical>
								<p>{{ $t('home.fileview.ask-dialogs.merge.dir-info-name', [askDialog.args.name]) }}</p>
								<p>
									{{
			$t(
				'home.fileview.ask-dialogs.merge.dir-info-lastmodify',
				askDialog.args.src.lastModify
			)
		}}
								</p>
							</n-space>
						</div>
					</el-descriptions-item>
					<el-descriptions-item labelStyle='margin-right: 0;'>
						<el-checkbox v-model='askDialog.keep'>
							{{ $t('home.fileview.ask-dialogs.merge.keep') }}
						</el-checkbox>
					</el-descriptions-item>
				</el-descriptions>
			</template>
			<!-- 覆盖文件 -->
			<template v-if="askDialog.questionType === 'overwrite'">
				<el-descriptions :title="$t('home.fileview.ask-dialogs.overwrite.message', [askDialog.args.name])"
					:colon='false' :column='2'>
					<el-descriptions-item>
						<template slot='label'>
							<n-icon size='32' :name='askDialog.icon' />
						</template>
						<div class='n-description'>
							<n-space vertical>
								<p>
									{{
			$t('home.fileview.ask-dialogs.overwrite.file-info-name', [askDialog.args.name])
		}}
								</p>
								<p>
									{{
				$t('home.fileview.ask-dialogs.overwrite.file-info-size', [
					askDialog.args.src.size
				])
			}}
								</p>
								<p>
									{{
				$t(
					'home.fileview.ask-dialogs.overwrite.file-info-lastmodify',
					askDialog.args.src.lastModify
				)
			}}
								</p>
							</n-space>
						</div>
					</el-descriptions-item>
					<el-descriptions-item>
						<template slot='label'>
							<n-icon size='32' :name='askDialog.icon' />
						</template>
						<div class='n-description'>
							<n-space vertical>
								<p>
									{{
			$t('home.fileview.ask-dialogs.overwrite.file-info-name', [askDialog.args.name])
		}}
								</p>
								<p>
									{{
				$t(
					'home.fileview.ask-dialogs.overwrite.file-info-size',
					askDialog.args.dest.size
				)
			}}
								</p>
								<p>
									{{
				$t(
					'home.fileview.ask-dialogs.overwrite.file-info-lastmodify',
					askDialog.args.dest.lastModify
				)
			}}
								</p>
							</n-space>
						</div>
					</el-descriptions-item>
					<el-descriptions-item labelStyle='margin-right: 0;'>
						<el-checkbox v-model='askDialog.keep'>
							{{ $t('home.fileview.ask-dialogs.overwrite.keep') }}
						</el-checkbox>
					</el-descriptions-item>
				</el-descriptions>
			</template>
			<template #footer>
				<el-button v-if="askDialog.questionType === 'merge'" type='primary' @click='handleMergeFolder'>
					{{ $t('home.fileview.ask-dialogs.common-buttons.btn-merge') }}
				</el-button>
				<el-button v-if="askDialog.questionType === 'overwrite'" type='danger' @click='handleOverwrite'>
					{{ $t('home.fileview.ask-dialogs.common-buttons.btn-overwrite') }}
				</el-button>
				<el-button type='warning' @click='handleSkip'>
					{{ $t('home.fileview.ask-dialogs.common-buttons.btn-skip') }}
				</el-button>
				<el-button @click='handleTransCancel'>
					{{ $t('home.fileview.ask-dialogs.common-buttons.btn-cancel') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import path from 'path'
import PtFileViewAddress from './address'
import { getFolderIcon, getFileIcon, getIcon } from '@/icons/system-icon'
import { Dirent } from '../../../../common/filesystem/dirent'
import { createDataTransfer } from '@/services/nxsys/dataTransfer'
import FileStatusBar from '@/views/components/fileview/components/file-status-bar'

function sort(dirent1, dirent2) {
	return dirent1.name > dirent2.name
}

function formatFileSize(size, detail = false) {
	const K = 1024
	const M = K * 1024
	const G = M * 1024
	const T = G * 1024

	let v = size
	let unit = 'B'
	if (size > T) {
		v = Math.round(size / T)
		unit = 'TB'
	} else if (size > G) {
		v = Math.round(size / G)
		unit = 'GB'
	} else if (size > M) {
		v = Math.round(size / M)
		unit = 'MB'
	} else if (size > K) {
		v = Math.round(size / K)
		unit = 'KB'
	}
	if (detail) {
		return `${v}${unit} (${size} Bytes)`
	} else {
		return `${v}${unit}`
	}
}

export default {
	name: 'PtFileView',
	components: {
		FileStatusBar,
		PtFileViewAddress
	},
	props: {
		cwd: {
			type: String,
			default: '/'
		},

		getFs: {
			type: Function
		},

		hostInfo: {
			type: Object
		},
		viewMode: {
			type: String,
			default: 'detail'
		}
	},
	data() {
		return {
			layout: 'detail',
			columns: [
				{
					dataKey: 'name',
					label: 'home.fileview.mainview.columns.name',
					width: 120
				},
				{
					dataKey: 'size',
					label: 'home.fileview.mainview.columns.size',
					width: 60
				},
				{
					dataKey: 'type',
					label: 'home.fileview.mainview.columns.type',
					width: 120
				},
				{
					dataKey: 'user',
					label: 'home.fileview.mainview.columns.user',
					width: 80
				},
				{
					dataKey: 'group',
					label: 'home.fileview.mainview.columns.group',
					width: 80
				},
				{
					dataKey: 'lastModify',
					label: 'home.fileview.mainview.columns.lastModify',
					width: 200
				},
				{
					dataKey: 'perms',
					label: 'home.fileview.mainview.columns.perms',
					width: 120
				}
			],

			history: {
				stack: [],
				current: -1
			},

			fileItems: [],
			selectedItems: [],
			sortBy: false,
			// currentPath: "/home/wang/desktop/apps/nxshell/sftp/127.0.0.1/root"
			checkPath: (path) => true,

			searchKeyWords: '',
			searchResult: [],

			filePropDialog: {
				show: false,
				dirent: {}
			},
			dirCreateDialog: {
				show: false,
				dirname: ''
			},

			renameDialog: {
				show: false,
				originName: '',
				dirname: ''
			},

			chmodDialog: {
				show: false,
				originName: '',
				permissions: ''
			},

			moveDialog: {
				show: false,
				originName: '',
				dirname: '',
				dirnameList: []
			},

			askDialog: {
				title: '',
				show: false,
				questionType: '',
				keep: false,
				args: null,
				icon: '',
				transfer: null,
				lastOpeType: '',
				fileIndex: 0,
			},
			currUploadFileNum: 0,

			progressStatus: {
				timer: null,
				currentProgress: 0,
				progress: []
			},

			contextMenu: {
				fileItemIdx: -1,
				menus: {
					dir: [
						{
							label: 'home.fileview.context-menu.download-folder',
							type: 'normal',
							handler: this.handleContextMenu_DownloadFolder
						},
						{
							label: 'home.fileview.context-menu.open',
							type: 'normal',
							handler: this.handleContextMenu_Open
						},
						{
							type: 'separator'
						},
						{
							label: 'home.fileview.context-menu.delete',
							type: 'normal',
							handler: this.handleContextMenu_Delete
						},
						{
							label: 'home.fileview.context-menu.rename',
							type: 'normal',
							handler: this.handleContextMenu_Rename
						},
						{
							label: 'home.fileview.context-menu.chmod',
							type: 'normal',
							handler: this.handleContextMenu_Chmod
						},
						{
							type: 'separator'
						},
						{
							label: 'home.fileview.context-menu.prop',
							type: 'normal',
							handler: this.handleContextMenu_Prop
						}
					],
					file: [
						{
							label: 'home.fileview.context-menu.download-file',
							type: 'normal',
							handler: this.handleContextMenu_DownloadFile
						},
						{
							type: 'separator'
						},
						{
							label: 'home.fileview.context-menu.delete',
							type: 'normal',
							handler: this.handleContextMenu_Delete
						},
						{
							label: 'home.fileview.context-menu.move',
							type: 'normal',
							handler: this.handleContextMenu_Move
						},
						{
							label: 'home.fileview.context-menu.rename',
							type: 'normal',
							handler: this.handleContextMenu_Rename
						},
						{
							label: 'home.fileview.context-menu.chmod',
							type: 'normal',
							handler: this.handleContextMenu_Chmod
						},
						{
							type: 'separator'
						},
						{
							label: 'home.fileview.context-menu.prop',
							type: 'normal',
							handler: this.handleContextMenu_Prop
						}
					],
					blank: [
						{
							label: 'home.fileview.context-menu.upload-file',
							type: 'normal',
							handler: this.handleContextMenu_UploadFile
						},
						{
							label: 'home.fileview.context-menu.upload-folder',
							type: 'normal',
							handler: this.handleContextMenu_UploadFolder
						},
						{
							type: 'separator'
						},
						{
							label: 'home.fileview.context-menu.createdir',
							type: 'normal',
							handler: this.handleContextMenu_CreateDir
						},
						/* {
							label: "home.fileview.context-menu.createfile",
							type: "normal"
						}, */ {
							type: 'separator'
						},
						{
							label: 'home.fileview.context-menu.viewtype',
							type: 'submenu',
							submenu: [
								{
									label: 'home.fileview.context-menu.viewtype-detail',
									type: 'normal',
									handler: this.handleContextMenu_ChangeViewDetailIcon
								},
								{
									label: 'home.fileview.context-menu.viewtype-medium-icon',
									type: 'normal',
									handler: this.handleContextMenu_ChangeViewMediumIcon
								}
							]
						},
						{
							type: 'separator'
						},
						{
							label: 'home.fileview.context-menu.prop',
							type: 'normal',
							handler: this.handleContextMenu_Prop
						}
					]
				}
			}
		}
	},

	watch: {
		cwd(newCWD, oldCWD) {
			if (newCWD !== this.currentPath) {
				this.goTo(newCWD)
			}
		},
		searchKeyWords(newVal) {
			if (newVal === '') {
				this.clearSearch()
			} else {
				this.doSearch()
			}
		}
	},

	computed: {
		canGoBack() {
			return this.history.current > 0
		},
		canForward() {
			return this.history.current < this.history.stack.length - 1
		},
		canGoUp() {
			return this.currentPath !== '/'
		},

		currentPath() {
			return this.history.stack[this.history.current] || '/'
		},

		isValidNewDirName() {
			const reg = new RegExp('[\\\\/:*?"<>|]')
			return !reg.test(this.dirCreateDialog.dirname)
		},

		isValidRenameDirName() {
			const reg = new RegExp('[\\\\/:*?"<>|]')
			return !reg.test(this.renameDialog.dirname)
		},

		isValidPermissions() {
			const reg = /^[0-7]{3}$/
			return reg.test(this.chmodDialog.permissions)
		},

		currentProgressStatus() {
			if (this.progressStatus.progress.length === 0) {
				return {
					show: false,
					description: '',
					progress: 0,
					speed: ''
				}
			}

			const curProgress = this.progressStatus.progress[this.progressStatus.currentProgress]

			return {
				show: true,
				description: curProgress.description,
				progress: curProgress.progress,
				speed: curProgress.speed
			}
		},

		fileList() {
			if (this.searchKeyWords) {
				return this.searchResult
			} else {
				return this.fileItems
			}
		}
	},

	created() {
		this.layout = this.viewMode
	},

	mounted() {
		this.$nextTick(async () => {
			let cwd = this.cwd || '~'
			// replace space
			cwd = cwd.replace(/\s*/g, '')
			// get realpath
			if (cwd.startsWith('~')) {
				try {
					const fsInstance = await this.getFs()
					let dir = await fsInstance.realpath('.')
					dir = dir.split('~')[0]

					// flat to realpath
					cwd = cwd.replace(/~/, dir)
					cwd = cwd.replace(/\/\//g, '/')
				} catch (e) {
					//do nothing
					cwd = '/'
				}
			}
			this.goTo(cwd)
		})

		this.checkPath = async (entryPath) => {
			const fsInstance = await this.getFs()
			try {
				const stat = await fsInstance.lstat(entryPath)
			} catch (e) {
				if (e.message === 'No such file') {
					this.$confirm(
						this.$t('home.fileview.confirm-dialogs.errors.path-not-exist', [entryPath]),
						this.$t('home.fileview.confirm-dialogs.errors.title'),
						{
							type: 'error'
						}
					)
				}
				return false
			}
			return true
		}

		this.progressStatus.timer = setInterval(() => {
			if (this.progressStatus.currentProgress < this.progressStatus.progress.length - 1) {
				this.progressStatus.currentProgress++
			} else {
				this.progressStatus.currentProgress = 0
			}
		}, 5000)
	},

	beforeDestroy() {
		if (this.progressStatus.timer != null) {
			clearInterval(this.progressStatus.timer)
			this.progressStatus.timer = null
		}
	},

	methods: {
		formatProgress() {
			return `${this.currentProgressStatus.progress} ${this.currentProgressStatus.speed}%`
		},
		getDirEntryType(dirent) {
			const types = {
				directory: this.$t('home.fileview.prop-dialog.directory'),
				file: this.$t('home.fileview.prop-dialog.file'),
				socket: this.$t('home.fileview.prop-dialog.socket'),
				symbolLink: this.$t('home.fileview.prop-dialog.symbol-link'),
				blockDevice: this.$t('home.fileview.prop-dialog.block-dev'),
				charDevice: this.$t('home.fileview.prop-dialog.char-dev'),
				fifo: this.$t('home.fileview.prop-dialog.fifo')
			}

			if (dirent.isDirectory()) {
				return types.directory
			} else if (dirent.isFile()) {
				return types.file
			} else if (dirent.isSocket()) {
				return types.socket
			} else if (dirent.isSymbolicLink()) {
				return types.symbolLink
			} else if (dirent.isBlockDevice()) {
				return types.blockDevice
			} else if (dirent.isCharacterDevice()) {
				return types.charDevice
			} else if (dirent.isFIFO()) {
				return types.fifo
			}
		},
		async readdir(dirPath) {
			let dirents
			try {
				const fsInstance = await this.getFs()
				dirents = await fsInstance.readdir(dirPath)
			} catch (err) {
				this.$confirm(
					this.$t('home.fileview.confirm-dialogs.errors.error-message', [err.message]),
					this.$t('home.fileview.confirm-dialogs.errors.title'),
					{
						type: 'error'
					}
				)
				return false
			}

			// for move directory list
			this.moveDialog.dirnameList = ['..']

			const dirList = dirents.filter((dirent) => {
				if (dirent.isDirectory()) {
					this.moveDialog.dirnameList.push(dirent.name)
					return dirent
				}
			})
			dirList.sort(sort)

			const fileList = dirents.filter((dirent) => {
				if (!dirent.isDirectory()) {
					return dirent
				}
			})
			fileList.sort(sort)

			let List = [...dirList, ...fileList]
			this.fileItems = List.map((dirent) => {
				const { icon, type } = this.getIconAndType(dirent)
				return {
					name: dirent.name,
					icon: icon,
					iconType: 'svg',
					size: dirent.isDirectory() ? '' : formatFileSize(dirent.getSize()),
					sizeByte: dirent.getSize(),
					type: type,
					user: dirent.getUid(),
					group: dirent.getGid(),
					lastModify: this.$t('home.fileview.mainview.columns.fmt-time', [
						this.$d(dirent.getMTime(), 'long')
					]),
					perms: dirent.getPermsString(),
					dirent
				}
			})

			return true
		},

		getIconAndType(dirent) {
			const type = dirent.isFile() ? 'file' : dirent.isDirectory() ? 'folder' : dirent.isSymbolicLink() ? 'link' : 'unknown'
			const typeLabel = {
				'file': 'home.fileview.mainview.file-types.file',
				'folder': 'home.fileview.mainview.file-types.dir',
				'link': 'home.fileview.mainview.file-types.file',
				'unknown': 'home.fileview.mainview.file-types.file'
			}[type]
			return {
				icon: getIcon(dirent.name, type),
				type: this.$t(typeLabel)
			}
		},

		async readLink(filePath) {
			let realPath
			try {
				const fsInstance = await this.getFs()
				realPath = await fsInstance.readlink(filePath)
				realPath = path.resolve(this.currentPath, realPath)
				let stat = await fsInstance.lstat(realPath)
				let dirent = new Dirent(realPath, stat)
				return dirent
			} catch (err) {
			}
			return false
		},

		doSearch() {
			let searchReg = new RegExp(this.searchKeyWords, 'i')
			this.searchResult = this.fileItems.filter((dirent) => {
				if (searchReg.test(dirent.name)) {
					return dirent
				}
			})
		},

		clearSearch() {
			this.searchKeyWords = ''
			this.searchResult = []
		},

		async getconn() {
			const fsInstance = await this.getFs()
			const connid = await fsInstance.getconn()
			return connid
		},

		async getFolderList(dirPath) {
			const fsInstance = await this.getFs()
			const dirents = await fsInstance.readdir(dirPath)

			const dirList = dirents.filter((dirent) => {
				if (dirent.isDirectory()) {
					return dirent
				}
			})
			dirList.sort(sort)
			return dirList.map((dirent) => dirent.name)
		},

		goBack() {
			if (!this.canGoBack) {
				return
			}

			if (this.history.current > 0) {
				this.history.current--
			}
			this.clearSearch()
			this.refresh()
		},

		forward() {
			if (this.history.current < this.history.stack.length - 1) {
				this.history.current++
			}
			this.clearSearch()
			this.refresh()
		},

		goUp() {
			const upPath = path.resolve(this.currentPath, '..')
			this.clearSearch()
			this.goTo(upPath)
		},

		async refresh() {
			await this.readdir(this.currentPath)
		},
		async goTo(dirPath) {
			let success = await this.readdir(dirPath)
			if (!success) {
				return
			}
			if (this.history.stack.length - 1 > this.history.current) {
				this.history.stack = this.history.stack.slice(0, this.history.current + 1)
			}
			this.history.stack.push(dirPath)
			this.history.current++
		},

		async replace(destPath) {
			await this.readdir(destPath)
			this.$set(this.history.stack, this.history.current, destPath)
		},

		createProgress(progressDescription) {
			const progress = {
				id: Date.now(),
				description: progressDescription,
				progress: 0,
				speed: ''
			}

			this.progressStatus.progress.push(progress)
			return progress.id
		},

		updateProgress(progressId, value, progressDescription, speed = '') {
			const progress = this.progressStatus.progress.find((p) => {
				if (p.id === progressId) {
					return p
				}
			})
			if (progress) {
				// for best user experience, the value must no 0
				progress.progress = value || 1
				progress.speed = speed
				if (progressDescription) {
					progress.description = progressDescription
				}
			}
		},

		progressFinished(progressId) {
			const idx = this.progressStatus.progress.findIndex((p) => {
				return p.id === progressId
			})

			if (idx == -1) {
				return
			}

			this.progressStatus.progress.splice(idx, 1)
			if (this.progressStatus.currentProgress > this.progressStatus.progress.length - 1) {
				this.progressStatus.currentProgress = 0
			}
		},

		showAskDialog(transfer, question, args) {
			if (question === 'merge') {
				this.askDialog.title = this.$t('home.fileview.ask-dialogs.merge.title')
				this.askDialog.icon = getFolderIcon(args.name)
			} else if (question === 'overwrite') {
				this.askDialog.title = this.$t('home.fileview.ask-dialogs.overwrite.title')
				this.askDialog.icon = getFileIcon(args.name)
			}
			this.askDialog.show = true
			this.askDialog.questionType = question
			this.askDialog.keep = false
			this.askDialog.args = args
			this.askDialog.transfer = transfer
		},

		closeAskDialog() {
			this.askDialog.title = ''
			this.askDialog.message = ''
			// this.askDialog.keep = false
			this.askDialog.args = {
				basename: '',
				dest: {},
				src: {}
			}
			this.askDialog.show = false
			this.askDialog.transfer = null
		},

		async handleMergeFolder() {
			await this.askDialog.transfer.answer('merge', this.askDialog.keep)
			this.closeAskDialog()
		},

		async handleOverwrite() {
			this.askDialog.lastOpeType = 'overwrite';
			await this.askDialog.transfer.answer('overwrite', this.askDialog.keep)
			this.closeAskDialog()
		},

		async handleSkip() {
			this.askDialog.lastOpeType = 'skip';
			await this.askDialog.transfer.answer('skip', this.askDialog.keep)
			this.closeAskDialog()
		},

		async handleTransCancel() {
			await this.askDialog.transfer.answer('cancel', this.askDialog.keep)
			this.closeAskDialog()
		},

		upload(filePath, type, progressId, createFolder = false) {
			return new Promise(async (resolve, reject) => {
				const transfer = await createDataTransfer()
				const connId = await this.getconn()
				transfer._setFrom({
					nodeUUID: '',
					path: filePath,
					type,
					createFolder
				})
				transfer._setTo({
					connId: connId,
					nodeUUID: this.hostInfo.uuid,
					path: this.currentPath,
					type: 'dir'
				})
				transfer.on('prepare', () => {
					this.updateProgress(progressId, 0, this.$t('home.fileview.mainview.progress.prepare-upload'))
				})

				transfer.on('ask', async ({ question, args }) => {
					this.askDialog.fileIndex++;
					if (this.askDialog.keep && this.askDialog.fileIndex != 1) {
						this.askDialog.args = args;
						this.askDialog.transfer = transfer;
						await this.askDialog.transfer.answer(this.askDialog.lastOpeType, this.askDialog.keep)
					}
					else {
						this.showAskDialog(transfer, question, args)
					}
					if (this.askDialog.fileIndex == this.currUploadFileNum) {
						this.askDialog.fileIndex = 0;
						this.askDialog.keep = false;
						// this.askDialog.transfer = null;
					}
				})

				transfer.on('transferring', (args) => {
					const { progress, remainder, totalFileCount, speed } = args
					this.updateProgress(
						progressId,
						progress,
						this.$t('home.fileview.mainview.progress.upload', [totalFileCount || 1, remainder || 1]),
						speed
					)
				})

				transfer.on('filecreated', () => {
					this.refresh()
				})

				transfer.on('finished', () => {
					resolve()
				})

				transfer.on('error', (err) => {
					reject(err)
				})
				transfer.startTransferring()
			})
		},

		download(fromPath, toPath, type, progressId, createFolder = false) {
			return new Promise(async (resolve, reject) => {
				const transfer = await createDataTransfer()
				const connId = await this.getconn()
				transfer._setFrom({
					connId: connId,
					nodeUUID: this.hostInfo.uuid,
					path: fromPath,
					type,
					createFolder
				})
				transfer._setTo({
					nodeUUID: '',
					path: toPath,
					type
				})
				transfer.on('prepare', () => {
					this.updateProgress(progressId, 0, this.$t('home.fileview.mainview.progress.prepare-download'))
				})

				transfer.on('ask', ({ question, args }) => {
					this.showAskDialog(transfer, question, args)
				})

				transfer.on('transferring', (args) => {
					const { progress, remainder, totalFileCount, speed } = args
					this.updateProgress(
						progressId,
						progress,
						this.$t('home.fileview.mainview.progress.download', [totalFileCount || 1, remainder || 1]),
						speed
					)
				})

				transfer.on('finished', () => {
					// this.progressFinished(progressId);
					resolve()
				})

				transfer.on('error', (err) => {
					// const message = err.message;
					// this.$confirm({
					//     title: this.$t("home.fileview.confirm-dialogs.errors.title"),
					//     message: this.$t("home.fileview.confirm-dialogs.errors.download-error", message),
					//     type: "error"
					// });
					// this.progressFinished(progressId);
					reject(err)
				})
				transfer.startTransferring()
			})
		},

		/**
		 * 事件处理
		 */

		handleFileItemContextMenu(idx) {
			if (idx === undefined) {
				this.contextMenu.fileItemIdx = -1
				return
			}
			this.contextMenu.fileItemIdx = idx
		},

		handleGetContextMenu() {
			if (this.contextMenu.fileItemIdx === -1) {
				return this.contextMenu.menus.blank
			}

			//const fileItem = this.fileItems[this.contextMenu.fileItemIdx];
			const fileItem = this.fileList[this.contextMenu.fileItemIdx]

			return fileItem.dirent.isDirectory() ? this.contextMenu.menus.dir : this.contextMenu.menus.file
		},

		handleContextMenu_Open() {
			this.handleOpen(this.contextMenu.fileItemIdx)
		},

		handleContextMenu_Delete() {
			this.handleDelete(this.contextMenu.fileItemIdx)
		},

		handleShowRenameDialog() {
			//const fileItem = this.fileItems[this.contextMenu.fileItemIdx];
			const fileItem = this.fileList[this.contextMenu.fileItemIdx]

			this.renameDialog.show = true
			this.renameDialog.dirname = fileItem.dirent.name
			this.renameDialog.originName = fileItem.dirent.name
		},

		handleCloseRenameDialog() {
			this.renameDialog.show = false
			this.renameDialog.dirname = ''
			this.renameDialog.originName = ''
		},

		async handleRenameConfirm() {
			if (!this.isValidRenameDirName || this.renameDialog.dirname === '') {
				return
			}

			const fullOriginPath = path.resolve(this.currentPath, this.renameDialog.originName)
			const fullNewNamePath = path.resolve(this.currentPath, this.renameDialog.dirname)

			const fsInstance = await this.getFs()
			try {
				await fsInstance.rename(fullOriginPath, fullNewNamePath)
				this.refresh()
				this.handleCloseRenameDialog()
			} catch (err) {
				this.$confirm(err.message, this.$t('home.sftp.err-dialog-title'), {
					type: 'error'
				})
			}
		},

		handleRenameCancel() {
			this.handleCloseRenameDialog()
		},

		handleContextMenu_Rename() {
			this.handleShowRenameDialog()
		},

		handleContextMenu_Chmod() {
			this.handleShowChmodDialog()
		},

		handleShowChmodDialog() {
			const fileItem = this.fileList[this.contextMenu.fileItemIdx]

			this.chmodDialog.show = true
			this.chmodDialog.dirname = fileItem.dirent.name
			this.chmodDialog.permissions = fileItem.dirent.getPermsHex()
		},

		handleCloseChmodDialog() {
			this.chmodDialog.show = false
			this.chmodDialog.dirname = ''
			this.chmodDialog.permissions = ''
		},

		async handleChmodConfirm() {
			if (!this.isValidPermissions || this.chmodDialog.dirname === '') {
				return
			}

			const fullNewNamePath = path.resolve(this.currentPath, this.chmodDialog.dirname)

			const fsInstance = await this.getFs()
			try {
				await fsInstance.chmod(fullNewNamePath, this.chmodDialog.permissions)
				this.refresh()
				this.handleCloseChmodDialog()
			} catch (err) {
				this.$confirm(err.message, this.$t('home.sftp.err-dialog-title'), {
					type: 'error'
				})
			}
		},

		handleShowMoveDialog() {
			const fileItem = this.fileList[this.contextMenu.fileItemIdx]

			this.moveDialog.show = true
			this.moveDialog.dirname = '..'
			this.moveDialog.originName = fileItem.dirent.name
		},

		handleCloseMoveDialog() {
			this.moveDialog.show = false
			this.moveDialog.dirname = ''
			this.moveDialog.originName = ''
		},

		async handleMoveConfirm() {
			if (this.moveDialog.dirname === '') {
				return
			}

			const fullOriginPath = path.resolve(this.currentPath, this.moveDialog.originName)
			const fullNewNamePath = path.resolve(this.currentPath, this.moveDialog.dirname, this.moveDialog.originName)

			const fsInstance = await this.getFs()
			try {
				await fsInstance.rename(fullOriginPath, fullNewNamePath)
				this.refresh()
				this.handleCloseMoveDialog()
			} catch (err) {
				this.$confirm(err.message, this.$t('home.sftp.err-dialog-title'), {
					type: 'error'
				})
			}
		},

		handleContextMenu_Move() {
			this.handleShowMoveDialog()
		},

		handleContextMenu_ChangeViewDetailIcon() {
			this.layout = 'detail'
		},

		handleContextMenu_ChangeViewMediumIcon() {
			this.layout = 'medium'
		},

		async handleContextMenu_Prop() {
			let dirent
			let location
			if (this.contextMenu.fileItemIdx === -1) {
				const fsInstance = await this.getFs()
				try {
					const stat = await fsInstance.lstat(this.currentPath)
					dirent = new Dirent(path.basename(this.currentPath) || '/', stat)
					location = path.dirname(this.currentPath)
				} catch (e) {
					console.log('handleContextMenu_Prop error ', e)
				}
			} else {
				//const fileItem = this.fileItems[this.contextMenu.fileItemIdx];
				const fileItem = this.fileList[this.contextMenu.fileItemIdx]
				dirent = fileItem.dirent
				location = this.currentPath
			}

			this.filePropDialog.dirent = {
				filename: dirent.name,
				fileicon: this.getIconAndType(dirent).icon,
				location,
				type: this.getDirEntryType(dirent),
				size: dirent.getSize(),
				mtime: this.$d(dirent.getMTime(), 'long'),
				user: dirent.getUid(),
				group: dirent.getGid(),
				perms: dirent.getPermsString()
			}
			this.filePropDialog.show = true
		},

		handleCloseFilePropDialog() {
			this.filePropDialog.show = false
			this.filePropDialog.dirent = {}
		},

		async handleContextMenu_UploadFile() {
			const coreService = powertools.getService('powertools-core')
			const selectedFiles = await coreService.showOpenDialog({
				title: this.$t('home.fileview.file-dialog.open-file'),
				properties: ['openFile']
			})

			if (selectedFiles.canceled) {
				return
			}

			const progressId = this.createProgress(this.$t('home.fileview.mainview.progress.prepare-upload'))
			try {
				await this.upload(selectedFiles.filePaths[0], 'file', progressId)
			} catch (err) {
				const message = err.message
				this.$confirm(
					this.$t('home.fileview.confirm-dialogs.errors.upload-error', [message]),
					this.$t('home.fileview.confirm-dialogs.errors.title'),
					{
						type: 'error'
					}
				)
			} finally {
				this.progressFinished(progressId)
				this.refresh()
			}
		},

		async handleContextMenu_UploadFolder() {
			const coreService = powertools.getService('powertools-core')
			const selectedFiles = await coreService.showOpenDialog({
				title: this.$t('home.fileview.file-dialog.open-folder'),
				properties: ['openDirectory']
			})

			if (selectedFiles.canceled) {
				return
			}

			const progressId = this.createProgress(this.$t('home.fileview.mainview.progress.prepare-upload'))

			try {
				await this.upload(selectedFiles.filePaths[0], 'dir', progressId)
			} catch (err) {
				const message = err.message
				this.$confirm(
					this.$t('home.fileview.confirm-dialogs.errors.upload-error', [message]),
					this.$t('home.fileview.confirm-dialogs.errors.title'),
					{
						type: 'error'
					}
				)
			} finally {
				this.progressFinished(progressId)
				this.refresh()
			}
		},

		async handleContextMenu_DownloadFile() {
			//const fileItem = this.fileItems[this.contextMenu.fileItemIdx];
			const fileItem = this.fileList[this.contextMenu.fileItemIdx]
			const filePath = path.resolve(this.currentPath, fileItem.dirent.name)

			const coreService = powertools.getService('powertools-core')
			const selectedFiles = await coreService.showSaveDialog({
				title: this.$t('home.fileview.file-dialog.save-file'),
				defaultPath: fileItem.dirent.name,
				properties: []
			})
			if (selectedFiles.canceled) {
				return
			}

			const progressId = this.createProgress(this.$t('home.fileview.mainview.progress.prepare-download'))

			try {
				await this.download(filePath, selectedFiles.filePath, 'file', progressId)
			} catch (err) {
				const message = err.message
				this.$confirm(
					this.$t('home.fileview.confirm-dialogs.errors.download-error', [message]),
					this.$t('home.fileview.confirm-dialogs.errors.title'),
					{
						type: 'error'
					}
				)
			} finally {
				this.progressFinished(progressId)
			}
		},

		async handleContextMenu_DownloadFolder() {
			//const fileItem = this.fileItems[this.contextMenu.fileItemIdx];
			const fileItem = this.fileList[this.contextMenu.fileItemIdx]
			const filePath = path.resolve(this.currentPath, fileItem.dirent.name)

			const coreService = powertools.getService('powertools-core')
			const selectedFiles = await coreService.showOpenDialog({
				title: this.$t('home.fileview.file-dialog.save-folder'),
				properties: ['openDirectory']
			})
			if (selectedFiles.canceled) {
				return
			}

			const progressId = this.createProgress(this.$t('home.fileview.mainview.progress.prepare-download'))

			try {
				await this.download(filePath, selectedFiles.filePaths[0], 'dir', progressId, true)
			} catch (err) {
				const message = err.message
				this.$confirm(
					this.$t('home.fileview.confirm-dialogs.errors.download-error', [message]),
					this.$t('home.fileview.confirm-dialogs.errors.title'),
					{
						type: 'error'
					}
				)
			} finally {
				this.progressFinished(progressId)
			}
		},

		handleContextMenu_CreateDir() {
			this.handleShowCreateDirDialog()
		},

		handleShowCreateDirDialog() {
			this.dirCreateDialog.show = true
			this.dirCreateDialog.dirname = ''
		},

		handleCloseCreateDirDialog() {
			this.dirCreateDialog.show = false
			this.dirCreateDialog.dirname = ''
		},

		async handleCreateDirConfirm() {
			if (!this.isValidNewDirName || this.dirCreateDialog.dirname === '') {
				return
			}

			const fullPath = path.resolve(this.currentPath, this.dirCreateDialog.dirname)
			const fsInstance = await this.getFs()

			try {
				await fsInstance.mkdir(fullPath)
				await this.refresh()
				this.handleCloseCreateDirDialog()
			} catch (e) {
				this.$confirm(e.message, this.$t('home.fileview.confirm-dialogs.errors.title'), {
					type: 'error'
				})
			}
		},

		handleCreateDirCancel() {
			this.handleCloseCreateDirDialog()
		},

		handlePaste() {
		},
		handleCut() {
		},
		handleCopy() {
		},

		async deleteFile(filePath) {
			try {
				await this.$confirm(
					this.$t('home.fileview.confirm-dialogs.delete-file.message', [filePath]),
					this.$t('home.fileview.confirm-dialogs.delete-file.title'),
					{
						type: 'warning'
					}
				)
			} catch (e) {
				console.log('cancel delete file ', e)
				return
			}

			try {
				const fsInstance = await this.getFs()
				await fsInstance.remove(filePath)
				this.refresh()
			} catch (e) {
				this.$confirm(e.message, this.$t('home.fileview.confirm-dialogs.errors.title'), {
					type: 'error'
				})
			}
		},

		async deleteDirectory(dirPath) {
			try {
				await this.$confirm(
					this.$t('home.fileview.confirm-dialogs.delete-dir.message', [dirPath]),
					this.$t('home.fileview.confirm-dialogs.delete-dir.title'),
					{
						type: 'warning'
					}
				)
			} catch (e) {
				console.log('cancel delete directory ', e)
				return
			}

			const progressId = this.createProgress(this.$t('home.fileview.mainview.progress.delete'))
			try {
				const fsInstance = await this.getFs()
				/* 遍历目录时采用的深度优先遍历 */
				const allFiles = await fsInstance.walk(dirPath)
				const totalCount = allFiles.length
				for (let i = 0; i < totalCount; i++) {
					let file = allFiles[i]
					if (file.isDir) {
						await fsInstance.rmdir(file.entryPath)
					} else {
						await fsInstance.remove(file.entryPath)
					}
					const progress = Math.round((i / totalCount) * 100)
					this.updateProgress(
						progressId,
						progress,
						this.$t('home.fileview.mainview.progress.delete', i, [totalCount])
					)
				}
			} catch (e) {
				this.$confirm(e.message, this.$t('home.fileview.confirm-dialogs.errors.title'), {
					type: 'error'
				})
			} finally {
				this.progressFinished(progressId)
				this.refresh()
			}
		},

		async deleteFiles() {
			try {
				await this.$confirm(
					this.$t('home.fileview.confirm-dialogs.delete-many.message', [this.selectedItems.length]),
					this.$t('home.fileview.confirm-dialogs.delete-many.title'),
					{
						type: 'warning'
					}
				)
			} catch (e) {
				console.log('cancel delete files ', e)
				return
			}

			let progressId
			try {
				const fsInstance = await this.getFs()
				const selectedItems = this.selectedItems.map((itemIdx) => {
					//return this.fileItems[itemIdx];
					return this.fileList[itemIdx]
				})
				let allFiles = []
				for (let i = 0; i < selectedItems.length; i++) {
					let fileItem = selectedItems[i]
					const direntPath = path.resolve(this.currentPath, fileItem.dirent.name)
					if (fileItem.dirent.isDirectory()) {
						let subEntries = await fsInstance.walk(direntPath)
						allFiles = allFiles.concat(subEntries)
					} else {
						allFiles.push({
							isDir: false,
							entryPath: direntPath
						})
					}
				}

				const totalCount = allFiles.length
				progressId = this.createProgress(this.$t('home.fileview.mainview.progress.delete'))
				for (let i = 0; i < totalCount; i++) {
					let file = allFiles[i]
					if (file.isDir) {
						await fsInstance.rmdir(file.entryPath)
					} else {
						await fsInstance.remove(file.entryPath)
					}
					const progress = Math.round((i / totalCount) * 100)
					this.updateProgress(
						progressId,
						progress,
						this.$t('home.fileview.mainview.progress.delete', [i, totalCount])
					)
				}
			} catch (e) {
				this.$confirm(e.message, this.$t('home.fileview.confirm-dialogs.errors.title'), {
					type: 'error'
				})
			} finally {
				this.progressFinished(progressId)
				this.refresh()
			}
		},

		handleDelete(fileIdx) {
			if (this.selectedItems.length > 1) {
				this.deleteFiles()
				return
			}
			//const fileItem = this.fileItems[fileIdx];
			const fileItem = this.fileList[fileIdx]
			const direntPath = path.resolve(this.currentPath, fileItem.dirent.name)
			if (fileItem.dirent.isDirectory()) {
				this.deleteDirectory(direntPath)
			} else {
				this.deleteFile(direntPath)
			}
		},

		async handleOpen(idx) {
			//const fileItem = this.fileItems[idx].dirent;
			const fileItem = this.fileList[idx].dirent
			if (fileItem.isDirectory()) {
				const newPath = path.resolve(this.currentPath, fileItem.name)
				this.clearSearch()
				this.goTo(newPath)
			} else if (fileItem.isSymbolicLink()) {
				const newPath = path.resolve(this.currentPath, fileItem.name)
				let stat = await this.readLink(newPath)
				if (stat && stat.isDirectory()) {
					this.clearSearch()
					this.goTo(stat.name)
				}
			} else {
				// is file
				const size = fileItem.getSize()
				if (size > 1024 * 1024 * 3) {
					try {
						await this.$confirm(
							this.$t('home.fileview.confirm-dialogs.not-allow-open-file.message'),
							this.$t('home.fileview.confirm-dialogs.not-allow-open-file.title'),
							{
								type: 'info'
							}
						)
					} catch (e) {
					}
					return
				}
				const fs = await this.getFs()
				let cfg = {
					name: 'sftpEditor-' + fileItem.name,
					remote_path: path.resolve(this.currentPath, fileItem.name),
					ext_name: fileItem.name,
					sftp: fs
				}

				this.$sessionManager.createSfpEditorSessionInstance(cfg)
			}
		},

		handleFileSelectedChange(items) {
			this.selectedItems = items
		},

		async handleFileDrop(files) {
			this.currUploadFileNum = files.length;
			this.askDialog.fileIndex = 0;
			for (let i = 0; i < files.length; i++) {
				let progressId = this.createProgress(this.$t('home.fileview.mainview.progress.prepare-download'))
				let file = files[i]
				try {
					let type = file.isDir ? 'dir' : 'file'
					await this.upload(file.path, type, progressId, file.isDir)
					this.refresh()
				} catch (err) {
					const message = err.message
					await this.$confirm(
						this.$t('home.fileview.confirm-dialogs.errors.download-error', [message]),
						this.$t('home.fileview.confirm-dialogs.errors.title'),
						{
							type: 'error'
						}
					)
				} finally {
					this.progressFinished(progressId)
				}
			}
		},

		handleFileSort(key) {
			let that = this
			const sorts = {
				size: (a, b) => {
					let v = a['sizeByte'] - b['sizeByte']
					return that.sortBy ? v : -v
				},
				lastModify: (a, b) => {
					a = new Date(a['lastModify'])
					b = new Date(b['lastModify'])
					let v = a - b
					return that.sortBy ? v : -v
				},
				name: (a, b) => {
					let v = a[key].localeCompare(b[key])
					return that.sortBy ? v : -v
				},
				type: (a, b) => {
					let v = a[key].localeCompare(b[key])
					return that.sortBy ? v : -v
				}
			}
			let sort = sorts[key]
			if (sort) {
				this.fileItems = this.fileItems.sort(sort)
				this.sortBy = !this.sortBy
			}
		}
	},

	filters: {
		fileSize(size) {
			return formatFileSize(size, true)
		}
	}
}
</script>

<style lang='scss' scoped>
.pt-file-view {
	position: relative;
	width: 100%;
	height: 100%;

	.pt-grid-view {
		height: calc(100% - 72px);
	}

	.status-description {
		width: 260px;
		text-align: right;
	}

	::v-deep .el-input__inner {
		border: 1px solid var(--n-bg-color-base) !important;
	}
}

.file-prop-dialog {
	width: 100%;
	height: 400px;

	.info-block {
		padding: 20px 20px;

		.pt-row {
			margin-bottom: 10px;
		}
	}

	.file-base-info {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin-bottom: 10px;

		.pt-icon-wrapper {
			margin-right: 10px;
		}
	}
}

.create-dir-dialog {
	width: 300px;

	margin: {
		top: 30px;
		bottom: 40px;
	}

	.invalid-dir-name {
		margin-top: 15px;
		color: var(--dangerColor);
	}
}

.move-dir-dialog {
	margin: {
		top: 30px;
		bottom: 40px;
	}

	display: flex;
	justify-content: center;

	.move-dir-select {
		width: 300px;
	}
}

.ask-dialog {
	margin: {
		top: 30px;
		bottom: 40px;
	}

	.message {
		margin-bottom: 20px;
	}

	.file-summary {
		margin: {
			left: 20px;
			right: 20px;
			bottom: 20px;
		}
	}
}
</style>
