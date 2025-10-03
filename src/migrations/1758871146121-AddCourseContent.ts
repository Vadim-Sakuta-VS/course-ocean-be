import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddCourseContent1758871146121 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE course_level_enum as ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')",
    );
    await queryRunner.query("CREATE TYPE language_enum as ENUM ('EN', 'RU')");
    await queryRunner.createTable(
      new Table({
        name: 'courses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'author_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'topic_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'short_description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'course_level_enum',
            isNullable: true,
          },
          {
            name: 'language',
            type: 'language_enum',
            isNullable: true,
          },
          {
            name: 'learning_skills',
            type: 'text[]',
            default: `'{}'`,
          },
          {
            name: 'requirements',
            type: 'text[]',
            default: `'{}'`,
          },
          {
            name: 'cover_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'numeric(8,2)',
            isNullable: true,
          },
          {
            name: 'discount',
            type: 'smallint',
            isNullable: true,
          },
          {
            name: 'discount_start_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'discount_end_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_reviews_enabled',
            type: 'boolean',
            default: false,
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
            columnNames: ['author_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['topic_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'topics',
            onDelete: 'RESTRICT',
          },
        ],
        checks: [
          {
            name: 'chk_price_positive_or_nil',
            expression: '"price" >= 0',
          },
          {
            name: 'chk_discount_positive',
            expression: '"discount" > 0',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'section_content',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'smallint',
          },
          {
            name: 'course_id',
            type: 'uuid',
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
            columnNames: ['course_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'courses',
            onDelete: 'CASCADE',
          },
        ],
        checks: [
          {
            name: 'chk_order_positive',
            expression: '"order" > 0',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'lecture_content',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'video_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_preview_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'smallint',
          },
          {
            name: 'section_content_id',
            type: 'uuid',
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
            columnNames: ['section_content_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'section_content',
            onDelete: 'CASCADE',
          },
        ],
        checks: [
          {
            name: 'chk_order_positive',
            expression: '"order" > 0',
          },
          {
            name: 'chk_duration_positive',
            expression: '"duration" > 0',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lecture_content');
    await queryRunner.dropTable('section_content');
    await queryRunner.dropTable('courses');
    await queryRunner.query('DROP TYPE IF EXISTS language_enum');
    await queryRunner.query('DROP TYPE IF EXISTS course_level_enum');
  }
}
