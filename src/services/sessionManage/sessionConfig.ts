import { ShellConfig } from "./shellConfig";
import { IdGenerator } from "../../../common/utils/idGenerator";

///<reference path="./uuid.d.ts" />
import { v4 as uuidv4 } from "uuid";

export type SessionConfigNodeType = "node" | "folder";

interface SessionFindResult {
    sessionConfig: SessionConfig | null;
    index: number;
};

const sessConfigIdGenerator: IdGenerator = new IdGenerator();

export class SessionConfig {
    private _id: number;
    private parent: SessionConfig | null;
    uuid: string;

    name: string;
    config: ShellConfig | null;
    description: string;
    type: SessionConfigNodeType;

    subSessions: SessionConfig[];

    constructor(name: string, type: SessionConfigNodeType = "node", configParam: ShellConfig | null, description: string = "", uuid: string="") {
        this._id = sessConfigIdGenerator.getNext();
        this.type = type;
        this.name = name;
        this.config = configParam;
        this.description = description;
        this.uuid = uuid || uuidv4();

        this.parent = null;
        this.subSessions = [];
    }

    addSessionConfig(sessionNode: SessionConfig, index?: number) {
        if (this.type === "node") {
            throw new Error("session node can not add sub-config");
        }

        sessionNode.parent = this;
        // emit add-session
    }

    update(name: string="", configParam?: ShellConfig | undefined, description?: string | undefined) {
        if (name) {
            this.name = name;
        }
        if (configParam) {
            this.config = configParam;
        }
        if (description) {
            this.description = description;
        }

        // TODO: update instance
    }

    findSubSessionConfig(id: number): SessionFindResult {
        const ret: SessionFindResult = {
            sessionConfig: null,
            index: -1
        };

        for (let i: number = 0; i < this.subSessions.length; i++) {
            let sessionConfig = this.subSessions[i];
            if (sessionConfig._id === id) {
                ret.sessionConfig = sessionConfig;
                ret.index = i;
                break;
            }
        }

        return ret;
    }

    removeSubSessionConfig(session: SessionConfig | number, move: Boolean = false): void {
        let removeSession: SessionConfig[];
        let removeIdx: number;
        removeIdx = typeof session === "number" ? session : this.subSessions.findIndex((val:SessionConfig) => {
            return val._id = session._id;
        });

        removeSession = this.subSessions.splice(removeIdx, 1);
        if (move) {
            return;
        }

        // 递归删除子节点
        const curRemoveNode: SessionConfig = removeSession[0];
        for (let i: number = curRemoveNode.subSessions.length - 1; i > 0; i--) {
            let sessItem = curRemoveNode.subSessions[i];
            curRemoveNode.removeSubSessionConfig(sessItem);
        }
        // TODO: 通知配置节点被删除
    }

    duplicate(): SessionConfig {
        const duplicate = (parent: SessionConfig): SessionConfig => {
            let config: SessionConfig = new SessionConfig(
                parent.name,
                parent.type,
                parent.config ? parent.config: null,
                parent.description
            );

            parent.subSessions.forEach((subSession) => {
                let newSubSession = duplicate(subSession);
                config.addSessionConfig(newSubSession);
            })

            return config;
        }

        return duplicate(this);
    }

    toJSONObject(recursion?: boolean, id?: boolean): object {
        let subSessions: object[] | null = null;
        if (this.type !== "node" && recursion) {
            subSessions = this.subSessions.map(sessionObj => sessionObj.toJSONObject(!!recursion, !!id));
        }

        const sessObj: {
            name: string,
            config: ShellConfig | null,
            description: string,
            type: SessionConfigNodeType,
            uuid: string,
            subSessions?: object[] | null
        } = {
            name: this.name,
            config: this.config,
            description: this.description,
            type: this.type,
            uuid: this.uuid
        };

        if (subSessions) {
            sessObj.subSessions = subSessions;
        }

        return sessObj;
    }
}