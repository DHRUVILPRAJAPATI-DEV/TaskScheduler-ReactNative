import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Priority, Task } from '../types/index';
import { PriorityColors } from '../constants/Colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, priority: Priority, date: Date, note: string) => void;
  taskToEdit?: Task | null; // New Optional Prop
}

export const AddTaskModal: React.FC<Props> = ({ visible, onClose, onSubmit, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(1);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  // Pre-fill form when taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setPriority(taskToEdit.priority);
      setDate(new Date(taskToEdit.dueDate));
      setNote(taskToEdit.note || '');
    } else {
      resetFormState(); // Reset if switching to "Add Mode"
    }
  }, [taskToEdit, visible]);

  const resetFormState = () => {
    setTitle('');
    setPriority(1);
    setDate(new Date());
    setNote('');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    // Only validate future date if we are NOT editing (or if the user changed the date to the past)
    // For simplicity, we keep the rule: New data cannot be in the past.
    if (date < new Date() && !taskToEdit) {
      Alert.alert('Error', 'Due date cannot be in the past');
      return;
    }

    onSubmit(title, priority, date, note);
    onClose(); // Close modal immediately
    resetFormState(); // Clean up
  };

  // Date Logic (Same as before)
  const showDatePicker = () => {
    setMode('date');
    setShowPicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);

    if (Platform.OS === 'android' && mode === 'date') {
      setTimeout(() => {
        setMode('time');
        setShowPicker(true);
      }, 100);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.header}>
            {taskToEdit ? 'Edit Task' : 'New Task'}
          </Text>

          <TextInput 
            placeholder="Task Title *" 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
          />

          <Text style={styles.label}>Priority (1 = Highest)</Text>
          <View style={styles.priorityRow}>
            {([1, 2, 3, 4, 5] as Priority[]).map((p) => (
              <TouchableOpacity 
                key={p} 
                style={[
                  styles.priorityBtn, 
                  priority === p && { backgroundColor: PriorityColors[p] }
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={{ color: priority === p ? 'white' : 'black' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Due Date & Time</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={showDatePicker}>
            <Text>{date.toLocaleString()}</Text>
          </TouchableOpacity>
          
          {showPicker && (
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={false}
              display="default"
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          <TextInput 
            placeholder="Note (Optional)" 
            style={styles.input} 
            value={note} 
            onChangeText={setNote}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={{color: 'red'}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>
                {taskToEdit ? 'Update Task' : 'Create Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', paddingVertical: 8, marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  priorityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  priorityBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  dateBtn: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 15 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelBtn: { padding: 10, marginRight: 10 },
  submitBtn: { padding: 10, backgroundColor: '#2196F3', borderRadius: 8 },
});