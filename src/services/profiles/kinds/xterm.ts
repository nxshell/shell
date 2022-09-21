export interface IXtermProfile {
    xterm: "xterm" | "linux" | "vt100";
    fontName?: string;
    fontSize: number;
    fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
    xtermTheme: string;
}

export function getDefaultIXtermProfile(): IXtermProfile {
    return {
        xterm: "xterm",
        fontSize: 14,
        fontWeight: "normal",
        xtermTheme: "default",
    };
}