import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserCourseLecturesProgressTable1761650128702
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_course_lectures_progress',
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
            name: 'lecture_content_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'is_completed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_position_seconds',
            type: 'integer',
            isNullable: true,
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
          {
            columnNames: ['lecture_content_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'lecture_content',
            onDelete: 'RESTRICT',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_course_lectures_progress');
  }
}
