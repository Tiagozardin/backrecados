import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableLogin1628202459780 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name:"login",
                columns:[
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isNullable: false,
                      },
                      {
                        name: "email",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                      },
                      {
                        name: "password",
                        type: "varchar",
                        length: "20",
                        isNullable: false,
                      },
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('login');
    }

}
