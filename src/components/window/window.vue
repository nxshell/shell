<template>
    <div class="pt-window" :class="{'not-macos': !ISMACOS}">
        <div class="left-panel" v-if="leftPanel" :style="{width: leftPanelWidth + 'px'}">
            <slot name="left-panel"/>
        </div>
        <div class="main-panel">
            <div class="title-bar"
                :class="{drag: isMainWindow, deactive: !active}"
                v-if="topPanel">
                <div class="top-resize"></div>
                <span class="title-text" :class="{deactive: !active}">{{ title }}</span>
                <div class="window-controls-container" v-if="!ISMACOS">
                    <div class="window-controls-btn-bg" @click="doMinimize"><div class="window-minimize"></div></div>
                    <div class="window-controls-btn-bg" @click="doMaximize"><div :class="state == 'normal' ? 'window-maximize' : 'window-unmaximize' "></div></div>
                    <div class="window-controls-btn-close-bg" @click="doClose"><div class="window-close"></div></div>
                </div>
            </div>
            <div class="main-container" :style="main_container_fix_style">
                <slot name="main-panel"></slot>
            </div>
        </div>
    </div>
</template>

<script>

const ISMACOS = /macintosh/i.test(navigator.userAgent);

export default {
    name: "PtWindow",
    props: {
        isMainWindow: {
            type: Boolean,
            default: false
        },
        leftPanelWidth: {
            type: Number,
            default: ISMACOS ? 70 : 60
        },
        leftPanel: {
            type: Boolean,
            default: false
        },
        topPanel: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            default: ""
        }
    },

    data() {
        return {
            ISMACOS,
            state: "normal",
            active: true,
            window: null
        }
    },
    computed: {
        main_container_fix_style() {
            return this.topPanel ? {} : {height: '100%'};
        }
    },

    created() {
        this.setWindowHandlers();
    },

    methods: {
        setWindowHandlers() {
            const currentWindow = powertools.getCurrentWindow();
            this.window = currentWindow;

            currentWindow.on("blur", () => {
                this.active = false;
            });

            currentWindow.on("focus", () => {
                this.active = true;
            });

            currentWindow.on("maximize", () => {
                this.state = "maximize";
            });

            currentWindow.on("unmaximize", () => {
                this.state = "normal";
            });
        },

        workaroundLinuxMaxMinEvent(status) {
            // electron version < 17.xx ,it not emit maximize/unmaximize events
            const ostype = powertools.getostype();
            if(ostype === 'Linux') {
                this.state = status;
            }
        },

        doMinimize() {
            this.window.minimize();
            this.workaroundLinuxMaxMinEvent("normal");
        },

        doMaximize() {
            if (this.state == "normal") {
                this.window.maximize();
                this.workaroundLinuxMaxMinEvent("maximize")
            } else {
                this.window.unmaximize();
                this.workaroundLinuxMaxMinEvent("normal")
            }
        },

        doClose() {
            this.window.close();
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/scss/_const.scss";
.pt-window {
    display: flex;
    position: relative;
    box-sizing: border-box;

    width: 100%;
    height: 100%;

    &.not-macos {
        border: 1px solid var(--windowBorderColor);
    }

    .left-panel {
        height: 100%;
        background-color: var(--backgroundColor);
    }

    .main-panel {
        width: 100%;
        height: 100%;

        .title-bar {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: $titleBarHeight;
            width: 100%;

            background-color: var(--windowTitleBarColor);
            &.deactive {
                background-color: var(--windowTitleBarDeactiveColor);
            }
            .title-text {
                color: var(--primaryTextColor);
                &.deactive {
                    color: var(--deactiveTextColor);
                }
            }

            &.drag {
                -webkit-app-region: drag;
            }

            .top-resize {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 5px;
                z-index: 999;
                -webkit-app-region: no-drag;
            }

            .title-text {
                margin-left: 10px;
                font-weight: bold;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .window-controls-container {
                position: absolute;
                z-index: 3000;
                display: flex;
                flex-grow: 0;
                flex-shrink: 0;
                width: 138px;
                height: 30px;
                right: 0;
                top: 0;

                -webkit-app-region: no-drag;

                .window-controls-btn-bg {
                    width: 33.4%;
                    height: 100%;
                    &:hover {
                        background-color: var(--darkBackgroundColor);
                        opacity: 0.7;
                    }
                }

                .window-controls-btn-close-bg {
                    width: 33.4%;
                    height: 100%;
                    &:hover {
                        background-color: #e81123
                    }
                }

                .window-minimize {
                    height: 100%;
                    -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                }

                .window-maximize {
                    height: 100%;
                    -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                }

                .window-unmaximize {
                    height: 100%;
                    -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                }

                .window-close {
                    height: 100%;
                    -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                    
                    &:hover {
                        background-color: white;
                    }
                }

                .window-minimize, .window-maximize, .window-unmaximize, .window-close {
                    background-color: var(--primaryTextColor);
                }
            }
        }

        .main-container {
            position: relative;
            box-sizing: border-box;
            width: 100%;
            height: calc(100% - #{$titleBarHeight});
        }
    }
}
</style>