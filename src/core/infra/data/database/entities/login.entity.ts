import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";



@Entity({ name: "login"})
export class LoginEntity extends BaseEntity {
    @PrimaryGeneratedColumn({name:"id"})
    id?: number;

    @Column({name:"email"})
    email: string;

    @Column({name:"password"})
    password: string;

   
    constructor(email:string, password: string, id?: number){
        super();
        this.email = email;
        this.password = password;
        this.id = id;
    }
}
