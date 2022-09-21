export interface IProfileViewSectionItem {
    name: string,
    title: string,
    description: string,
    defaultValue: string | number | object,
    type: "text" | "password" | "number" | "file" | "select",
    options?: {
        label: string,
        value: string | number
    },
    component?: object
}

export interface IProfileViewSection {
    title: string,
    name: string,
    items: IProfileViewSectionItem[];
}
