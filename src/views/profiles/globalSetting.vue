<template>
    <div class="global-profile">
        <pt-row>
            <pt-col :span="6">
                <div class="nav-tree-container">
                    <pt-tree :treeData="navList"
                        dataKey="name"
                        @tree-node-select="handleNavToSection"
                    ></pt-tree>
                </div>

            </pt-col>
            <pt-col :span="18">
                <div class="profile-container">
                    <pt-profile-view v-model="profileData"
                        :sections="profiles"
                        :simple="false"
                        :curSection="profileCurSection"
                    />
                </div>
                <div class="operator-container">
                    <pt-button type="primary" className="btn-save" @click="handleSaveClick">{{ T("home.profile.operator.save") }}</pt-button>
                </div>
            </pt-col>
        </pt-row>
    </div>
</template>

<script>
import PtProfileView from "../components/profile/profileview";
import xtermThemeProfile from "./xtermTheme";

import * as globalSetting from "../../services/globalSetting";

function getDefaultProfileData(profileItems) {
    let ret = globalSetting.getProfile("xterm");
    if (ret) {
        return ret;
    }

    ret = {};

    profileItems.forEach(item => {
        ret[item.name] = item.defaultValue;
    });

    return ret;
}

export default {
    name: "PtShellProfile",
    components: {
        PtProfileView
    },
    data() {
        return {
            navList: [
                {
                    name: "terminal",
                    text: "home.profile.terminal.title"
                },
                {
                    name: "system",
                    text: "home.profile.system.title"
                }
            ],
            profiles: [
                {
                    title: "home.profile.terminal.title",
                    name: "terminal",
                    items: xtermThemeProfile.configItems
                },
                {
                    title: "home.profile.system.title",
                    name: "system",
                    items: [
                        {
                            name: "language",
                            title: "home.profile.system.language.title",
                            description: "home.profile.system.language.description",
                            defaultValue: "en-US",
                            type: "select",
                            options: [
                                {
                                    label: "home.profile.system.language.options.en-US",
                                    value: "en-US"
                                },
                                {
                                    label: "home.profile.system.language.options.zh-CN",
                                    value: "zh-CN"
                                }
                            ]
                        },
                        // {
                        //     name: "theme",
                        //     title: "home.profile.system.theme.title",
                        //     description: "home.profile.system.theme.description",
                        //     defaultValue: "dark",
                        //     type: "select",
                        //     options: [
                        //         {
                        //             label: "home.profile.system.theme.options.dark",
                        //             value: "dark"
                        //         },
                        //         {
                        //             label: "home.profile.system.theme.options.light",
                        //             value: "light"
                        //         }
                        //     ]
                        // },
                        {
                            name: "nxconfig",
                            title: "home.profile.system.nxconfig.title",
                            description: "home.profile.system.nxconfig.description",
                            defaultValue: "",
                            type: "folder"
                        }
                    ]
                }
            ],
            profileCurSection: "base",
            profileData: {}
        };
    },

    computed: {
    },

    created() {
        this.profileData = getDefaultProfileData(xtermThemeProfile.configItems);
        this.$nextTick(() => {
            this.reOptions();
        })
    },

    mounted() {
    },

    methods: {
        updateSessionConfig() {
            return globalSetting.setProfile("xterm", this.profileData)
        },

        navToSectionByName(name) {
            this.profileCurSection = name;
        },

        handleNavToSection({data}) {
            this.navToSectionByName(data.name);
        },

        async handleSaveClick() {
            await this.updateSessionConfig();
            const sessionInst = this.$sessionManager.getSessionInstanceById(this.$route.params.sessionId);
            sessionInst.close();
        },

        async reOptions() {
            //font family reset
            let profiles = this.profiles;
            let index = profiles.findIndex((e) => {
                return e.name === 'terminal'
            })
            let item = profiles[index];
            let fontList = await this.font_list();
            if(!fontList) {
                return;
            }
            item.items[0].options = fontList;
            this.$set(this.profiles, index, item);
        },

        async font_list() {
            const service = powertools.getService();
            let _fonts = await service.getSystemFonts();
            let fontOptions = null;
            if(_fonts) {
                fontOptions = ['default', ..._fonts].map(f => {
                    return {
                        label: f,
                        value: f
                    };
                })
            }
            return fontOptions;
        }

    }
}
</script>

<style lang="scss">
.global-profile {
    position: relative;
    background-color: var(--n-bg-color-base);

    width: 100%;
    height: 100%;

    .pt-row {
        height: 100%;

        .pt-col {
            position: relative;
            height: 100%;
        }
    }

    .nav-tree-container {
        padding: {top: 15px; bottom: 15px;};
        color: var(--n-text-color-base);
    }

    .profile-container {
        position: relative;
        height: calc(100% - 120px);
    }

    .pt-tree {
        .pt-tree-item {
            &:hover {
                background-color: transparent !important;
            }

            &.selected {
                background-color: transparent !important;
                .text {
                    border-radius: 3px;
                    padding-left: 2px;
                    padding-right: 2px;

                    font-weight: bold;

                    background-color: var(--primaryColor) !important;
                    color: var(--n-text-color-base);
                }
            }
        }
    }

    .operator-container {
        position: absolute;
        z-index: 9999;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 120px;
        line-height: 120px;
        vertical-align: middle;
        text-align: right;
    }

    .btn-save {
        margin-right: 20px;
    }

    .btn-save-connect {
        margin-right: 60px;
    }
}
</style>