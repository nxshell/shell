interface UUID {
    v4(): string;
}

declare module "uuid" {
    export = uuid;
}

declare var uuid: UUID;
