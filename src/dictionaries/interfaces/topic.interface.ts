export interface ICreateTopic {
  name: string;
  subcategoryId?: string;
}

export interface ITopic extends ICreateTopic {
  id: string;
}
