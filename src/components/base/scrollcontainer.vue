<template>
    <div class="pt-scroll-container"
        @mouseenter="showScrollbar()"
        @mouseleave="hideScrollbar()"
        @mousewheel="handleMouseWheel"
    >
        <div ref="container" class="pt-scroll-container--inner" @scroll="handleScroll">
            <div ref="content" class="content-container">
                <slot />
            </div>
        </div>
        <dragable v-if="(type == 'both' || type == 'vertical') && (!verticalProp.isHide) && isShowScrollbar"
            :axis="verticalProp.axis"
            :clipRect="verticalProp.clipRect"
            :top="veritcalPos"
            :left="verticalProp.left"
            :width="verticalProp.width"
            :height="verticalProp.height"
            :imm="true"
            className="pt-scroll-bar"
            cursor="default"
            @moveTo="handleBarTrack($event, 'vertical')"
            @dragStart="handleStartBarTrack"
            @dragEnd="handleEndBarTrack"
        />
        <dragable v-if="(type == 'both' || type == 'horizontal') && (!horizontalProp.isHide) && isShowScrollbar"
            :axis="horizontalProp.axis"
            :clipRect="horizontalProp.clipRect"
            :top="horizontalProp.top"
            :left="horizontalPos"
            :width="horizontalProp.width"
            :height="horizontalProp.height"
            :imm="true"
            className="pt-scroll-bar"
            cursor="default"
            @moveTo="handleBarTrack($event, 'horizontal')"
            @dragStart="handleStartBarTrack"
            @dragEnd="handleEndBarTrack"
        />
    </div>
</template>

<script>
import Dragable from "./dragable";

