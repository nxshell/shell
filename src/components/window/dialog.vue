<template>
    <pt-popper :show="show" :position="'center'" :zIndex="9999">
        <div class="pt-dialog-modal-mask"></div>
        <div class="pt-dialog" :class="{macos: ISMACOS}" :style="dlgMovement">
            <div class="pt-dialog-titlebar">
                <span v-if="ISMACOS" class="btn-mac-close" @click="handleCancel">
                    <span class="btn-close"></span>
                </span>
                <div class="title-text" :class="{macos: ISMACOS}" v-mouse-drag="getDragHandler()">
                    {{ title }}
                </div>
                <span v-if="!ISMACOS" class="btn-close-bg" @click="handleCancel">
                    <span class="btn-close"></span>
                </span>
            </div>
            <div class="pt-dialog-content">
                <slot></slot>
            </div>
            <div class="pt-dialog-footer">
                <slot name="footer">
                    <pt-button type="primary" size="small" @click="handleOk" focus>{{ T("components.OK") }}</pt-button>
                    <pt-button size="small" @click="handleCancel">{{ T("components.Cancel") }}</pt-button>
                </slot>
            </div>
        </div>
    </pt-popper>
</template>

<script>
import PtPopper from "../base/popper";

const ISMACOS = /macintosh/i.test(navigator.userAgent);

export default {
    name: "PtDialog",
    components: {
        PtPopper
    },
    props: {
        title: String,
        modal: {
            type: Boolean,
            default: false
        },
        show: Boolean
    },

    data() {
        return {
            ISMACOS,
            drag: {
                isDrag: false,
                movementX: 0,
                movementY: 0 
            }
        };
    },

    computed: {
        dlgMovement() {
            return {
                transform: `translate3D(${this.drag.movementX}px, ${this.drag.movementY}px, 0)`
            };
        }
    },

    mounted() {
    },

    methods: {
        handleClose() {
            this.$emit("update:show", false);
        },

        getDragHandler() {
            return {
                dragStart: () => {
                    this.drag.isDrag = true;
                },
                dragMove: ({x, y, movementX, movementY}) => {
                    if (!this.drag.isDrag) {
                        return;
                    }
                    this.drag.movementX += movementX;
                    this.drag.movementY += movementY;
                },
                dragEnd: () => {
                    this.drag.isDrag = false;
                }
            }
        },

        handleOk() {
            this.handleClose();
            this.$emit("ok");
        },

        handleCancel() {
            this.handleClose();
            this.$emit("cancel");
        }
    }
}
</script>

<style lang="scss">
.pt-dialog-modal-mask {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.pt-dialog {
    position: relative;
    box-sizing: content-box;
    z-index: 1;

    background-color: var(--backgroundColor);
    border: 1px solid var(--borderColor);
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.4);

    &.macos {
        border-radius: 10px;
        overflow: hidden;
    }

    .pt-dialog-titlebar {
        position: relative;
        display: flex;

        height: 30px;
        line-height: 30px;

        background-color: var(--windowTitleBarColor);

        .btn-mac-close {
            display: inline-flex;
            width: 33px;
            height: 30px;
            justify-content: center;
            align-items: center;

            .btn-close {
                width: 13px;
                height: 13px;
                border-radius: 50%;
                background-color: #F44336;
                border: 1px solid #d65b59;
            }
        }

        .title-text {
            display: inline-block;
            color: var(--primaryTextColor);
            padding-left: 15px;
            font-weight: bold;
            flex-grow: 1;
            user-select: none;
            &.macos {
                padding-left: 0;
            }
        }

        .btn-close-bg {
            display: inline-block;
            width: 33px;
            height: 30px;
            &:hover {
                background-color: #e81123;
            }

            .btn-close {
                display: inline-block;
                width: 33px;
                height: 30px;
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                background-color: var(--primaryTextColor);
                &:hover {
                    background-color: white;
                }
            }
        }
    }

    .pt-dialog-content {
        margin: 15px;
        color: var(--primaryTextColor);
    }

    .pt-dialog-footer {
        text-align: right;
        padding: 15px;

        .pt-button {
            margin-right: 10px;
        }
    }

}
</style>
