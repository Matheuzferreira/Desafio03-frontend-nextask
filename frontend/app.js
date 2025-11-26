import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';

// URL da API configurada com o IP local
const API_URL = 'http://192.168.1.12:3000/tarefas'; 

export default function App() {
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');

  // READ: Busca a lista de tarefas do backend
  const fetchTarefas = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTarefas(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao backend. Verifique o IP e se o servidor está rodando.");
    }
  };

  useEffect(() => {
    fetchTarefas();
  }, []);

  // CREATE: Adiciona nova tarefa
  const handleAddTarefa = async () => {
    if (novaTarefa.trim() === '') return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: novaTarefa }),
      });
      
      if (response.ok) {
        const nova = await response.json();
        setTarefas([...tarefas, nova]);
        setNovaTarefa('');
      } else {
         throw new Error("Falha ao adicionar tarefa.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível adicionar a tarefa.");
    }
  };

  // UPDATE: Marca/desmarca como concluída
  const handleToggleConcluida = async (id, concluida) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluida: !concluida }),
      });

      if (response.ok) {
        // Atualiza o estado localmente após sucesso no backend
        setTarefas(tarefas.map(t => 
          t.id === id ? { ...t, concluida: !concluida } : t
        ));
      } else {
         throw new Error("Falha ao atualizar tarefa.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
    }
  };

  // DELETE: Remove uma tarefa
  const handleDeleteTarefa = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        // Remove do estado localmente após sucesso
        setTarefas(tarefas.filter(t => t.id !== id));
      } else {
         throw new Error("Falha ao deletar tarefa.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível deletar a tarefa.");
    }
  };

  // Renderiza cada item da lista
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        onPress={() => handleToggleConcluida(item.id, item.concluida)}
        style={styles.textContainer}
      >
        <Text style={[styles.titulo, item.concluida && styles.tituloConcluida]}>
          {item.titulo}
        </Text>
      </TouchableOpacity>
      <Button 
        title="X" 
        color="#e74c3c"
        onPress={() => handleDeleteTarefa(item.id)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Lista de Tarefas - NexTask</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova tarefa..."
          value={novaTarefa}
          onChangeText={setNovaTarefa}
        />
        <Button title="Adicionar" onPress={handleAddTarefa} />
      </View>
      
      <FlatList
        data={tarefas}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#ecf0f1',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 5,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titulo: {
    fontSize: 18,
  },
  tituloConcluida: {
    textDecorationLine: 'line-through',
    color: '#7f8c8d',
  },
});