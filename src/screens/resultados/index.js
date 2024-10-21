import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function Resultados({ route }) {
  const { resultados } = route.params;

  const renderItem = ({ item }) => {
    // Verifica se o item é um lojista ou um produto
    const isLojista = item.nomeEmpresa !== undefined; // Supondo que lojistas têm a propriedade 'nomeEmpresa'
    
    return (
      <View style={styles.itemContainer}>
        {isLojista ? (
          <>
            <Text style={styles.nomeLoja}>{item.nomeEmpresa}</Text>
            <Text style={styles.distancia}>{item.distanciaFormatada}</Text>
          </>
        ) : (
          <>
            <Text style={styles.nomeProduto}>{item.nome}</Text> {/* Supondo que produtos têm a propriedade 'nome' */}
            <Text style={styles.preco}>Preço: {item.preco}</Text> {/* Supondo que produtos têm a propriedade 'preco' */}
            <Text style={styles.lojista}>Lojista: {item.lojista.nomeEmpresa}</Text> {/* Nome do lojista */}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={resultados}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()} // Certifique-se que o 'id' é uma string
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  itemContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  nomeLoja: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nomeProduto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distancia: {
    fontSize: 14,
    color: '#666',
  },
  preco: {
    fontSize: 16,
    color: '#333',
  },
  lojista: {
    fontSize: 14,
    color: '#666',
  },
});
