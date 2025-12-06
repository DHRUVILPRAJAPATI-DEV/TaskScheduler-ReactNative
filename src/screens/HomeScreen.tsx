import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, SectionList, Text, StyleSheet, TouchableOpacity, 
  StatusBar, ActivityIndicator, RefreshControl, TextInput 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Task, Priority } from '../types/index';
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/storage';
import { groupTasks } from '../utils/taskLogic';
import { TaskItem } from '../components/TaskItem';
import { AddTaskModal } from '../components/AddTaskModal';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // 1. New State for Search
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
    const intervalId = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isLoading) saveTasksToStorage(tasks);
  }, [tasks, isLoading]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const loaded = await loadTasksFromStorage();
      setTasks(loaded);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNow(new Date());
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const saveTask = (title: string, priority: Priority, date: Date, note: string) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, title, priority, dueDate: date.toISOString(), note } 
          : t
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        priority,
        dueDate: date.toISOString(),
        note,
        isCompleted: false,
      };
      setTasks(prev => [...prev, newTask]);
    }
    setEditingTask(null);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // 2. Filter Logic: Filter tasks BEFORE grouping
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Group the filtered results
  const sections = groupTasks(filteredTasks);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Tasks...</Text>
      </View>
    );
  }

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem 
      task={item} 
      onToggle={toggleTask} 
      onDelete={deleteTask} 
      onEdit={handleEditTask}
      onPress={() => navigation.navigate('TaskDetail', { 
        task: item, 
        onToggle: toggleTask, 
        onDelete: deleteTask, 
        onEdit: handleEditTask
      })} 
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Scheduler</Text>
        <TouchableOpacity onPress={handleAddTask}>
          <Ionicons name="add-circle" size={40} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* 4. Search Bar UI */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, title === 'Overdue' ? { color: 'red' } : {}]}>
            {title}
          </Text>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 10 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? "No matching tasks found." : "No tasks! Add one to get started."}
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} tintColor="#2196F3" />
        }
      />

      <AddTaskModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={saveTask} 
        taskToEdit={editingTask} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, color: '#666' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  
  // Search Styles
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    marginHorizontal: 16, 
    marginTop: 16, 
    paddingHorizontal: 10, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#ddd',
    height: 45
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },

  sectionHeader: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10, color: '#444' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' }
});