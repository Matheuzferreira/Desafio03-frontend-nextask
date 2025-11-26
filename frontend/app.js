import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { registerRootComponent } from 'expo';

const API_URL = 'http://192.168.1.12:3000/tarefas'; 

export default function App() {
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoTitulo, setEditandoTitulo] = useState('');

  const fetchTarefas = async (query = '') => {
    try {
      const endpoint = query ? `${API_URL}/buscar?query=${query}` : API_URL;
      const response = await fetch(endpoint);
      const data = await response.json();
      setTarefas(data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      Alert.alert("Erro de Conexão", "Verifique o servidor ou a porta.");
    }
  };

  useEffect(() => {
    fetchTarefas();
  }, []);

  const handleBusca = () => {
    fetchTarefas(termoBusca);
  };

  const handleAddTarefa = async () => {
    if (novaTarefa.trim() === '') return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: novaTarefa }),
      });
      
      if (response.ok) {
        setNovaTarefa('');
        fetchTarefas(termoBusca);
      } else {
         throw new Error("Falha ao adicionar.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível adicionar.");
    }
  };

  const handleToggleConcluida = async (id, concluida) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluida: !concluida }),
      });

      if (response.ok) {
        fetchTarefas(termoBusca);
      } else {
         throw new Error("Falha ao atualizar.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  };

  const handleDeleteTarefa = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        fetchTarefas(termoBusca);
      } else {
         throw new Error("Falha ao deletar.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível deletar.");
    }
  };

  const handleSalvarEdicao = async (id) => {
    if (editandoTitulo.trim() === '') return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editandoTitulo }),
      });

      if (response.ok) {
        setEditandoId(null);
        setEditandoTitulo('');
        fetchTarefas(termoBusca);
      } else {
        throw new Error("Falha ao salvar edição.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar a edição.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      
      {editandoId === item.id ? (
        <View style={styles.inputEdicaoContainer}>
          <TextInput
            style={styles.inputEdicao}
            value={editandoTitulo}
            onChangeText={setEditandoTitulo}
            autoFocus
          />
          <TouchableOpacity onPress={() => handleSalvarEdicao(item.id)}>
            <AntDesign name="checkcircle" size={20} color="#2ecc71" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => handleToggleConcluida(item.id, item.concluida)}
          style={styles.textContainer}
        >
          <Text style={[styles.titulo, item.concluida && styles.tituloConcluida]}>
            {item.titulo}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.actionsContainer}>
        {editandoId !== item.id && (
          <TouchableOpacity onPress={() => {
            setEditandoId(item.id);
            setEditandoTitulo(item.titulo);
          }} style={styles.iconButton}>
            <Feather name="edit" size={20} color="#3498db" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={() => handleDeleteTarefa(item.id)} style={styles.iconButton}>
          <AntDesign name="close" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>NexTask</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { width: '70%' }]}
          placeholder="Buscar tarefas..."
          placeholderTextColor="#666"
          value={termoBusca}
          onChangeText={setTermoBusca}
        />
        <TouchableOpacity onPress={handleBusca} style={styles.searchButton}>
          <Feather name="search" size={20} color="#121212" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova tarefa..."
          placeholderTextColor="#666"
          value={novaTarefa}
          onChangeText={setNovaTarefa}
        />
        <TouchableOpacity onPress={handleAddTarefa} style={styles.addButton}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
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
    backgroundColor: '#121212',
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#1f1f1f',
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  list: {
    flex: 1,
    paddingTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2c3e50',
    marginBottom: 10,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titulo: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  tituloConcluida: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
    padding: 5,
  },
  inputEdicaoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputEdicao: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#2ecc71',
    color: '#fff',
    paddingVertical: 4,
    marginRight: 10,
    fontSize: 16,
  }
});

registerRootComponent(App);