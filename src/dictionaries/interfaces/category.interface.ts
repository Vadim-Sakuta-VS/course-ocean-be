import { ICreateSubcategoryGroup } from './subcategory.interface';

export interface ICreateCategory {
  name: string;
}

export interface ICreateCategoryGroup extends ICreateCategory {
  subcategories: ICreateSubcategoryGroup[];
}

export interface ICategory extends ICreateCategory {
  id: string;
}
