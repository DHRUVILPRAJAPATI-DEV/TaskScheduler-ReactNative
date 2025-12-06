// src/screens/TaskDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PriorityColors } from '../constants/Colors';
import { Task } from '../types/index';

export default function TaskDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const insets = useSafeAreaInsets();
  
  // We receive the task and the action functions via params
  const { task: initialTask, onToggle, onDelete, onEdit } = route.params as any;

  // Local state to update UI immediately when toggling inside this screen
  const [task, setTask] = useState<Task>(initialTask);

  const handleToggle = () => {
    // 1. Update local UI
    const updatedTask = { ...task, isCompleted: !task.isCompleted };
    setTask(updatedTask);
    
    // 2. Notify Home Screen to update real state
    onToggle(task.id);
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          onDelete(task.id);
          navigation.goBack(); // Return to Home after delete
        }
      }
    ]);
  };

  const handleEdit = () => {
    navigation.goBack(); // Go back to Home
    // We need a small timeout to let the navigation animation finish before opening the modal
    setTimeout(() => {
      onEdit(task); 
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Custom Header for Detail View */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Badge */}
        <View style={[
          styles.statusBadge, 
          { backgroundColor: task.isCompleted ? '#e0e0e0' : PriorityColors[task.priority] + '20' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: task.isCompleted ? '#666' : PriorityColors[task.priority] }
          ]}>
            {task.isCompleted ? "COMPLETED" : "IN PROGRESS"}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, task.isCompleted && styles.completedTitle]}>
          {task.title}
        </Text>

        {/* Meta Data */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Ionicons name="flag" size={20} color={PriorityColors[task.priority]} />
            <Text style={styles.metaText}>Priority {task.priority}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.metaText}>
              {new Date(task.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          </View>
        </View>

        {/* Note Section */}
        {task.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Notes:</Text>
            <Text style={styles.noteText}>{task.note}</Text>
          </View>
        ) : (
          <Text style={styles.emptyNote}>No notes provided.</Text>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.footer, {paddingBottom: insets.bottom}]}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleToggle}>
          <Ionicons 
            name={task.isCompleted ? "close-circle-outline" : "checkmark-circle-outline"} 
            size={24} 
            color={task.isCompleted ? "#666" : "#2ecc71"} 
          />
          <Text style={styles.actionText}>{task.isCompleted ? "Mark Undone" : "Mark Done"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
          <Ionicons name="create-outline" size={24} color="#2196F3" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',marginTop:50, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 5 },
  content: { padding: 24 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 15 },
  statusText: { fontWeight: '700', fontSize: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  completedTitle: { color: '#aaa', textDecorationLine: 'line-through' },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingBottom: 20, borderBottomWidth: 1, borderColor: '#eee' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 16, color: '#555' },
  noteBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 },
  noteLabel: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 8 },
  noteText: { fontSize: 16, color: '#444', lineHeight: 24 },
  emptyNote: { fontStyle: 'italic', color: '#999' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20,paddingHorizontal:10, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  actionBtn: { alignItems: 'center', gap: 4,flex:1 },
  actionText: { fontSize: 12, color: '#555' },
});