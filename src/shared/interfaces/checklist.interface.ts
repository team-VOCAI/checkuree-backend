export interface IChecklist {
  id: number;
  title: string;
  description?: string;
  tags?: string[];
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChecklistItem {
  id: number;
  checklistId: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
