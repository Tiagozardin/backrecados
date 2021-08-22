import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";



@Entity({ name: "login"})
export class LoginEntity extends BaseEntity {
    @PrimaryGeneratedColumn({name:"id"})
    id?:string;

    @Column({name:"email"})
    email: string;

    @Column({name:"password"})
    password: string;

   
    constructor(email:string, password: string, id?:string){
        super();
        this.email = email;
        this.password = password;
        this.id = id;
    }
}
