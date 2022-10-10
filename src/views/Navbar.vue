<template>
    <div class="pt-shell-app-nav-bar">
        <div class="pt-logo">
            <el-avatar
                shape="square"
                fit="fill"
                size="small"
                :src="require('@/assets/logo.png')"
                @click.native="doConfig"
            />
        </div>

        <div class="capture" @click.prevent="doCapture" v-show="false">
            <pt-icon
                type="img"
                :iconName="captureIcon"
                size="medium"
                className="icon-setting"
            />
        </div>
        <!-- 设置相关 -->
        <div class="icon-setting-container">
            <Space vertical align="center">
                <!-- 头像 -->
                <el-avatar
                    v-show="false"
                    shape="square"
                    fit="fill"
                    :src="avatarUrl"
                    @click="goto_login"
                />
                <!-- 主题切换按钮 -->
                <el-button
                    type="text"
                    :icon="themeIcon"
                    @click="toggleTheme"
                ></el-button>
                <!-- 设置按钮 -->
                <el-button
                    type="text"
                    icon="el-icon-setting"
                    @click="gotoGlobalSetting"
                ></el-button>
            </Space>
        </div>
    </div>
</template>

<script>
    import {mapState, mapMutations} from "vuex";

    import {SESSION_TYPES} from "@/services/session";
    import {createLocalFs} from "../services/nxsys/localfs";
    import * as EventBus from "../services/eventbus";

    import NxShellIcon from "@/assets/logo.png";
    import VideoPlay from "@/assets/images/video.png";
    import VideoPause from "@/assets/images/pause.png";

    export default {
        name: "PtShellAppNavBar",
        data() {
            return {
                apps: [
                    {
                        text: "NxShell",
                        icon: NxShellIcon,
                    },
                ],
                capture: false,
                fsClient: null,
                captureIcon: VideoPlay,
                sessionPannel: "open",
            };
        },

        computed: {
            ...mapState(["userInfo", "configPannel", "userLock", "theme"]),
            avatarUrl() {
                return this.userInfo ? this.userInfo.user_avatar : "";
            },
            avatarName() {
                return this.userInfo ? this.userInfo.user_name : "";
            },
            themeIcon() {
                return this.theme === "light" ? "el-icon-moon" : "el-icon-sunny";
            },
        },

        async mounted() {
            this.$nextTick(() => {
                this.$refs.appList?.selectItem(0);
            });
        },

        methods: {
            ...mapMutations(["setConfigPannel", "setTheme"]),
            goto_login() {
                const loginInstances =
                    this.$sessionManager.matchSessionInstanceBySessionType(
                        SESSION_TYPES.LOGIN
                    );
                if (loginInstances.length) {
                    return;
                }
                this.$sessionManager.createLoginSessionInstance();
            },

            gotoGlobalSetting() {
                if (this.userLock) {
                    // not allow
                    return;
                }
                const globalSettingInstances =
                    this.$sessionManager.matchSessionInstanceBySessionType(
                        SESSION_TYPES.GLOBALSETTING
                    );
                if (globalSettingInstances.length) {
                    return;
                }

                this.$sessionManager.createGlobalSettingSessionInstance();
            },

            doCapture(e) {
                if (this.capture) {
                    this.capture = false;
                    this.captureIcon = VideoPlay;
                    this.saveCaptureFile();
                } else {
                    this.capture = true;
                    this.captureIcon = VideoPause;
                    powertools.captureStart();
                }
            },

            doConfig(e) {
                let action = !this.configPannel ? "open" : "close";
                EventBus.publish("session-config-pannel", action);
                this.setConfigPannel(!this.configPannel);
            },

            async saveCaptureFile() {
                const save_buffer = await powertools.captureStop();
                const coreService = powertools.getService("powertools-core");
                const {canceled, filePath} = await coreService.showSaveDialog({
                    defaultPath: `nxshell-capture-${Date.now()}.webm`,
                });
                if (canceled) {
                    return;
                }
                if (!this.fsClient) {
                    this.fsClient = await createLocalFs();
                }
                const w_handle = await this.fsClient.open(filePath, "w");
                await this.fsClient.write(
                    w_handle,
                    save_buffer,
                    0,
                    save_buffer.length,
                    0
                );
                this.fsClient.close(w_handle);
            },
            toggleTheme() {
                if (this.theme === "light") {
                    this.setTheme("dark");
                    window.document.documentElement.setAttribute(
                        "nx-theme",
                        "dark"
                    );
                } else {
                    this.setTheme("light");
                    window.document.documentElement.removeAttribute("nx-theme");
                }
            },
        },
    };
</script>

<style lang="scss">
    .pt-shell-app-nav-bar {
        display: flex;
        padding: 10px;
        height: calc(100vh - 20px);
        flex-direction: column;
        align-content: center;
        align-items: center;
        justify-content: space-between;

        .pt-logo {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;

            .el-avatar {
                background: transparent;
            }

            &:hover {
                cursor: pointer;
                background-color: var(--lightBackgroundColor);
            }
        }

        .icon-setting-container {
            .el-button {
                width: 40px;

                i {
                    font-size: 20px;
                }

                &:hover {
                    background-color: var(--lightBackgroundColor);
                }
            }
        }

        .capture {
            margin-top: 10px;
            text-align: center;

            .icon-setting {
                color: lightgray;
                cursor: pointer;

                &:hover {
                    color: white;
                }
            }
        }
    }
</style>