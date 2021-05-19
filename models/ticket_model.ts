
export interface ITicketProps{
    id?: number,
    name?: string,
    description?: string,
    assignee?: number,
    id_user?: number,
    id_state?: number
}

export class Ticket implements ITicketProps{
    id?: number;
    name?: string;
    description?: string;
    assignee?: number;
    id_user?: number;
    id_state?: number;


    constructor(props: ITicketProps) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.assignee = props.assignee;
        this.id_user = props.id_user;
        this.id_state = props.id_state;
    }
}
