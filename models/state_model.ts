
export interface IStateProps {
    id?: number,
    name?: string
}

export class State implements IStateProps{
    id?: number;
    name?: string;


    constructor(props: IStateProps) {
        this.id = props.id;
        this.name = props.name;
    }
}