export default {
    name: "PtScrollContainer",
    components: {
        Dragable
    },
    props: {
        type: {
            type: String,
            default: "both"
        },
        size: {
            type: Number,
            default: 5
        }
    },
    data() {
        return {
            isShowScrollbar: false,
            isDragScrollbar: false,
            isMouseLeave: false,
            containerSizeListener: null,
            containerSize: {
                width: 0,
                height: 0
            },
            contentSizeListener: null,
            contentSize: {
                width: 0,
                height: 0
            },
            veritcalPos: 0,
            horizontalPos: 0,
            scrollY: 0,
            scrollX: 0,

            hideScrollBarTimeoutHandle: null,
        }
    },

    computed: {
        verticalProp() {
            let height = this.containerSize.height - (this.contentSize.height - this.containerSize.height);
            if (height < 30) {
                height = 30;
            }

            const validRange = this.containerSize.height - height - (this.type == "both" ? this.size : 0);
            const scrollRange = this.contentSize.height - this.containerSize.height;

            return {
                left: this.containerSize.width - this.size,
                width: this.size,
                height,
                axis: "y",
                clipRect: {
                    top: 0,
                    bottom: this.type == "both" ? this.containerSize.height - this.size : this.containerSize.height
                },
                isHide: scrollRange <= 0,
                validRange,
                scrollRange
            };
        },

        horizontalProp() {
            let width = this.containerSize.width - (this.contentSize.width - this.containerSize.width); 
            if (width > 0 && width < 30) {
                width = 30;
            }

            const validRange = this.containerSize.width - width - (this.type == "both" ? this.size : 0);
            const scrollRange = this.contentSize.width - this.containerSize.width;

            return {
                top: this.containerSize.height - this.size,
                height: this.size,
                width,
                axis: "x",
                clipRect: {
                    left: 0,
                    right: this.type == "both" ? this.containerSize.width - this.size : this.containerSize.width
                },
                isHide: scrollRange <= 0,
                validRange,
                scrollRange
            };
        }
    },

    watch: {
        scrollX() {
            this.$refs.container.scrollTo(this.scrollX, this.scrollY);
        },

        scrollY() {
            this.$refs.container.scrollTo(this.scrollX, this.scrollY);
        }
    },

    mounted() {
        this.containerSizeListener = (element) => {
            this.containerSize.width = element.offsetWidth;
            this.containerSize.height= element.offsetHeight;
        };

        this.contentSizeListener = (element) => {
            this.contentSize.width = element.offsetWidth;
            this.contentSize.height= element.offsetHeight;
        };
        this.$nextTick(() => {
            this.$ptElementResizeDetector.listenTo(this.$refs.container, this.containerSizeListener);
            this.$ptElementResizeDetector.listenTo(this.$refs.content, this.contentSizeListener);
        });
    },

    beforeDestroy() {
        this.$ptElementResizeDetector.removeListener(this.$refs.container, this.containerSizeListener);
        this.$ptElementResizeDetector.removeListener(this.$refs.content, this.contentSizeListener);
    },

    methods: {
        handleMouseWheel(e) {
            let delta = e.deltaY < 0 ? -100 : 100;
            if (this.type === "vertical" || this.type === "both") {
                this.scrollY += delta;
                if (this.scrollY < 0) {
                    this.scrollY = 0;
                }
                if (this.scrollY > this.verticalProp.scrollRange) {
                    this.scrollY = this.verticalProp.scrollRange;
                }
            } else {
                this.scrollX += delta;
                if (this.scrollX < 0) {
                    this.scrollX = 0;
                }
                if (this.scrollX > this.horizontalProp.scrollRange) {
                    this.scrollX = this.horizontalProp.scrollRange;
                }
            }
            
            this.veritcalPos = Math.round(this.scrollY / 
                (this.verticalProp.scrollRange / this.verticalProp.validRange));
            this.horizontalPos = Math.round(this.scrollX /
                (this.horizontalProp.scrollRange / this.horizontalProp.validRange));
            
            this.$emit("scroll", {x: this.scrollX, y: this.scrollY});
        },

        handleScroll(e) {
            const  { scrollTop, clientHeight, scrollHeight } = e.target;
            if(scrollTop + clientHeight >= scrollHeight) {
                this.$emit("scrollBottom");
                return;
            }

            if(scrollTop === 0) {
                this.$emit("scrollTop");
            }
        },

        calcScrollPos(trackBarPos, validRange, size) {
            return Math.round(trackBarPos / validRange * size);
        },

        handleBarTrack({left, top}, type) {
            if (type === "vertical") {
                this.scrollY = this.calcScrollPos(
                    top,
                    this.verticalProp.validRange,
                    this.verticalProp.scrollRange 
                );
                this.veritcalPos = top;
            } else {
                this.scrollX = this.calcScrollPos(
                    left,
                    this.horizontalProp.validRange,
                    this.horizontalProp.scrollRange
                );
                this.horizontalPos = left;
            }

            this.$emit("scroll", {x: this.scrollX, y: this.scrollY});
        },

        handleStartBarTrack() {
            this.isDragScrollbar = true;
        },

        handleEndBarTrack() {
            this.isDragScrollbar = false;
            if (this.isMouseLeave) {
                this.hideScrollbar();
            }
        },

        showScrollbar() {
            this.isMouseLeave = false;
            if (this.hideScrollBarTimeoutHandle) {
                clearTimeout(this.hideScrollBarTimeoutHandle);
                this.hideScrollBarTimeoutHandle = null;
            }
            this.isShowScrollbar = true;
        },

        hideScrollbar() {
            this.isMouseLeave = true;
            if (this.isDragScrollbar) {
                return;
            }
            if (this.hideScrollBarTimeoutHandle) {
                clearTimeout(this.hideScrollBarTimeoutHandle);
            }
            this.hideScrollBarTimeoutHandle = setTimeout(() => {
                this.isShowScrollbar = false;
                this.hideScrollBarTimeoutHandle = null;
            }, 3000);
        },

        reset() {
            this.scrollX = 0;
            this.scrollY = 0;
            this.$emit("scroll", {x: 0, y: 0});
        },

        scrollTo(x, y) {
            this.scrollY = y;
            this.scrollX = x;
        }

    }
}
</script>

<style lang="scss">
.pt-scroll-container {
    position: relative;
    width: 100%;
    height: 100%;

    .pt-scroll-container--inner {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .content-container {
            display: inline-block;
            vertical-align: top;
            min-width: 100%;
            min-height: 100%;
            white-space: nowrap;
        }
    }

    .pt-scroll-bar {
        border-radius: 3px;
        box-sizing: content-box;
        background-color: rgba(0, 0, 0, 0.5);
    }
}
</style>