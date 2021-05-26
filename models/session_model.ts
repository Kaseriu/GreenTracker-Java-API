
export interface ISessionProps {
    sessionId?: number;
    token?: string;
    userId?: number;
}

export class Session implements ISessionProps {
    sessionId?: number;
    token?: string;
    userId?: number;

    constructor(properties: ISessionProps) {
        this.sessionId = properties.sessionId;
        this.token = properties.token;
        this.userId = properties.userId;
    }
}
