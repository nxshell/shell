import { EventBus } from "../../common/nxsys/eventbus";

let globalEventBus: EventBus;

function initialize(): void {
    globalEventBus = new EventBus();
}

export function getGlobalEventBus(): EventBus {
    return globalEventBus;
}

export declare type EventType = "instance-created" | "instance-updated" | "instance-destroyed"| "instance-close" |
                                "session-created"  | "session-update"   | "session-destroyed" | "session-added"  | "session-removed" | "create-session" | "create-session-folder";

export function subscript(evtType: EventType, handler: Function): void {
    globalEventBus.subscript(evtType, handler);
}

export function unsubscript(evtType: EventType, handler: Function): void {
    globalEventBus.unsubscript(evtType, handler);
}

export function publish(evtType: EventType, payload: any): void {
    globalEventBus.publish(evtType, payload);
}

export function remove(evtType: EventType): void {
    globalEventBus.removeall(evtType);
}

initialize();