<template>
	<div class="pt-file-view-address" :class="{editable: isEditable}">
		<span class="btn-scroll left" :class="{disabled:canScrollToLeft}" @click.stop="scrollToLeft">
			<i class="el-icon-caret-left" />
		</span>
		<div class="container" ref="container" @mousewheel="handleMouseWheel" @click="handleEnableEditPath">
			<ul class="address-list" ref="address" @click.stop>
				<li class="address-list-item host" @click="handleEnableEditPath">
					<pt-icon size="custom" :customSize="16" type="img" :iconName="IconHost"></pt-icon>
					<span style="margin-left: 5px">{{ hostInfo.username }}@{{ hostInfo.host }}</span>
				</li>
				<template v-if="!isEditable">
					<li v-for="(entry, idx) in parsedPath" :key="entry.entry + '/' + idx" class="address-list-item">
						<span @click="handleChangePath(idx)">{{ entry.entry }}</span>
						<pt-popper position="bottom-left" :show="entry.showMenu">
							<pt-menu
								:menu="entry.subFolderList"
								@pop-stack="entry.showMenu = false"
								ref="menu"
							></pt-menu>
							<pt-icon
								slot="reference"
								v-if="!entry.showMenu"
								size="custom"
								:customSize="12"
								iconName="arrow-right"
								className="pop-menu"
								@click.stop="showFolderList(entry, idx)"
							></pt-icon>
							<pt-icon
								slot="reference"
								v-else
								size="custom"
								:customSize="12"
								iconName="arrow-down"
								className="pop-menu"
								@click.stop="showFolderList(entry, idx)"
							></pt-icon>
						</pt-popper>
					</li>
				</template>
			</ul>
			<input
				v-if="isEditable"
				ref="pathEditor"
				spellcheck="false"
				class="address-input"
				autocomplete="off"
				v-model="curPath"
				@blur="handleDisableEditPath"
				@keydown="handleInputPath"
			/>
		</div>

		<span class="btn-scroll right" :class="{disabled:canScrollToRight}" @click.stop="scrollToRight">
			<i class="el-icon-caret-right" />
		</span>
	</div>
</template>

<script>
import path from 'path'
import PtPopper from '../../../components/base/popper'
import IconHost from '../../../assets/sysicons/host.png'

