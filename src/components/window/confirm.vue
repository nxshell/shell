<template>
    <pt-dialog :title="title" :show="true" @ok="handleOk" @cancel="handleCancel">
        <div class="pt-confirm-body">
            <pt-icon v-if="type"
                :iconName="iconName"
                :className="className"
                size="large"></pt-icon>
            <div class="message">{{ message }}</div>
        </div>
    </pt-dialog>
</template>

<script>
export default {
    name: "PtConfirm",
    data() {
        return {
            title: "",
            message: "",
            type: "",
            onOk: () =>{},
            onCancel: () =>{}
        }
    },

    computed: {
        iconName() {
            switch (this.type) {
            case "info":
                return "info"
                break;
            case "warning":
                return "warning"
                break;
            case "error":
                return "error-dlg"
                break;
            default:
                return ""
            }
        },
        className() {
            switch (this.type) {
                case "info":
                    return "icon-info";
                    break;
                case "warning":
                    return "icon-warning";
                    break;
                case "error":
                    return "icon-error";
                    break;
                default:
                    return ""
            }
        }
    },

    methods: {
        handleOk() {
            if (this.onOk) {
                this.onOk();
            }
        },

        handleCancel() {
            if (this.onCancel) {
                this.onCancel();
            }
        }
    }
}
</script>

<style lang="scss">
.pt-confirm-body {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;

    .pt-icon {
        margin-right: 10px;
    }

    .message {
        flex-grow: 1;
        font-size: 14px;
    }

    .icon-info {
        color: var(--infoColor);
    }

    .icon-warning {
        color: var(--warningColor);
    }

    .icon-error {
        color: var(--dangerColor);
    }
}
</style>