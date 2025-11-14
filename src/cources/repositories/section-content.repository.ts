import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SectionContentEntity } from '../entities/section-content.entity';

@Injectable()
export class SectionContentRepository extends BaseRepository<SectionContentEntity> {
  constructor(
    @InjectRepository(SectionContentEntity)
    repository: Repository<SectionContentEntity>,
  ) {
    super(repository);
  }

  async checkSectionsBelongToAuthor(authorId: string, sectionIds: string[]) {
    const sectionsCount = await this.repository.count({
      where: { id: In(sectionIds), course: { authorId } },
    });

    return sectionIds.length === sectionsCount;
  }

  async deleteBulkByIds(ids: string[]) {
    await this.repository.delete({
      id: In(ids),
    });

    return {
      deletedIds: ids,
    };
  }
}
