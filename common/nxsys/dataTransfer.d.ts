import { EventEmitter } from "events";

export declare type NxDataTransferEvents = "prepare" | "transferring" | "finished" | "abort" | "error" | "filecreated" | "ask";
export declare type NxDataTransferType = "file" | "dir";
export declare type NxDataTransferUserAction = "retry" | "overwrite" | "rename" | "skip" | "cancel" | "merge" | "ask";

export declare interface NxTransferMessage {
    event: NxDataTransferEvents;
    args?: any;
}

export declare interface NxTransferDataDesc {
    nodeUUID: string;
    path: string;
    type?: NxDataTransferType;
    connId?: number;
    createFolder?: boolean;
}

export declare interface NxTransferAnswers {
    overwrite: {
        action: "ask" | "merge" | "skip",
        keep: boolean
    },
    merge: {
        action: "ask" | "overwrite" | "skip",
        keep: boolean;
    }
}

export declare class NxDataTransfer extends EventEmitter {
    _setFrom(from: NxTransferDataDesc): Promise<void>;
    _setTo(to: NxTransferDataDesc): Promise<void>;
    _bindChannel(channelId: number): void;
    answer(action: NxDataTransferUserAction, keep: boolean): void;
    startTransferring(): void;
}
