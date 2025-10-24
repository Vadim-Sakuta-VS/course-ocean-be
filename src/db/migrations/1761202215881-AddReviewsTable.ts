import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddReviewsTable1761202215881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE reaction_enum AS ENUM ('LIKE', 'DISLIKE')",
    );
    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'text_content',
            type: 'text',
          },
          {
            name: 'rating',
            type: 'smallint',
          },
          {
            name: 'likes',
            type: 'integer',
            default: 0,
          },
          {
            name: 'dislikes',
            type: 'integer',
            default: 0,
          },
          {
            name: 'course_id',
            type: 'uuid',
          },
          {
            name: 'author_id',
            type: 'uuid',
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
            columnNames: ['course_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'courses',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['author_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'review_reactions',
        columns: [
          {
            name: 'author_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'review_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'type',
            type: 'reaction_enum',
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
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['review_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'reviews',
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reviews');
    await queryRunner.dropTable('review_reactions');
    await queryRunner.query('DROP TYPE IF EXISTS reaction_enum');
  }
}
