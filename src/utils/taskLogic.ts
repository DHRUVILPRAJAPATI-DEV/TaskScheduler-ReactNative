import { Task, TaskSection } from '../types/index';

// Helper to check dates without time
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// 3. Sorting Logic (Required) 
export const sortTasks = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    // 4. Completed tasks always at the bottom [cite: 35]
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;

    // 1. Priority tasks with priority 1 come first [cite: 32]
    if (a.priority !== b.priority) return a.priority - b.priority;

    // 2. Due date earliest due time first [cite: 33]
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;

    // 3. Title alphabetical order [cite: 34]
    return a.title.localeCompare(b.title);
  });
};

// 2. Task List Display (Grouped View) 
export const groupTasks = (tasks: Task[]): TaskSection[] => {
  const now = new Date(); 
  // We still need 'today' for the "Today" bucket logic for future tasks
  const today = new Date(); 

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sections: { [key: string]: Task[] } = {
    Overdue: [],
    Today: [],
    Tomorrow: [],
    Upcoming: [],
  };

  tasks.forEach((task) => {
    const taskDate = new Date(task.dueDate);

    // CHANGED LOGIC:
    // If the task time is strictly before NOW, it is Overdue.
    // This includes tasks from yesterday AND tasks from 1 minute ago today.
    if (taskDate < now) {
      sections['Overdue'].push(task);
    } 
    // If it's not overdue, but still on the same calendar day, it's "Today" (meaning later today)
    else if (isSameDay(taskDate, today)) {
      sections['Today'].push(task);
    } 
    else if (isSameDay(taskDate, tomorrow)) {
      sections['Tomorrow'].push(task);
    } 
    else {
      sections['Upcoming'].push(task);
    }
  });

  return [
    { title: 'Overdue', data: sortTasks(sections['Overdue']) },
    { title: 'Today', data: sortTasks(sections['Today']) },
    { title: 'Tomorrow', data: sortTasks(sections['Tomorrow']) },
    { title: 'Upcoming', data: sortTasks(sections['Upcoming']) },
  ].filter((section) => section.data.length > 0);
};