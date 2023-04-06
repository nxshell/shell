import xtermTheme from "xterm-theme";

import xtermPreviewComponent from "@/views/xterm/xtermPreview.vue"
import { defaultValue } from '@/views/components/session/contants/protocol'

export const configItems = [
    {
        name: "fontFamily",
        title: "home.profile.terminal.font-family.title",
        description: "home.profile.terminal.font-family.description",
        defaultValue: "default",
        type: "select",
        options: [
            {
                label: "home.profile.terminal.font-family.options.default",
                value: "default"
            },
            {
                label: "home.profile.terminal.font-family.options.lucida-console",
                value: "Lucida Console"
            },
            {
                label: "home.profile.terminal.font-family.options.consolas",
                value: "Consolas"
            },
            {
                label: "home.profile.terminal.font-family.options.fira-code",
                value: "Fira Code"
            }
        ]
    },
    {
        name: "xterm",
        title: "home.profile.terminal.xterm.title",
        description: "home.profile.terminal.xterm.description",
        defaultValue: "xterm",
        type: "select",
        options: [
            {
                label: "home.profile.terminal.font-family.options.default",
                value: "default"
            },
            {
                label: "home.profile.terminal.xterm.options.xterm",
                value: "xterm"
            },
            {
                label: "home.profile.terminal.xterm.options.linux",
                value: "linux"
            },
            {
                label: "home.profile.terminal.xterm.options.vt100",
                value: "vt100"
            }
        ]
    },
    {
        name: "fontSize",
        title: "home.profile.terminal.font-size.title",
        description: "home.profile.terminal.font-size.description",
        defaultValue: "14",
        type: "select",
        options: [
            {
                label: "home.profile.terminal.font-family.options.default",
                value: "default"
            },
            {
                label: "home.profile.terminal.font-size.options.n12",
                value: "12"
            },
            {
                label: "home.profile.terminal.font-size.options.n14",
                value: "14"
            },
            {
                label: "home.profile.terminal.font-size.options.n16",
                value: "16"
            },
            {
                label: "home.profile.terminal.font-size.options.n18",
                value: "18"
            },
            {
                label: "home.profile.terminal.font-size.options.n20",
                value: "20"
            },
            {
                label: "home.profile.terminal.font-size.options.n22",
                value: "22"
            },
            {
                label: "home.profile.terminal.font-size.options.n24",
                value: "24"
            },
            {
                label: "home.profile.terminal.font-size.options.n26",
                value: "26"
            },
            {
                label: "home.profile.terminal.font-size.options.n28",
                value: "28"
            },
        ]
    },
    {
        name: "fontWeight",
        title: "home.profile.terminal.font-weight.title",
        description: "home.profile.terminal.font-weight.description",
        defaultValue: "normal",
        type: "select",
        options: [
            {
                label: "home.profile.terminal.font-family.options.default",
                value: "default"
            },
            {
                label: "home.profile.terminal.font-weight.options.normal",
                value: "normal"
            },
            {
                label: "home.profile.terminal.font-weight.options.bold",
                value: "bold"
            },
            {
                label: "home.profile.terminal.font-weight.options.w100",
                value: "100"
            },
            {
                label: "home.profile.terminal.font-weight.options.w200",
                value: "200"
            },
            {
                label: "home.profile.terminal.font-weight.options.w300",
                value: "300"
            },
            {
                label: "home.profile.terminal.font-weight.options.w400",
                value: "400"
            },
            {
                label: "home.profile.terminal.font-weight.options.w500",
                value: "500"
            },
            {
                label: "home.profile.terminal.font-weight.options.w600",
                value: "600"
            },
            {
                label: "home.profile.terminal.font-weight.options.w700",
                value: "700"
            },
            {
                label: "home.profile.terminal.font-weight.options.w800",
                value: "800"
            },
            {
                label: "home.profile.terminal.font-weight.options.w900",
                value: "900"
            }
        ]
    },
    {
        name: "charset",
        title: "home.profile.terminal.charset.title",
        description: "home.profile.terminal.charset.description",
        defaultValue: "UTF-8",
        type: "select",
        options: [
            {
                label: "home.profile.terminal.font-family.options.default",
                value: "default"
            },
            {
                label: "Unicode(UTF-8)",
                value: "UTF-8"
            },
            {
                label: "Chinese(GBK)",
                value: "GBK"
            },
            {
                label: "Chinese(GB2312)",
                value: "GB2312"
            },
            {
                label: "Chinese(GB18030)",
                value: "GB18030"
            },
            {
                label: "Chinese(Windows936)",
                value: "Windows936"
            },
            {
                label: "Chinese(EUC-CN)",
                value: "EUC-CN"
            },
            {
                label: "Chinese(Big5)",
                value: "Big5"
            },
            {
                label: "Chinese(Big5-HKSCS)",
                value: "Big5-HKSCS"
            },
            {
                label: "Korean(KS_C_5601)",
                value: "KS_C_5601"
            },
            {
                label: "Korean(EUC-KR)",
                value: "EUC-KR"
            },
            {
                label: "Japanese(Shift_JIS)",
                value: "Shift_JIS"
            },
            {
                label: "Japanese(EUC-JP)",
                value: "EUC-JP"
            },
            {
                label: "KOI8-R",
                value: "KOI8-R"
            },
            {
                label: "KOI8-U",
                value: "KOI8-U"
            },
            {
                label: "KOI8-RU",
                value: "KOI8-RU"
            },
            {
                label: "KOI8-T",
                value: "KOI8-T"
            },
            {
                label: "ISO-8859-1",
                value: "ISO-8859-1"
            },
            {
                label: "Windows(874)",
                value: "874"
            },
            {
                label: "IBM(866)",
                value: "866"
            }

        ]
    },
    {
        name: 'lineHeight',
        title: 'home.profile.terminal.lineHeight.title',
        description: 'home.profile.terminal.lineHeight.description',
        defaultValue: 1.2,
        type: 'number',
        step: 0.1
    },
    {
        name: 'letterSpacing',
        title: 'home.profile.terminal.letterSpacing.title',
        description: 'home.profile.terminal.letterSpacing.description',
        defaultValue: 1,
        type: 'number',
        step: 1
    },
    {
        name: 'cursorBlink',
        title: 'home.profile.terminal.cursorBlink.title',
        description: 'home.profile.terminal.cursorBlink.description',
        defaultValue: true,
        type: 'switch'
    },
    {
        name: 'cursorStyle',
        title: 'home.profile.terminal.cursorStyle.title',
        description: 'home.profile.terminal.cursorStyle.description',
        defaultValue: 'block',
        type: 'radio-group',
        options: [
            {
                label: '█',
                value: 'block'
            },
            {
                label: '|',
                value: 'bar'
            }, {
                label: '▁',
                value: 'underline'
            },
        ]
    },
    // {
    //     name: "xtermTheme",
    //     title: "home.profile.terminal.xterm-theme.title",
    //     description: "home.profile.terminal.xterm-theme.title",
    //     defaultValue: "AdventureTime",
    //     type: "select",
    //     options: [
    //         {
    //             label: "home.profile.terminal.xterm-theme.options.default",
    //             value: "default"
    //         },
    //         ...Object.keys(xtermTheme).map(themeName => {
    //             return {
    //                 label: themeName,
    //                 value: themeName
    //             };
    //         })
    //     ],
    //     component: xtermPreviewComponent
    // }
]

export const formItem = Object.fromEntries(configItems.flatMap(({ name, defaultValue }) => [[name, defaultValue]]));
export default {}