import { ICreateTopic } from './topic.interface';

export interface ICreateSubcategory {
  name: string;
  categoryId?: string;
}

export interface ICreateSubcategoryGroup extends ICreateSubcategory {
  topics: ICreateTopic[];
}

export interface ISubcategory extends ICreateSubcategory {
  id: string;
}
