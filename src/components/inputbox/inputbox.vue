<template>
    <div class="pt-inputbox" :class="{'pt-inputbox--round': round, 'focus': this.focus, [className]: className}">
        <input
            v-model="innerValue"
            :type="type"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :autocomplete="autocomplete"
            @focus="focus = true"
            @blur="focus = false"
            ref="input"
            />
        <pt-icon size="small" iconName="search" v-if="type == 'search'" class="search" />
    </div>
</template>

<script>
export default {
    name: "PtInputbox",
    props: {
        className: {
            type: String
        },
        value: {
            type: String,
            default: ""
        },
        height: {
            type: Number,
            default: 30
        },
        type: {
            type: String,
            default: "text"
        },
        placeholder: {
            type: String,
            default: ""
        },
        round: {
            type: Boolean
        },
        disabled: {
            type: Boolean
        },
        readonly: {
            type: Boolean
        },
        autocomplete: {
            type: Boolean
        }
    },
    data() {
        return {
            innerValue: this.value,
            focus: false
        }
    },

    computed: {
        style () {
            return {
                height: this.height + "px",
                lineHeight: this.height + "px"
            }
        }
    },

    watch: {
        value(newVal) {
            if (newVal === this.innerValue) {
                return;
            }
            this.innerValue = newVal;
        },
        innerValue(newVal) {
            this.$emit("input", newVal)
        }
    },
    methods: {
        dofocus() {
            this.$refs.input.focus();
        }
    },
}
</script>

<style lang="scss">
.pt-inputbox {
    position: relative;
    box-sizing: border-box;
    height: 32px;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.2s;

    &.focus {
        transition: all 0.2s;
    }

    &.pt-inputbox--round {
        border-radius: 15px;
    }

    input {
        border: none;
        outline: none;
        width: 100%;
        height: 100%;
        background-color: var(--n-input-bg-color);
        color: var(--n-text-color-base);
	    border-radius: 4px;
        padding-left: 12px;
	    box-sizing: border-box;
    }

    /*去掉默认的搜索小图标*/
    input[type="search"]::-webkit-search-decoration{
        display: none;
    }
    /*去掉默认的x*/
    input[type="search"]::-webkit-search-cancel-button{
        display: none;
    }

    .search {
        float: right;
        margin-top: 5px;
        margin-right: 2px;

        color: var(--secondaryTextColor);
    }

}
</style>