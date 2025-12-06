import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/index';

const STORAGE_KEY = '@tasks_v1';

export const saveTasksToStorage = async (tasks: Task[]) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
};

export const loadTasksFromStorage = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load tasks', e);
    return [];
  }
};