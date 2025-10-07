import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AddGoogleAndGithubAuth1758200332133 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE auth_provider_enum AS ENUM ('GOOGLE', 'GITHUB')`,
    );
    await queryRunner.createTable(
      new Table({
        name: 'user_providers',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          }),
          new TableColumn({
            name: 'provider_id',
            type: 'varchar',
            length: '100',
          }),
          new TableColumn({
            name: 'type',
            type: 'auth_provider_enum',
          }),
          new TableColumn({
            name: 'user_id',
            type: 'uuid',
          }),
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.query(`
     ALTER TABLE users
     ALTER COLUMN password DROP NOT NULL,
     ALTER COLUMN password SET DEFAULT NULL,
     ALTER COLUMN last_name DROP NOT NULL,
     ALTER COLUMN last_name SET DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_providers');
    await queryRunner.query('DROP TYPE IF EXISTS auth_provider_enum');
  }
}
