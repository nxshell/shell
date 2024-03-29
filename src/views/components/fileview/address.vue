<template>
    <div class="pt-file-view-address" :class="{editable: isEditable}">
		<span class="btn-scroll left" :class="{disabled: canScrollToLeft}" @click.stop="scrollToLeft">
			<i class="el-icon-caret-left" />
		</span>
        <div class="container" ref="container" @mousewheel="handleMouseWheel" @click="handleEnableEditPath">
            <div ref="address" class="address-list" @click.stop>
                <div class="address-list-item host" @click="handleEnableEditPath">
                    <n-icon size="16" type="svg" name="host" />
                    <span>{{ hostInfo.username }}@{{ hostInfo.host }}</span>
                </div>
                <template v-if="!isEditable">
                    <div v-for="(entry, idx) in parsedPath" :key="entry.entry + '/' + idx" class="address-list-item">
                        <span @click="handleChangePath(idx)">{{ entry.entry }}</span>
                        <el-popover v-model="entry.showMenu" placement="bottom">
                            <div class="jump-box">
                                <el-scrollbar style="height: 100%">
                                    <pt-menu ref="menu" :menu="entry.subFolderList" :translate="false" @pop-stack="entry.showMenu = false" style="background-color: transparent" />
                                </el-scrollbar>
                            </div>
                            <n-icon
                                slot="reference"
                                :style="{'transform':`rotateZ(${entry.showMenu?90:0}deg)`,'transition': 'all 0.3s ease-in-out 0s'}"
                                size="12"
                                name="arrow-right"
                                @click.stop="showFolderList(entry, idx)"
                            />
                        </el-popover>
                    </div>
                </template>
            </div>
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

        <span class="btn-scroll right" :class="{disabled: canScrollToRight}" @click.stop="scrollToRight">
			<i class="el-icon-caret-right" />
		</span>
    </div>
</template>

<script>
import path from 'path'

export default {
    name: 'PtFileViewAddress',
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
            return this.btnScroll.scrollLeft === 0
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
            if (newVal !== this.curPath) {
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
            entry.showMenu = !!entry.showMenu
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
  width: 100%;
  height: 32px;
  border-radius: 4px;
  color: var(--n-text-color-base);
  background-color: var(--n-bg-color-light);
  overflow: hidden;

  .container {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
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
        color: #b8b8b8;
      }
    }
  }

  .address-list {
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
    height: 32px;

    .address-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 5px;
      box-sizing: border-box;
      height: 28px;
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

      & > :not(:last-child) {
        margin-right: 5px;
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

.jump-box {
  height: 300px;
  box-shadow: inset 0px 0px 10px var(--n-jump-box-shadow);
  background-color: var(--n-bg-color-base);
}
</style>
