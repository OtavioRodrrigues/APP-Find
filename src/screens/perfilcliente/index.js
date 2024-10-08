import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from './styles';
import api from '../../services/api';

export default function PerfilCliente() {
  const route = useRoute();
  const navigation = useNavigation();
  const { email,id } = route.params || {};

  const [hidePass, setHidePass] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await api.get(`/usuarios/?email=${email}`);
        console.log('Resposta da API:', response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          setUsuario(response.data[0]);
        } else {
          setError('Usuário não encontrado.');
        }
      } catch (error) {
        setError('Erro ao buscar cliente.');
        console.error('Erro ao buscar cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [email]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    senha: '',
    nome: '',
    cpf: '',
    nascimento: '',
    telefone: '',
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    fotoPerfil: ''
  });

  const baseURL = 'http://192.168.15.9:4000/uploads/';

  useEffect(() => {
    if (usuario) {
      console.log('Dados do usuario no useEffect:', usuario);
      const fotoPerfilUrl = baseURL + usuario.fotoPerfil; // Concatenando o caminho base com o nome do arquivo
      console.log('URL da fotoPerfil:', fotoPerfilUrl); // Exibe a URI da imagem no console
      setFormData({
        id: usuario.id,
        email: usuario.email,
        senha: usuario.senha,
        nome: usuario.nome,
        cpf: usuario.cpf,
        nascimento: usuario.dataNasc,
        telefone: usuario.telefone,
        cep: usuario.cep,
        logradouro: usuario.logradouro,
        bairro: usuario.bairro,
        cidade: usuario.cidade,
        fotoPerfil: fotoPerfilUrl 
      });
    }
  }, [usuario]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    console.log(`Atualizando ${field} com valor ${value}`); // Verifique a atualização do estado
    setFormData(prevData => ({ ...prevData, [field]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleConfirm = async () => {
    
    try {
      await api.put(`/usuarios/${id}`, formData);
      Alert.alert('Confirmar', 'As alterações foram salvas.');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar as informações.');
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const handleDeleteAccount = () => {
    const { id, ...data } = formData;
    Alert.alert(
      "Excluir Conta",
      "Tem certeza de que deseja excluir sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: async () => {
            await api.delete(`/usuarios/${id}`, data);
            Alert.alert("Conta excluída com sucesso");
            navigation.navigate('Login');
          }
        }
      ]
    );
  };


 const handleLogoutPress = async () => {
    navigation.navigate('Login');
  };

  const pickImage = async () => {
    //Permissão de acesso à biblioteca de imagens
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //Verificação se a permissão foi correspondida
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Você precisa conceder acesso às suas fotos.");
      return;
    }

    //Criação da variável result para acesso à biblioteca
    const result = await ImagePicker.launchImageLibraryAsync({
      //Define que aperecerá apenas imagens para seleção
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //Define que a imagem poderá ser editada
      allowsEditing: true,
      //Define o fomato da imagem
      aspect: [4, 3],
      //Define a qualidade da imagem
      quality: 1,
    });
  
    //Verifica se a imagem foi selecionada ou cancelada
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      //caso selecionada, é mostrado a URI no console
      console.log('Imagem selecionada:', imageUri); 
      
      // Verifica o estado antes de criar o FormData
      if (!imageUri) {
        console.log('URI da imagem está vazia ou inválida');
        return;
      }
  
      try {
        const formData = new FormData();
        formData.append('fotoPerfil', {
          uri: imageUri,
          type: 'image/jpeg', // ou use image/png se estiver trabalhando com PNG
          name: 'fotoPerfil.jpg', // Nome do arquivo que será enviado
        });
  
        console.log('FormData criado:', formData); // Verifique o FormData antes de enviar
  
        const response = await api.put(`/usuarios/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.status === 200) {
          setFormData(prevData => ({ ...prevData, fotoPerfil: imageUri }));
          console.log('Sucesso', 'Imagem de perfil atualizada!');
        } else {
          console.log('Erro', 'Não foi possível atualizar a imagem.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar a imagem.');
        console.error('Erro ao atualizar imagem:', error);
      }
    } else {
      console.log("Seleção de imagem cancelada");
    }
  };

  if (loading) return <View style={styles.containerPerfil}><Text style={styles.titleText}>Carregando...</Text></View>;
  if (error) return <View style={styles.containerPerfil}><Text style={styles.titleText}>{error}</Text></View>;
  if (!usuario) {
    return (
      <View style={styles.containerPerfil}>
        <Text style={styles.titleText}>Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.background}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            alt="Sua Empresa"
          />
        </TouchableOpacity>
		<View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.containerPerfil}>
        <Text style={styles.titleText}>Seu Perfil</Text>
        <TouchableOpacity onPress={pickImage}>
        <Image
          source={selectedImage ? { uri: selectedImage } : { uri: formData.fotoPerfil }} 
          style={styles.foto}
        alt="Sua foto"
          />
        </TouchableOpacity>
        <Text style={styles.nameText}>{usuario.nome}</Text>
        <Text style={styles.bioText}>{usuario.cidade}</Text>
      </View>

      {/* Conta Section */}
      <View style={styles.containerInfo}>
        <View style={styles.infoPessoal}>
          <Text style={styles.textInfoCont}>Conta</Text>
          <TouchableOpacity onPress={handleEditToggle}>
            <Text style={styles.textInfoCont}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerCard}>
          <View style={[styles.cardInfo, styles.firstCard]}>
            <Text style={styles.textInfo}>Email:</Text>
            {isEditing ? (
              <TextInput
              style={styles.textInput}
              value={formData.email} 
              onChangeText={(text) => handleInputChange('email', text)}
            />
            ) : (
              <Text style={styles.textInfo2}>{formData.email}</Text>
            )}
          </View>
          <View style={[styles.cardInfo, styles.lastCard]}>
            <Text style={styles.textInfo}>Senha:</Text>
            {isEditing ? (
              <View style={styles.inputArea}>
              <TextInput
                style={styles.textInput}
                value={formData.senha}
                onChangeText={(text) => handleInputChange('senha', text)}
                secureTextEntry={hidePass}
              />
              <TouchableOpacity style={styles.icon} onPress={() => setHidePass(!hidePass)}>
              {hidePass ? (
                <Ionicons name="eye-off" color="#000000" size={25}
                 />
              ) : (
                <Ionicons name="eye" color="#000000" size={25}
                 />
              )}
            </TouchableOpacity>
            </View>
              
            ) : (
              <Text style={styles.textInfo2}>{formData.senha}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Perfil Section */}
      <View style={styles.containerInfo}>
        <View style={styles.infoPessoal}>
          <Text style={styles.textInfoCont}>Perfil</Text>
        </View>

        <View style={styles.containerCard}>
          <View style={[styles.cardInfo, styles.firstCard]}>
            <Text style={styles.textInfo}>Nome:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.nome}
                onChangeText={(text) => handleInputChange('nome', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.nome}</Text>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.textInfo}>CPF:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.cpf}
                onChangeText={(text) => handleInputChange('cpf', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.cpf}</Text>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.textInfo}>Data de Nascimento:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.nascimento}
                onChangeText={(text) => handleInputChange('nascimento', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.nascimento}</Text>
            )}
          </View>
          <View style={[styles.cardInfo, styles.lastCard]}>
            <Text style={styles.textInfo}>Telefone:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.telefone}
                onChangeText={(text) => handleInputChange('telefone', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.telefone}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Localização Section */}
      <View style={styles.containerInfo}>
        <View style={styles.infoPessoal}>
          <Text style={styles.textInfoCont}>Localização</Text>
          <TouchableOpacity onPress={handleEditToggle}>
            <Text style={styles.textInfoCont}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerCard}>
          <View style={[styles.cardInfo, styles.firstCard]}>
            <Text style={styles.textInfo}>CEP:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.cep}
                onChangeText={(text) => handleInputChange('cep', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.cep}</Text>
            )}
          </View>

          <View style={[styles.cardInfo]}>
            <Text style={styles.textInfo}>Logradouro:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.logradouro}
                onChangeText={(text) => handleInputChange('logradouro', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.logradouro}</Text>
            )}
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.textInfo}>Bairro:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.bairro}
                onChangeText={(text) => handleInputChange('bairro', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.bairro}</Text>
            )}
          </View>

          <View style={[styles.cardInfo, styles.lastCard]}>
            <Text style={styles.textInfo}>Cidade:</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={formData.cidade}
                onChangeText={(text) => handleInputChange('cidade', text)}
              />
            ) : (
              <Text style={styles.textInfo2}>{formData.cidade}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {isEditing && (
          <>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Excluir Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}