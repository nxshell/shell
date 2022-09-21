<template>
    <span
        :title="title"
        class="pt-icon-wrapper"
        :class="{flat: flat, disabled: disabled}"
        @click="onClick">
        <template v-if="type === 'svg'">
            <svg class="pt-icon" :class="ptIconClass" :style="ptIconStyle" aria-hidden="true">
                <use :xlink:href="'#icon-' + iconName"></use>
            </svg>
        </template>
        <template v-if="type === 'img'">
            <!-- TODO: 需要解决图片加载问题 -->
            <img class="pt-icon"
                :src="iconName"
                :class="ptIconClass"
                :style="ptIconStyle"
                aria-hidden="true">
        </template>
    </span>
    
</template>

<script>
export default {
    name: "PtIcon",
    props: {
        /**
         * type
         * 
         * valid value: svg or img
         */
        type: {
            type: String,
            default: "svg"
        },
        size: {
            type: String,
            default: "small"
        },
        customSize: {
            type: Number
        },
        circle: {
            type: Boolean,
            default: false
        },
        iconName: {
            type: String
        },
        className: {
            type: String
        },
        title: {
            type: String
        },
        flat:{
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        ptIconClass() {
            let cls = ["pt-icon-" + this.size];
            if (this.circle) {
                cls.push("circle");
            }
            if (this.className) {
                cls.push(this.className);
            }
            if (this.disabled) {
                cls.push("disabled")
            }
            return cls;
        },
        ptIconStyle() {
            const style = {};
            if (this.size === "custom") {
                style.width = this.customSize + "px";
                style.height = this.customSize + "px";
            }
            return style;
        }
    },

    methods: {
        onClick(e) {
            if (this.disabled) {
                return;
            }
            this.$emit("click", e);
        }
    }
}
</script>

<style lang="scss">

.pt-icon-wrapper {
    position: relative;
    display: inline-block;
    &.flat {
        padding: 5px;
        border-radius: 50%;
        transition: all .3s;
        &:hover {
            background-color: var(--darkBackgroundColor);
            transition: all .3s;
        }
        &.disabled {
            background-color: transparent;
            &:hover {
                color: var(--disableColor);
            }
        }
    }

    .pt-icon {
        &.disabled {
            color: var(--disableColor);
            background-color: transparent;
        }
    }
}
</style>