import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddFilesTable1760944504073 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('courses', 'cover_url');
    await queryRunner.dropColumns('lecture_content', ['duration', 'video_url']);
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'original_filename',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'storage_filename',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'provider_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'size',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'duration',
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
      }),
    );
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar_file_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.addColumns('courses', [
      new TableColumn({
        name: 'duration',
        type: 'integer',
        isNullable: true,
      }),
      new TableColumn({
        name: 'cover_file_id',
        type: 'uuid',
        isNullable: true,
      }),
    ]);
    await queryRunner.addColumn(
      'lecture_content',
      new TableColumn({
        name: 'video_file_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'courses',
      new TableForeignKey({
        columnNames: ['cover_file_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'files',
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'lecture_content',
      new TableForeignKey({
        columnNames: ['video_file_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'files',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'courses',
      new TableColumn({
        name: 'cover_url',
        type: 'text',
        isNullable: true,
      }),
    );
    await queryRunner.addColumns('lecture_content', [
      new TableColumn({
        name: 'duration',
        type: 'integer',
        isNullable: true,
      }),
      new TableColumn({
        name: 'video_url',
        type: 'text',
        isNullable: true,
      }),
    ]);
    await queryRunner.dropColumn('users', 'avatar_file_id');
    await queryRunner.dropColumns('courses', ['duration', 'cover_file_id']);
    await queryRunner.dropColumn('lecture_content', 'video_file_id');
    await queryRunner.dropTable('files');
  }
}
