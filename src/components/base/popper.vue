<template>
    <div>
        <slot name="reference"/>
    </div>
</template>

<script>
import Vue from "vue";
import CONST from "./const";

const PopperContainer = Vue.extend({
    name: "PtPopperContainer",
    data() {
        return {
            renderNode: () => {},
            position: "bottom",
            parentRect: {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0
            },
            selfRect: {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0
            },
            zIndex: 0,
            offset: 0,
            visibility: false
        }
    },

    computed: {
        center() {
            const selfRect = this.selfRect;
            return {
                left: (window.innerWidth - selfRect.width) / 2,
                top: (window.innerHeight - selfRect.height) / 2
            };
        },
        cursor() {
            const selfRect = this.selfRect;
        },
        left() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.left - selfRect.width - this.offset,
                top: this.parentRect.top + (
                    ((this.parentRect.bottom - this.parentRect.top) - selfRect.height) / 2 )
            };
        },
        top() {
            const selfRect = this.selfRect;
            return {
                top: this.parentRect.top - self.height - this.offset,
                left: this.parentRect.left + (
                    ((this.parentRect.right - this.parentRect.left) - selfRect.width) / 2)
            };
        },

        right() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.right + this.offset,
                top: this.parentRect.top + (
                    ((this.parentRect.bottom - this.parentRect.top) - selfRect.height) / 2 )
            };
        },

        bottom() {
            const selfRect = this.selfRect;
            return {
                top: this.parentRect.bottom + this.offset,
                left: this.parentRect.left + (
                    ((this.parentRect.right - this.parentRect.left) - selfRect.width) / 2)
            };
        },

        "top-left"() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.left,
                top: this.parentRect.top - selfRect.height - this.offset
            };
        },

        "top-right"() {
            const selfRect = this.selfRect;
            return {
                top: this.parentRect.top - selfRect.height - this.offset,
                left: this.parentRect.right - selfRect.width
            }
        },

        "bottom-left"() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.left,
                top: this.parentRect.bottom + this.offset,
            }
        },
        "bottom-right"() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.right - selfRect.width,
                top: this.parentRect.bottom + this.offset
            }
        },

        "left-top"() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.left - selfRect.width - this.offset,
                top: this.parentRect.top
            }
        },

        "left-bottom"() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.left - selfRect.width - this.offset,
                bottom: this.parentRect.bottom - selfRect.height
            };
        },

        "right-top"() {
            return {
                left: this.parentRect.right + 10,
                top: this.parentRect.top
            };
        },

        "right-bottom"() {
            const selfRect = this.selfRect;
            return {
                left: this.parentRect.right,
                top: this.parentRect.bottom - selfRect.height
            };
        },

        showPosition() {
            // 期望的显示位置
            let expectPos = this[this.position];
            // 实际可以显示的位置
            let actPos = {...expectPos};

            const right = expectPos.left + this.selfRect.width;
            const bottom = expectPos.top + this.selfRect.height;
            if (actPos.left < 0) {
                actPos.left = this.right.left;
            } else if (right > window.innerWidth) {
                actPos.left = this.left.left;
            }
            if (actPos.top < CONST.WINDOW_TITLE_HEIGHT) {
                actPos.top = CONST.WINDOW_TITLE_HEIGHT;
            } else if (bottom > window.innerHeight) {
                actPos.top = window.innerHeight - this.selfRect.height;
            }

            return {
                left: actPos.left + "px",
                top: actPos.top + "px"
            };
        }
    },

    render(h) {
        return h("div", {
            class: {
                "pt-popper-container": true
            },
            style: {
                visibility: this.visibility ? "visible": "hidden",
                zIndex: this.zIndex,
                ...this.showPosition
            }
        }, [this.renderNode()])
    },

    beforeDestroy() {
        document.body.removeChild(this.$el);
    },

    mounted() {
        this.$nextTick(() => {
            this.getRect();
            this.visibility = true;
        });
    },

    methods: {
        getRect() {
            if (!this.$el) {
                return {left: 0, top: 0, right: 0, height: 0};
            }
            const rect = this.$el.getBoundingClientRect();
            this.selfRect = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
        }
    }
});

function showPopper(vnode, position, zIndex, offset, parentRect) {
    let popperInst = new PopperContainer({
        data: {
            renderNode: vnode,
            position,
            parentRect,
            zIndex,
            offset
        }
    });

    popperInst.$mount();
    document.body.appendChild(popperInst.$el);

    return popperInst;
}

export default {
    name: "PtPopper",
    props: {
        show: {
            type: Boolean,
            default: true
        },
        /**
         * 位置：
         * center: 屏幕居中，主要用于对话框
         * cursor: 按鼠标的XY位置，主要用于ContextMenu
         * 按方位居中
         * left: 左边
         * top: 上边
         * right: 右边
         * bottom: 下方
         * 主要用户菜单和下拉框
         * top-left: 左上
         * top-right: 右上
         * bottom-left: 左下
         * bottom-right: 右下
         */
        position: {
            type: String,
            default: "bottom"
        },
        /**
         * 偏移
         */
        offset: {
            type: Number,
            default: 0
        },

        zIndex: {
            type: Number,
            default: 0
        }
    },

    data() {
        return {
            container: null
        }
    },

    watch: {
        show(newVal) {
            if (newVal === true) {
                this.showPopper();
            } else {
                this.hidePopper();
            }
        }
    },

    mounted() {
        this.$nextTick(() => {
            if (this.show) {
                this.showPopper();
            }
        })
    },

    updated() {
        if (this.container && this.$scopedSlots.default) {
            this.container.renderNode = this.$scopedSlots.default;
        }
    },

    methods: {
        showPopper() {
            const rect = this.$el.getBoundingClientRect();
            this.container = showPopper(
                this.$scopedSlots.default,
                this.position,
                this.zIndex,
                this.offset,
                {
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom
                });
        },

        hidePopper() {
            if (this.container) {
                this.container.$destroy();
                this.container = null;
            }
        }
    },

    beforeDestroy() {
        this.hidePopper();
    }
}
</script>

<style lang="scss">
.pt-popper-container {
    position: absolute;
    left: 0;
    top: 0;
	border-radius: 4px;
}
</style>
