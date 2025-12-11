import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, FlatList, Text, StyleSheet, TouchableOpacity, 
  StatusBar, ActivityIndicator, RefreshControl, TextInput, ScrollView 
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
  
  const [selectedCategory, setSelectedCategory] = useState<string>('Today');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const priorityColorsMap: Record<number, string> = {
    1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#3498db', 5: '#2ecc71',
  };

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

  const saveTask = (title: string, priority: Priority, date: Date, note: string) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, title, priority, dueDate: date.toISOString(), note } : t));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title, priority, dueDate: date.toISOString(), note, isCompleted: false,
      };
      setTasks(prev => [...prev, newTask]);
    }
    setEditingTask(null);
  };

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const sections = groupTasks(filteredTasks);

  const getCategoryTheme = (title: string) => {
    switch (title) {
      case 'Overdue': return { bg: '#ffebee', text: '#d32f2f', border: '#ef5350' };
      case 'Today': return { bg: '#e3f2fd', text: '#1976d2', border: '#42a5f5' };
      case 'Tomorrow': return { bg: '#fff3e0', text: '#f57c00', border: '#ffa726' };
      case 'Upcoming': return { bg: '#e8f5e9', text: '#388e3c', border: '#66bb6a' };
      default: return { bg: '#f5f5f5', text: '#333', border: '#ccc' };
    }
  };

  const rawCategoryData = sections.find(s => s.title === selectedCategory)?.data || [];
  const activeListData = filterPriority === 'All' ? rawCategoryData : rawCategoryData.filter(t => t.priority === filterPriority);

  // --- 1. HEADER CONTENT: Only Grid + Filters (Search removed) ---
  const headerContent = (
    <View style={{ paddingTop: 10 }}> 
      {/* Grid Cards */}
      <View style={styles.gridContainer}>
        {sections.map((section) => {
          const theme = getCategoryTheme(section.title);
          const isSelected = selectedCategory === section.title;
          return (
            <TouchableOpacity 
              key={section.title}
              style={[
                styles.card, 
                { backgroundColor: theme.bg, borderColor: isSelected ? theme.border : 'transparent' },
                isSelected && styles.selectedCardShadow
              ]}
              onPress={() => {
                setSelectedCategory(section.title);
                setFilterPriority('All');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{section.title}</Text>
                <View style={[styles.countBadge, { backgroundColor: theme.text }]}>
                  <Text style={styles.countText}>{section.data.length}</Text>
                </View>
              </View>
              <Text style={[styles.cardSubtitle, { color: theme.text, opacity: 0.8 }]}>
                {section.data.length === 1 ? '1 Task' : `${section.data.length} Tasks`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List Title */}
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderTitle}>{selectedCategory} Tasks</Text>
      </View>

      {/* Priority Filters */}
      <View style={{ marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterPriority === 'All' && { backgroundColor: '#333', borderColor: '#333' }]}
            onPress={() => setFilterPriority('All')}
          >
            <Text style={[styles.filterText, filterPriority === 'All' && { color: 'white' }]}>All</Text>
          </TouchableOpacity>

          {[1, 2, 3, 4, 5].map((p) => {
            const isSelected = filterPriority === p;
            const color = priorityColorsMap[p];
            return (
              <TouchableOpacity
                key={p}
                style={[styles.filterChip, isSelected && { backgroundColor: color, borderColor: color }]}
                onPress={() => setFilterPriority(p as Priority)}
              >
                <Text style={[styles.filterText, isSelected && { color: 'white' }]}>P{p}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* FIXED HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Scheduler</Text>
        <TouchableOpacity onPress={() => { setEditingTask(null); setModalVisible(true); }}>
          <Ionicons name="add-circle" size={40} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* 2. FIXED SEARCH BAR: Placed here so it stays at the top */}
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

      {/* SCROLLABLE CONTENT */}
      <FlatList
        data={activeListData}
        ListHeaderComponent={headerContent} 
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem 
            task={item} 
            onToggle={toggleTask} 
            onDelete={deleteTask} 
            onEdit={handleEditTask}
            onPress={() => navigation.navigate('TaskDetail', { task: item, onToggle: toggleTask, onDelete: deleteTask, onEdit: handleEditTask })} 
          />
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="filter-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {filterPriority !== 'All' ? `No Priority ${filterPriority} tasks` : `No tasks in "${selectedCategory}"`}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />
        }
      />

      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={saveTask} taskToEdit={editingTask} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  
  // Search is now fixed, removed 'margin' and used 'padding' container style
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', marginHorizontal: 20, marginBottom: 5, paddingHorizontal: 15, borderRadius: 12, height: 50 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  card: { width: '48%', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 2 },
  selectedCardShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, elevation: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 13, fontWeight: '500' },

  listHeaderContainer: { paddingHorizontal: 20, marginBottom: 10 },
  listHeaderTitle: { fontSize: 20, fontWeight: '700', color: '#333' },

  filterContainer: { paddingHorizontal: 20, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', marginRight: 8 },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingBottom: 50 },
  emptyText: { marginTop: 10, color: '#888', fontSize: 16 },
});