export default {
	name: 'PtFileViewAddress',
	components: {
		PtPopper
	},
	props: {
		hostInfo: {
			type: Object
		},

		checkPath: {
			type: Function
		},

		value: String,

		getFolderList: Function
	},
	data() {
		return {
			IconHost,

			isEditable: false,

			btnScroll: {
				show: false,
				containerWidth: 0,
				contentWidth: 0,
				scrollLeft: 0
			},

			showMenu: false,

			detectSizeHandler: null,

			curPath: '',
			parsedPath: []
		}
	},

	computed: {
		canScrollToLeft() {
			return this.btnScroll.scrollLeft == 0
		},

		canScrollToRight() {
			return this.btnScroll.scrollLeft >= this.btnScroll.contentWidth - this.btnScroll.containerWidth
		}
	},

	watch: {
		value(newVal) {
			this.parsePath()
			this.$nextTick(() => {
				this.detectAddressListWidth()
			})
			if (newVal != this.curPath) {
				this.curPath = newVal
			}
		}
	},

	created() {
		this.curPath = this.value
	},

	mounted() {
		this.parsePath()

		this.detectSizeHandler = (element) => {
			this.btnScroll.containerWidth = element.offsetWidth
		}

		this.$nextTick(() => {
			this.$ptElementResizeDetector.listenTo(this.$el, this.detectSizeHandler)
			this.detectAddressListWidth()
		})
	},

	methods: {
		parsePath() {
			let pathSegments = this.value.split('/')
			pathSegments.unshift('/')
			this.parsedPath = pathSegments
				.filter((p) => p)
				.map((entryName) => {
					return {
						entry: entryName,
						showMenu: false,
						subFolderList: []
					}
				})
		},
		async showFolderList(entry, idx) {
			const pathSegments = this.parsedPath.slice(1, idx + 1)
			let dirPath = pathSegments
				.map((seg) => {
					return seg.entry
				})
				.join('/')

			dirPath = path.resolve(`/${ dirPath }`, '..')
			const folderList = await this.getFolderList(dirPath)
			entry.subFolderList = folderList.map((folder) => {
				return {
					type: 'normal',
					label: folder,
					handler: () => {
						this.$emit('change', path.resolve(dirPath, folder))
					}
				}
			})

			entry.showMenu = true
			this.$nextTick(() => {
				console.log('showMenu', entry.showMenu)
			})
		},
		detectAddressListWidth() {
			this.btnScroll.contentWidth = this.$refs.address.getBoundingClientRect().width
		},

		scrollToLeft() {
			let curLeft = this.$refs.container.scrollLeft
			curLeft -= 100
			this.$refs.container.scrollTo(curLeft, 0)
			this.btnScroll.scrollLeft = this.$refs.container.scrollLeft
		},
		scrollToRight() {
			let curLeft = this.$refs.container.scrollLeft
			curLeft += 100
			this.$refs.container.scrollTo(curLeft, 0)
			this.btnScroll.scrollLeft = this.$refs.container.scrollLeft
		},

		handleMouseWheel(evt) {
			if (evt.deltaY < 0) {
				this.scrollToLeft()
			} else {
				this.scrollToRight()
			}
		},

		handleChangePath(idx) {
			const pathSegments = this.parsedPath.slice(1, idx + 1)
			const path = pathSegments
				.map((seg) => {
					return seg.entry
				})
				.join('/')

			this.$emit('change', `/${ path }`)
		},

		handleEnableEditPath() {
			this.isEditable = true

			this.$nextTick(() => {
				this.$refs.pathEditor.focus()
				this.$refs.pathEditor.selectionStart = 0
				this.$refs.pathEditor.selectionLength = this.curPath.length
			})
		},

		handleDisableEditPath() {
			this.isEditable = false
		},

		async handleInputPath(evt) {
			if (evt.key === 'Enter') {
				let ret = await this.checkPath(this.curPath)
				if (ret) {
					this.$emit('change', this.curPath)
					this.handleDisableEditPath()
				}
			}
		}
	},

	beforeDestroy() {
		this.$ptElementResizeDetector.removeListener(this.$el, this.detectSizeHandler)
	}
}
</script>

<style lang="scss">
.pt-file-view-address {
	position: relative;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	box-sizing: border-box;
	height: 30px;
	width: 100%;
	border-radius: 3px;

	border: 1px solid var(--borderColor);
	background-color: var(--n-bg-color-light);

	color: var(--n-text-color-base);
	overflow: hidden;

	.container {
		position: relative;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		box-sizing: border-box;
		height: 30px;
		width: 100%;
		overflow: hidden;
	}

	&.editable {
		border: 1px solid var(--n-border-color);
	}

	.btn-scroll {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		cursor: pointer;
		z-index: 999;
		background-color: var(--n-bg-color-light);

		&:hover:not(.disabled) {
			background-color: var(--n-hover-bg-color);
		}

		i {
			font-size: 18px;

			&:hover {
				color: var(--n-text-color-base);
				transition: color 0.2s;
			}
		}

		&.disabled {
			i {
				color: #B8B8B8;
			}
		}
	}

	.address-list {
		display: inline-flex;
		justify-content: flex-start;
		align-items: center;
		margin: 0;
		list-style: none;
		height: 28px;

		.address-list-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			list-style: none;
			padding: {
				left: 5px;
			}
			box-sizing: border-box;
			border: 1px solid transparent;

			height: 30px;
			line-height: 30px;
			max-width: 120px;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			cursor: pointer;

			&:hover {
				background-color: var(--n-hover-bg-color);
			}

			&.host {
				max-width: 200px;
			}

			.pop-menu {
				&:hover {
					color: var(--n-text-color-base);
				}
			}
		}
	}

	.address-input {
		border: none;
		outline: none;
		height: 26px;
		line-height: 26px;
		// width: calc(100% - 112px);
		width: 100%;
		color: var(--n-text-color-base);
		background-color: var(--n-bg-color-base);
		flex-grow: 0;
	}
}
</style>
