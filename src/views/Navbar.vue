<template>
    <div class="pt-shell-app-nav-bar">
        <pt-avatar :avatarUrl="avatarUrl"
            :avatarName="avatarName"
            :title="T(userInfo ? 'home.nav.user-info':'home.nav.user-login')"
            @click="goto_login"
            v-show="false"
        />
        <pt-list dataKey="text" :listData="apps" ref="applist" @click.native="doConfig">
            <template v-slot="scope">
                <pt-icon :iconName="scope.item.data.icon"
                    size="medium"
                    type="img"
                    className="app-icon"
                    :title="scope.item.data.text"/>
            </template>
        </pt-list>
        <div class="capture" @click.prevent="doCapture" v-show="false">
            <pt-icon type="img"
                :iconName="captureIcon"
                size="medium"
                className="icon-setting"/>
        </div>
        <div class="icon-setting-container" @click="gotoGlobalSetting">
            <pt-icon iconName="setting"
                size="medium"
                className="icon-setting"/>
        </div>
        
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

import { SESSION_TYPES } from "@/services/session";
import { createLocalFs } from "../services/nxsys/localfs";
import * as EventBus from "../services/eventbus";

import NxShellIcon from "@/assets/logo.png"
import VideoPlay from "@/assets/images/video.png"
import VideoPause from "@/assets/images/pause.png"

export default {
    name: "PtShellAppNavBar",
    data() {
        return {
            apps: [
                {
                    text: "NxShell",
                    icon: NxShellIcon
                }
            ],
            capture: false,
            fsClient: null,
            captureIcon: VideoPlay,
            sessionPannel: "open",
        }
    },

    computed: {
        ...mapState(["userInfo", "configPannel", "userLock"]),
        avatarUrl() {
            return this.userInfo ? this.userInfo.user_avatar : "";
        },
        avatarName() {
            return this.userInfo ? this.userInfo.user_name : "";
        }
    },

    async mounted() {
        await this.$nextTick();
        this.$refs.applist.selectItem(0);
    },

    methods: {
        ...mapMutations(['setConfigPannel']),
        goto_login() {
            const loginInstances = this.$sessionManager.matchSessionInstanceBySessionType(SESSION_TYPES.LOGIN);
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
            const globalSettingInstances = this.$sessionManager.matchSessionInstanceBySessionType(SESSION_TYPES.GLOBALSETTING);
            if (globalSettingInstances.length) {
                return;
            }

            this.$sessionManager.createGlobalSettingSessionInstance();
        },

        doCapture(e) {
            if(this.capture) {
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
            let action = (!this.configPannel) ? "open" : "close";
            EventBus.publish("session-config-pannel", action);
            this.setConfigPannel(! this.configPannel);
        },

        async saveCaptureFile() {
            const save_buffer = await powertools.captureStop();
            const coreService = powertools.getService("powertools-core");
            const {canceled, filePath} = await coreService.showSaveDialog({
                defaultPath: `nxshell-capture-${Date.now()}.webm`
            });
            if(canceled) {
                return;
            }
            if(!this.fsClient) {
                this.fsClient = await createLocalFs();
            }
            const w_handle = await this.fsClient.open(filePath, "w");
            await this.fsClient.write(w_handle, save_buffer, 0, save_buffer.length, 0);
            this.fsClient.close(w_handle);
        }
    }
}
</script>

<style lang="scss">
.pt-shell-app-nav-bar {
    position: relative;
    box-sizing: content-box;

    text-align: center;

    padding: {
        top: 36px;
        bottom: 10px;
    }
    width: 100%;
    // 需要减去padding-top和padding-bottom的大小
    height: calc(100% - 46px);

    .pt-avatar {
        cursor: pointer;
    }

    // override list and list-item style
    .pt-list {
        overflow: hidden;
        margin-top: 16px;
        ul {
            border: none;
        }
        
        background-color: transparent;
        .pt-list-item {
            height: 60px;
            line-height: 60px;
            text-align: center;
            color: lightgray;

            &:hover {
                background-color: rgba(255, 255, 255, 0.3);
            }

            &.selected {
                background-color: rgba(0, 0, 0, 0.1);
                color: white;
            }

            .app-icon {
                cursor: pointer;
            }
        }
    }

    .icon-setting-container {
        position: absolute;
        width: 100%;
        bottom: 10px;

        text-align: center;

        .icon-setting {
            color: lightgray;
            cursor: pointer;
        }
        &:hover {
            background-color: var(--lightBackgroundColor);
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