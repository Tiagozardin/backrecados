import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import LoginRoutes from "../../../../../features/login/presentation/routes";
import { LoginEntity } from "./index";

  

  
  @Entity({ name: "recados"})
  export class RecadoEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: string;

    @Column({ name: "id_login" })
    loginID: string;

    @Column({name: 'titulo'})
    titulo: string;
  
    @Column({name: 'descricao'})
    descricao: string;
  
    @ManyToOne(() => LoginEntity, (login) => login.id)
    @JoinColumn({ name: "id_login", referencedColumnName: "id" })
    login?: LoginRoutes
  
    constructor(titulo: string, descricao: string, loginID: string) {
      super();
      this.titulo = titulo;
      this.descricao = descricao;
      this.loginID = loginID;
    }
   
  }
  