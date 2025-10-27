import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserCoursesTable1761559590855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE payment_status_enum as ENUM ('PENDING', 'APPROVED', 'REJECTED')",
    );
    await queryRunner.createTable(
      new Table({
        name: 'user_courses',
        columns: [
          {
            name: 'user_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'course_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'status',
            type: 'payment_status_enum',
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'numeric(8,2)',
          },
          {
            name: 'sale_date',
            type: 'timestamptz',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['course_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'courses',
            onDelete: 'RESTRICT',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_courses');
    await queryRunner.query('DROP TYPE IF EXISTS payment_status_enum');
  }
}
