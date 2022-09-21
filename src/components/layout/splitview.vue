<template>
    <div class="pt-split-view">
        <div class="sash-container">
            <dragable v-for="(sashItem, idx) in sash" :key="idx"
                :axis="dragType"
                :className="type"
                :left="type == 'vertical' ? sashItem.left : 0"
                :top="type == 'horizontal' ? sashItem.top : 0"
                :width="5"
                :height="5"
                :clipRect="sashItem.clipRect"
                :imm="true"
                @moveTo="adjustView($event, idx)"
                @dragEnd="adjustViewEnd()"
                />
        </div>
        <div class="split-view-container">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import debounce from "lodash/debounce";
import Dragable from "../base/dragable";

export default {
    name: "PtSplitView",
    components: {
        Dragable
    },
    props: {
        type: {
            type: String,
            default: "vertical"
        },
        subViews: {
            type: Array,
            default () {
                return [];
            }
        },
        minSize: {
            type: Number,
            default: 0
        }
    },

    data() {
        return {
            subViewBoundingRects: [],
            viewRect: {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            },
            layoutTrigger: "",

            resizeHandler: null
        };
    },

    computed: {
        dragType() {
            return this.type == "vertical" ? "x": "y";
        },

        sash() {
            if (this.subViewBoundingRects.length < 2) {
                return;
            }
            let sashCount = this.subViewBoundingRects.length;
            let sash = [];

            if (this.viewRect[this.sizeProp] == 0) {
                return;
            }
            for (let i = 1; i < sashCount; i++) {
                const minProp = this.posProp;
                const maxProp = {left: "right", top: "bottom"}[minProp];
                const prevViewRect = this.subViewBoundingRects[i - 1];
                const curViewRect = this.subViewBoundingRects[i];
                let clipRect = {
                    // 左侧/上侧边界
                    [minProp]: curViewRect[this.posProp] - (prevViewRect[this.sizeProp] - (prevViewRect.min || this.minSize)),
                    // 右侧/下侧边界
                    [maxProp]: curViewRect[this.posProp] + curViewRect[this.sizeProp] - (curViewRect.min || this.minSize)
                };
                sash.push({
                    [this.posProp]: curViewRect[this.posProp],
                    clipRect
                });
            }

            return sash;
        },
        posProp() {
            return {vertical: "left", horizontal: "top"}[this.type];
        },
        sizeProp() {
            return this.posProp == "left" ? "width" : "height";
        },
        subViewRects() {}
    },

    mounted() {
        this.initViews();
        this.setupResizeHandler();
    },

    beforeDestroy() {
        this.deleteResizeHandler();
    },

    activated() {
        this.resizeHandler();
    },

    methods: {
        setupResizeHandler() {
            this.resizeHandler = debounce(() => {
                this.viewRect = this.$el.getBoundingClientRect();
                this.resizeLayout();
            }, 100);

            window.addEventListener("resize", this.resizeHandler);
        },
        deleteResizeHandler() {
            if (this.resizeHandler) {
                window.removeEventListener("resize", this.resizeHandler);
            }
        },
        layoutImpl(posProp) {
            // calc rect
            let containerSize = posProp == "left" ? this.viewRect.width : this.viewRect.height;
            let sizeProp = posProp == "left" ? "width" : "height";
            let position = 0;
            let calcSize = (type, value) => {
                return {
                    px: () => {
                        return value;
                    },
                    "%": () => {
                        return this.viewRect.width * (value / 100);
                    }
                }[type]();
            }
            this.subViewBoundingRects = this.subViews.map((view, index) => {
                let type = view.size.type || "px";
                let size = calcSize(type, view.size.value);
                let rect = {
                    [posProp]: position,
                    [sizeProp]: size,
                    type,
                    size: type === "px" ? size : (size / this.viewRect[sizeProp] * 100)
                };

                position += size;

                return rect;
            });
            this.resizeChildren();
        },
        _initSubViewBoundingRects() {
            this.subViewBoundingRects = this.subViews.map((view, index) => {
                const type = view.size.type || "px";
                let size = view.size.value || (type == "px" ? this.minSize : (this.minSize / this.viewRect[this.sizeProp] * 100))
                return {
                    [this.posProp]: 0,
                    [this.sizeProp]: type == "px" ? size : size / (100 * this.viewRect[this.sizeProp]),
                    type,
                    min: view.size.min || this.minSize,
                    size
                };
            });
        },
        _layout() {
            if (this.subViewBoundingRects.length === 0) {
                return
            }
            const getSize = r => r[this.sizeProp];
            const setSize = (r, s, t) => {
                r[this.sizeProp] = s;
                r.size = t == "px" ? s : (s / getSize(this.viewRect) * 100)
            };
            const getPos = p => p[this.posProp];
            const setPos = (p, npos) => p[this.posProp] = npos;
            const calcSize = (type, value) => {
                return {
                    px: () => value,
                    "%": () => (this.viewRect[this.posProp] * (value / 100)) || 0,
                }[type]();
            }

            const updateViewsPos = () => {
                let basePos = 0
                for (let i = 0; i < this.subViewBoundingRects.length; i++) {
                    const v = this.subViewBoundingRects[i];
                    setPos(v, basePos);
                    basePos += getSize(v);
                }
            } 

            // 固定尺寸的区域
            let fixedSizeRect = [];
            // 计算出的固定尺寸大小
            let fixedSize = 0;
            // 计算出的总大小
            let totalSize = 0;
            const avgSize = getSize(this.viewRect) / this.subViewBoundingRects.length;
            
            // 第一遍初始化空间，找到没有分配空间的区域
            // 并统计总大小
            for (let i = 0; i < this.subViewBoundingRects.length; i++) {
                let viewRect = this.subViewBoundingRects[i];
                const size = calcSize(viewRect.type, viewRect.size);
                setSize(viewRect, size, viewRect.type)
                if (viewRect.type == "px") {
                    fixedSize += getSize(viewRect)
                    fixedSizeRect.push(i);
                }

                totalSize += size;
            }

            // 尺寸刚刚好，并且所有的区域都分配了
            if (Math.round(totalSize) === Math.round(getSize(this.viewRect))) {
                updateViewsPos();
                return;
            }

            // 剩余尺寸
            const remainderSize = getSize(this.viewRect) - totalSize;
            if (remainderSize > 0) {
                // 大家都分配了空间，那么，就把这个剩余区域的大小直接分配给最后一个区域
                // 没错，最后一个区域占便宜了
                let lastView = this.subViewBoundingRects[this.subViewBoundingRects.length - 1];
                setSize(lastView, getSize(lastView) + remainderSize, lastView.type);
                updateViewsPos()
                return;
            }

            // 空间超出了视图范围
            // 那么就需要重新安排空间了
            // 优先保障非百分比尺寸的空间，根据实际情况慢慢调整大小
            let viewsPercents = this.subViewBoundingRects.map((view) => {
                return getSize(view) / totalSize;
            });

            let delta = 0;
            for (let i = 0; i < this.subViewBoundingRects; i++) {
                let viewRect = this.subViewBoundingRects[i];
                // view的原大小
                const originSize = getSize(viewRect);
                // 期望调整的大小
                const expectedSize = viewsPercents[i] * getSize(this.viewRect);
                // let destSize = originSize + delta;
                // 期望大小大于实际大小则保持原有大小，并且将剩余的空间进行累加
                let destSize = originSize;
                if (expectedSize > originSize) {
                    delta += expectedSize - originSize;
                } else {
                    // 期望大小小于（等于其实可以忽略）原大小，那么就需要做调整了
                    if (expectedSize + delta > originSize) {
                        delta = expectedSize + delta - originSize;
                    } else {
                        destSize = expectedSize + delta;
                        if (destSize < viewRect.min) {
                            delta -= viewRect.min - destSize;
                            destSize = viewRect.min;
                        }
                    }
                }
                setSize(viewRect, destSize, viewRect.type);
            }

            updateViewsPos();
        },
        resizeLayout() {
            this._layout();
            this.$forceUpdate();
            this.resizeChildren();
        },
        adjustView(evt, idx) {
            let prevRect = this.subViewBoundingRects[idx];
            let nextRect = this.subViewBoundingRects[idx + 1];
            let posProp = this.posProp;
            let sizeProp = this.sizeProp;
            
            let sashPos = this.sash[idx][posProp];
            let curPos = evt[posProp];

            let delta = curPos - sashPos;
            let prevSize = prevRect[sizeProp] + delta;
            let nextPos = nextRect[posProp] + delta;
            let nextSize = nextRect[sizeProp] - delta;

            this.$set(this.subViewBoundingRects, idx, {
                [posProp]: prevRect[posProp],
                [sizeProp]: prevSize,
                type: prevRect.type,
                size: prevRect.type == "px" ? prevSize : (prevSize / this.viewRect[sizeProp] * 100)
            });
            this.$set(this.subViewBoundingRects, idx + 1, {
                [posProp]: nextPos,
                [sizeProp]: nextSize,
                type: nextRect.type,
                size: nextRect.type == "px" ? nextSize : (nextSize / this.viewRect[sizeProp] * 100)
            });

            this.resizeChildren();
        },
        adjustViewEnd() {

        },
        resizeChildren() {
            this.$children.forEach((child) => {
                if (typeof child.resize == "function") {
                    child.resize();
                }
            });
            // 我们需要等待下个tick来发送事件
            this.$nextTick(() => {
                let event = new CustomEvent("pt-view-resize");
                window.dispatchEvent(event);
            });
        },
        layout() {
            if (this.type == "vertical") {
                this.layoutImpl("left");
            } else if (this.type == "horizontal") {
                this.layoutImpl("top");
            }
        },
        initViews() {
            this.viewRect = this.$el.getBoundingClientRect();

            // this.layout();
            this._initSubViewBoundingRects();
            this._layout();
            this.resizeChildren();
        },
        getViewRect(idx) {
            let rect = this.subViewBoundingRects[idx];
            if (!rect) {
                return {left: 0, top: 0, width: 0, height: 0};
            }

            return {
                [this.posProp]: rect[this.posProp],
                [this.posProp == "left" ? "top": "left"]: 0,
                [this.sizeProp]: rect[this.sizeProp],
                [this.sizeProp == "width" ? "height": "width"]: this.viewRect[this.sizeProp == "width" ? "height": "width"]
            };
        },
        _addView(idx, size, type = "%") {
            if (type != "px") type = "%";
            let fixedSize = type == "px" ? size : 0;
            let floatCount = type == "px" ? 0 : 1;
            for (let rect of this.subViewBoundingRects) {
                if (rect.type == "px") {
                    fixedSize += rect[this.sizeProp];
                } else {
                    floatCount++;
                }
            }
            let avgFloatSize = (this.viewRect[this.sizeProp] - fixedSize) / floatCount;
            let newRect = {
                [this.sizeProp]: type == "px" ? size : avgFloatSize,
                type: type,
                size: type == "px" ? size : avgFloatSize / this.viewRect[this.sizeProp]
            };

            if (idx == -1) {
                this.subViewBoundingRects.unshift(newRect);
            } else if (idx >= this.subViewBoundingRects.length) {
                this.subViewBoundingRects.push(newRect);
            } else {
                this.subViewBoundingRects = this.subViewBoundingRects.slice(0, idx)
                    .concat([newRect])
                    .concat(this.subViewBoundingRects.slice(idx))
            }
            this.resizeLayout();
        },

        addViewBefore(idx, size, type) {
            this._addView(idx - 1, size, type);
        },

        addViewAfter(idx, size, type) {
            this._addView(idx + 1, size, type);
        },

        removeView(idx) {
            this.subViewBoundingRects.splice(idx, 1);
            this.resizeLayout();
        },

        resize() {
            this._initSubViewBoundingRects();
            this.resizeLayout();
        }
    },
    provide () {
        return {
            getViewRect: this.getViewRect
        }
    }
}
</script>

<style lang="scss">
.pt-split-view {
    position: relative;
    overflow: hidden;

    width: 100%;
    height: 100%;

    .sash-container {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;

        .vertical {
            height: 100% !important;
            // background-color: lightblue; // only for devlopment
            z-index: 100;
        }

        .horizontal {
            width: 100% !important;
            background-color: lightblue;
            z-index: 100;
        }
    }

    .split-view-container {
        position: relative;
        width: 100%;
        // left: 0;
        // top: 0;
        height: 100%;
    }
}
</style>
