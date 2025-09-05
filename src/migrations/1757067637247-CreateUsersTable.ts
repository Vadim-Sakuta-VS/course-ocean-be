import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1757067637247 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'STUDENT')`,
    );
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'roles',
            type: 'user_role_enum[]',
            isNullable: false,
            default: `'{STUDENT}'`,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'hashed_password',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
            default: 'NULL',
          },
          {
            name: 'account_deletion_date',
            type: 'timestamp',
            isNullable: true,
            default: 'NULL',
          },
          {
            name: 'is_two_factor_enabled',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'users_otp',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'two_factor_code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users_otp');
    await queryRunner.dropTable('users');
    await queryRunner.query('DROP TYPE IF EXISTS user_role_enum');
  }
}
