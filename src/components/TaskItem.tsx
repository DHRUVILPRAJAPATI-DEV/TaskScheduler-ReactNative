import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { PriorityColors } from '../constants/Colors';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void; // New Prop
}

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onPress: () => void; // <--- NEW PROP
}

export const TaskItem: React.FC<Props> = ({ task, onToggle,onPress, onDelete, onEdit }) => {
  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(task.id) }
    ]);
  };

  return (
    <TouchableOpacity style={[styles.container, { borderLeftColor: PriorityColors[task.priority] }]}
    onPress={onPress}
    activeOpacity={0.7}
    >
      <TouchableOpacity onPress={() => onToggle(task.id)} style={styles.checkContainer}>
        <Ionicons 
          name={task.isCompleted ? "checkbox" : "square-outline"} 
          size={24} 
          color={task.isCompleted ? "#aaa" : "#333"} 
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, task.isCompleted && styles.completedText]}>
          {task.title}
        </Text>
        <Text style={styles.details}>
          Priority: {task.priority} • {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {task.note ? <Text style={styles.note} numberOfLines={1}>Note: {task.note}</Text> : null}
      </View>

      {/* Edit Button */}
      <TouchableOpacity onPress={() => onEdit(task)} style={styles.actionBtn}>
        <Ionicons name="pencil-outline" size={20} color="#666" />
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
        <Ionicons name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    marginHorizontal:20
  },
  checkContainer: { paddingRight: 10 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  completedText: { textDecorationLine: 'line-through', color: '#aaa' },
  details: { fontSize: 12, color: '#666', marginTop: 4 },
  note: { fontSize: 12, color: '#888', fontStyle: 'italic',fontWeight:'500' },
  actionBtn: { padding: 8, marginLeft: 4 }, // Added spacing for multiple buttons
});