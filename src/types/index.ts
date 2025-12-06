export type Priority = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string; // ISO String for storage
  note?: string;
  isCompleted: boolean;
}

export interface TaskSection {
  title: string;
  data: Task[];
}