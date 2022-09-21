<template>
    <div class="pt-avatar" :class="colorClass" @click="emit_click">
        <img v-if="avatarUrl || (!avatarName)" :src="avatarUrl || DEFAULT_AVATAR">
        <span v-else-if="avatarName"> {{avatarName[0]}} </span>
    </div>
</template>

<script>
import defaultAvatar from "@/assets/images/default-avatar.png";

export default {
    name: "PtAvatar",
    props: {
        avatarUrl: String,
        avatarName: String
    },
    data() {
        return {
            DEFAULT_AVATAR: defaultAvatar
        }
    },
    computed: {
        colorClass() {
            if (!this.avatarName) {
                return "";
            }

            const code = this.avatarName.charCodeAt(0);
            return `color-${code % 8}`;
        }
    },
    methods: {
        emit_click() {
            this.$emit('click');
        }
    }
}
</script>

<style lang="scss">
.pt-avatar {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    box-sizing: content-box;

    border-style: solid;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    line-height: 48px;
    overflow: hidden;

    img {
        width:100%;
        height: 100%;
    }

    span {
        display: inline-block;
        width: 100%;
        height: 100%;
        font-size: 28px;
        color: white;
        text-align: center;
    }

    border-color: white;

    &.color-0 {
        background-color:  #ff5733;
    }
    &.color-1 {
        background-color: #d43030;
    }
    &.color-2 {
        background-color: #e33c64;
    }
    &.color-3 {
        background-color: #43cf7c;
    }
    &.color-4 {
        background-color: #00baad;
    }
    &.color-5 {
        background-color: #2a82e4;
    }
    &.color-6 {
        background-color: #7948ea;
    }
    &.color-7 {
        background-color: #ac33c1;
    }
}
</style>