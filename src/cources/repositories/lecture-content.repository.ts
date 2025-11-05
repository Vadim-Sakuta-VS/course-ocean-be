import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IncludeQueryOptions } from './lecture-content.types';
import { BaseRepository } from '../../common/repositories/base.repository';
import { LectureContentEntity } from '../entities/lecture-content.entity';
import { ILectureContent } from '../interfaces/lecture-content.interface';

@Injectable()
export class LectureContentRepository extends BaseRepository<LectureContentEntity> {
  constructor(
    @InjectRepository(LectureContentEntity)
    repository: Repository<LectureContentEntity>,
  ) {
    super(repository);
  }

  async getOneById(id: string, includeOptions?: IncludeQueryOptions) {
    const lecture = await this.repository.findOne({
      where: { id },
      relations: { videoFile: includeOptions?.includeVideoFile },
    });
    if (!lecture) {
      throw new NotFoundException(`Lecture with id ${id} not found`);
    }

    return lecture;
  }

  async getOneByVideoFileId(fileId: string) {
    const lecture = await this.repository.findOne({
      where: { videoFile: { id: fileId } },
      relations: { videoFile: true },
    });
    if (!lecture) {
      throw new NotFoundException(
        `Lecture with video file id ${fileId} not found`,
      );
    }

    return lecture;
  }

  async checkLecturesBelongToAuthor(authorId: string, lectureIds: string[]) {
    const lecturesCount = await this.repository.count({
      where: { id: In(lectureIds), section: { course: { authorId } } },
    });

    return lectureIds.length === lecturesCount;
  }

  async deleteBulkByIds(ids: string[]) {
    await this.repository.delete({
      id: In(ids),
    });

    return {
      deletedIds: ids,
    };
  }

  updateOne(entity: Partial<ILectureContent>) {
    return this.repository.save(entity);
  }
}
