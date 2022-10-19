<template>
    <div class="pt-welcome">
        <h1>NxShell</h1>
        <div class="sub-header">{{T("home.welcome.subtitle")}}</div>
        <div class="container">
            <div class="left-container">
                <section>
                    <h2>{{ T("home.welcome.start") }}</h2>
                    <div class="link-line">
                        <a href="javascript:;" @click="createSession">{{ T("home.welcome.create-session") }}</a>
                    </div>
                    <div class="link-line" @click="createSessionFolder">
                        <a href="javascript:;">{{ T("home.welcome.create-session-folder") }}</a>
                    </div>
                </section>
                <section>
                    <h2>{{ T("home.welcome.recents") }}</h2>
                    <div
                        v-for="(recent, idx) in recentList" :key="idx"
                        class="link-line">
                        <a href="javascript:;" @click="startSession(recent.uuid)">{{ recent.name }}</a>
                    </div>
                    <div v-if="recentList.length == 0" class="no-data">{{ T("home.welcome.no-recents") }}</div>
                </section>
                
            </div>
            <div class="right-container">
                <section>
                    <h2>{{ T("home.welcome.support-nxshell") }}</h2>
                    <div class="link-line">
                        <a href="javascript:;" @click="gotoFeedback">{{ T("home.welcome.goto-feedback-github") }}</a>
                    </div>
                    <div class="link-line">
                        <a href="javascript:;" @click="gotoDonate">{{ T("home.welcome.donate") }}</a>
                    </div>
                    <div class="link-line">
                        <a href="javascript:;" @click="gotoVersion">{{ T("home.welcome.software-version") + " : " + softwareVersion() }}</a>
                    </div>
                </section>
                <section>
                    <h2>{{ T("home.welcome.thanks") }}</h2>
                    <ul class="contributer-list">
                        <li v-for="(contributer, idx) in contributers" :key="'c'+idx"
                            class="link-line">
                            <a>{{ contributer.user_name }}</a>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import CloudService from "@/services/cloudService";

import * as EventBus from "../services/eventbus";

export default {
    name: "PtWelcome",
    data() {
        return {
            recentList: [],
            contributers: [],
            updateFunc: null
        };
    },

    created() {
        this.init();
    },

    methods: {
        init() {
            const recent = this.$sessionManager.getSessionRecent();
            this.recentList = recent.getRecentList(10);
            this.updateFunc = () => {
                this.recentList = recent.getRecentList(10);
            }
            recent.on("recent-update", this.updateFunc);

            CloudService.oauth.getContributers().then((res) => {
                this.contributers = res.data.contributers;
                console.log('res----anzh',res)
            });
        },

        startSession(uuid) {
            const sessCfg = this.$sessionManager.getSessionConfigByUUID(uuid);
            if (!sessCfg) {
                return;
            }
            this.$sessionManager.createSessionInstance(sessCfg);
        },

        createSession() {
            EventBus.publish("create-session");
        },

        createSessionFolder() {
            EventBus.publish("create-session-folder");
        },

        gotoFeedback() {
            const feedbackUrl = "https://github.com/nxshell/nxshell/issues";
            powertools.openExterUrl(feedbackUrl);
        },
        gotoVersion() {
            const releases = "https://github.com/nxshell/nxshell/releases";
            powertools.openExterUrl(releases);
        },
        gotoDonate(){
            const releases = "http://106.15.238.81:52080/donate/";
            powertools.openExterUrl(releases);
        },
        softwareVersion() {
            return powertools.getVersion();
        }
    },

    beforeDestroy() {
        const recent = this.$sessionManager.getSessionRecent();
        recent.off("recent-update", this.updateFunc);
    }
}
</script>

<style lang="scss">
//@import "~@/assets/scss/default.scss";

.pt-welcome {
    position: relative;
    padding: 20px 60px;
    width: 100%;
    height: 100%;
    background-color: var(--backgroundColor);

    h1 {
        margin-bottom: 12px;
        font-size: 32px;
        color: var(--primaryTextColor);
    }

    .sub-header {
        margin-bottom: 40px;
        font-size: 20px;
        color: var(--secondaryTextColor);
    }

    section {
        margin-bottom: 30px;
        font-size: 14px;

        h2 {
            margin-bottom: 20px;
            font-size: 20px;
            color: var(--primaryTextColor);
        }

        .link-line {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 14px;

            a {
                color: var(--primaryTextColor);
                &:visited {
                    color: var(--secondaryTextColor);
                }
            }
        }

        .no-data {
            color: var(--primaryTextColor);
        }
        
        .contributer-list {
            max-height: 350px;
            overflow-y: scroll;
        }
    }

    .container {
        display: flex;
        justify-content: space-between;

        .left-container {
            width: 300px;
        }

        .right-container {
            // width: 60%;
            flex-grow: 1;
        }
    }
}
</style>
