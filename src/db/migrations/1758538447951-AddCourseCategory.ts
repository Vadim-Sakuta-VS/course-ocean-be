import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddCourseCategory1758538447951 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
        ],
        indices: [{ columnNames: ['name'] }],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'subcategories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'category_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
            onDelete: 'CASCADE',
          },
        ],
        indices: [{ columnNames: ['name'] }],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'topics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'subcategory_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['subcategory_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'subcategories',
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('topics');
    await queryRunner.dropTable('subcategories');
    await queryRunner.dropTable('categories');
  }
}
