<template>
    <div class="pt-tab-item" :class="{
            'pt-tab-item--selected': selected
        }"
        @click="onClickHandler"
        @contextmenu.prevent="handleContextMenu"
    >
        <span v-if="icon" class="pt-tab-item-icon">
            <pt-icon size="custom" :customSize="24" :iconName="iconProp.iconName" :type="iconProp.type"/>
        </span>
        <span class="pt-tab-item-title" :class="{
            'has-icon': !!iconProp,
            'no-icon': !iconProp
        }">{{ title }}</span>
        <span v-if="!hideClose" class="pt-tab-item-close" @click="onCloseHandler">
            <pt-icon iconName="close" className="pt-tab-item-close-icon"/>
        </span>
        <span class="pt-tab-item-split" v-if="showSplit" />
    </div>
</template>

<script>
export default {
    name: "PtTabItem",
    props: {
        icon: {
            type: [String, Object]
        },

        title: {
            type: String
        },

        selected: {
            type: Boolean
        },
        showSplit: {
            type: Boolean
        },
        hideClose: {
            type: Boolean
        }
    },

    computed: {
        iconProp() {
            if (!this.icon) {
                return null;
            }

            if (typeof this.icon === "string") {
                return {
                    iconName: this.icon,
                    type: "svg"
                }
            }
            if (typeof this.icon === "object") {
                const iconProp = {...this.icon};
                if (iconProp.type !== "img") {
                    iconProp.type = "svg";
                }
                return iconProp;
            }
        }
    },

    methods: {
        onClickHandler() {
            this.$emit("click");
        },

        onCloseHandler() {
            this.$emit("close")
        },
        handleContextMenu() {
            this.$emit("contextmenu");
        }
    }
}
</script>

<style lang="scss">
.pt-tab-item {
    position: relative;
    display: inline-block;
    cursor: default;
    user-select: none;
    
    max-width: 170px;
    height: 33px;
    line-height: 33px;

    padding: {
        left: 10px;
        right: 10px;
    }

    overflow: hidden;

    background-color: var(--lightBackgroundColor);
    border: {
        top: none;
        left: none;
        right: none;
        bottom: solid 2px var(--primaryColor);
    }
    color: var(--deactiveTextColor);
    transition: all .2s;
    &:hover {
        color: var(--primaryTextColor);
        transition: all .2s;
    }

    &.pt-tab-item--selected {
        background-color: var(--primaryColor);
        border-color: var(--primaryColor);
        color: white;

        transition: all .2s;
    }

    .pt-tab-item-close {
        // transition: all .2s;

        &:hover {
            color: red;
            // transition: all .2s;
        }    
    }

    @mixin pt-tab-item-ele {
        display: inline-block;
        height: 100%;
        vertical-align: middle;
    }

    .pt-tab-item-icon {
        @include pt-tab-item-ele();

        margin-right: 5px;
    }
    .pt-tab-item-title {
        @include pt-tab-item-ele();
        margin-right: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.has-icon {
            width: calc(100% - 50px);
        }
        &.no-icon {
            width: calc(100% - 21px);
        }
    }
    .pt-tab-item-close {
        @include pt-tab-item-ele();
    }

    .pt-tab-item-split {
        display: inline-block;
        position: absolute;
        box-sizing: border-box;

        right: -1px;
        top: 8px;

        height: 17px;
        width: 1px;
        border-left: solid 2px var(--darkBorderColor);
    }
}
</style>
