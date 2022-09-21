<template>
    <div class="pt-drag"
        :class="className"
        :style="{
            left: left + 'px',
            top: top + 'px',
            width: width + 'px',
            height: height + 'px',
            cursor: currentCursor,
            transform: transform
        }"
        @mousedown.stop="startDrag">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "PtDrag",
    props: {
        /** 鼠标 */
        cursor: {
            type: String,
            default: ""
        },
        /** 有效区域 */
        clipRect: {
            type: Object,
            default: null
        },
        /** 移动轴：x: 水平；y: 垂直；both: 水平和垂直 */
        axis: {
            type: String,
            default: "both"
        },
        /** 宽度：像素值 */
        width: {
            type: Number,
            default: 1
        },
        /** 高度：像素值 */
        height: {
            type: Number,
            default: 1
        },
        /** 附加样式 */
        className: {
            type: String,
            default: ""
        },
        /** 左侧位置 */
        left: {
            type: Number,
            default: 0
        },
        /** 顶部位置 */
        top: {
            type: Number,
            default: 0
        },
        /** 是否立即更新位置信息，触发moveTo事件 */
        imm: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            isDrag: false,
            originX: 0,
            originY: 0,

            edgeLeft: 0,
            edgeTop: 0,
            edgeRight: 0,
            edgeBottom: 0,

            oldX: 0,
            oldY: 0,
            moveX: 0,
            moveY: 0,

            mouseDownHandler: null,
            mouseUpHandler: null,
            mouseMoveHandler: null,

            parentPosistion: {
                left: 0,
                top: 0
            }
        }
    },

    computed: {
        currentCursor() {
            if (this.cursor !== "") {
                return this.cursor;
            }

            return ({x: "ew-resize", y: "ns-resize", both: "move"}[this.axis]) || "default";
        },
        transform() {
            if (!this.imm) {
                return `translate3d(${this.moveX}px, ${this.moveY}px, 0)`;
            } else {
                return "";
            }
        }
    },

    mounted() {
        this.installHandlers();
    },

    methods: {
        installHandlers() {
            // this.mouseDownHandler = (evt) => {
            //     this.oldX = evt.clientX;
            //     this.oldY = evt.clientY;
            // };

            this.mouseUpHandler = (evt) => {
                this.endDrag();
            };

            this.mouseMoveHandler = (evt) => {
                if (!this.isDrag) {
                    return;
                }

                let axis = this.axis.toLowerCase();
                let axisX = axis == "x" || axis == "both";
                let axisY = axis == "y" || axis == "both";

                let mouseout = {};
                let isMouseOut = false;
                let offsetX = evt.clientX - this.parentPosistion.left;
                let offsetY = evt.clientY - this.parentPosistion.top;

                if (axisX) {
                    let deltaX = evt.clientX - this.oldX;
                    if (this.clipRect) {
                        if (typeof this.clipRect.left == "number" && offsetX < this.edgeLeft) {
                            deltaX = this.edgeLeft - (this.moveX + this.left + this.originX);
                            this.isMouseOut = true;
                            mouseout.left = this.edgeLeft - offsetX;
                        }
                        if (typeof this.clipRect.right == 'number' && offsetX > this.edgeRight) {
                            deltaX = this.edgeRight - (this.moveX + this.left + this.originX);
                            this.isMouseOut = false;
                            mouseout.right = offsetX - this.edgeRight;
                        }
                    }
                    this.moveX += deltaX;
                    this.oldX = evt.clientX;
                }

                if (axisY) {
                    let deltaY = evt.clientY - this.oldY;
                    if (this.clipRect) {
                        if (typeof this.clipRect.top == "number" && offsetY < this.edgeTop) {
                            deltaY = this.edgeTop - (this.moveY + this.top + this.originY);
                            this.isMouseOut = true;
                            mouseout.top = this.edgeTop - offsetY;
                        }
                        if (typeof this.clipRect.bottom == 'number' && offsetY > this.edgeBottom) {
                            deltaY = this.edgeBottom - (this.moveY + this.top + this.originY);
                            this.isMouseOut = true;
                            mouseout.bottom = offsetY - this.bottom;
                        }
                    }
                    this.moveY += deltaY;
                    this.oldY = evt.clientY;
                }
                if (this.imm) {
                    this.moveTo()
                }
                if (this.isMouseOut) {
                    this.$emit("mouseout", mouseout);
                }
            };

            // document.addEventListener("mousedown", this.mouseDownHandler);
            document.addEventListener("mouseup", this.mouseUpHandler);
            document.addEventListener("mousemove", this.mouseMoveHandler);
        },
        uninstallHandlers() {
            if (this.mouseDownHandler) {
                document.removeEventListener("mousedown", this.mouseDownHandler);
            }
            if (this.mouseUpHandler) {
                document.removeEventListener("mouseup", this.mouseUpHandler);
            }
            if (this.mouseMoveHandler) {
                document.removeEventListener("mousemove", this.mouseMoveHandler);
            }
        },

        calcEgde() {
            if (!this.clipRect) {
                return;
            }
            if (typeof this.clipRect.left === "number") {
                this.edgeLeft = this.clipRect.left + this.originX;
            }
            if (typeof this.clipRect.right === "number") {
                this.edgeRight = this.clipRect.right - (this.width - this.originX);
            }
            if (typeof this.clipRect.top === "number") {
                this.edgeTop = this.clipRect.top + this.originY;
            }
            if (typeof this.clipRect.bottom === "number") {
                this.edgeBottom = this.clipRect.bottom - (this.height - this.originY);
            }
        },

        startDrag(evt) {
            if (evt.button === 0) {
                this.isDrag = true;
                this.originX = evt.offsetX;
                this.originY = evt.offsetY;
                this.oldX = evt.clientX;
                this.oldY = evt.clientY;

                this.calcEgde();
                let rect = this.$el.parentElement.getBoundingClientRect();
                this.parentPosistion.top = rect.top;
                this.parentPosistion.left= rect.left;
                this.$emit("dragStart")
            }
        },

        moveTo() {
            this.$emit("moveTo", {
                left: this.left + this.moveX,
                top: this.top + this.moveY
            });

            this.moveX = 0;
            this.moveY = 0;
        },

        endDrag() {
            if (!this.isDrag) {
                return;
            }

            this.isDrag = false;
            
            this.moveTo();
            this.$emit("dragEnd");
        }
    },

    beforeDestroy() {
        this.uninstallHandlers();
    }
}
</script>

<style lang="scss">
.pt-drag {
    position: absolute;
    user-select: none;
    -webkit-user-select: none;
}
</style>