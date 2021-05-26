
export interface IUserProps {
    id?: number,
    name?: string,
    email?: string,
    password?: string,
}

export class User implements IUserProps{
    id?: number;
    name?: string;
    email?: string;
    password?: string;


    constructor(props: IUserProps) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.password = props.password;
    }
}
