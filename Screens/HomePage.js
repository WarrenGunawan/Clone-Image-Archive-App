import { Animated, Dimensions, StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, Image as RNImage, Alert } from 'react-native';
import MasonryList from 'react-native-masonry-list';
import { LinearGradient } from 'expo-linear-gradient';
import uuid from 'react-native-uuid';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';


const USER_DIR = (uid) => FileSystem.documentDirectory + `users/${uid}/`;
const PHOTOS_FILE = (uid) => USER_DIR(uid) + 'photos.json';


const HomePage = () => {

  const[photos, setPhotos] = useState([]);
  const[selectedImage, setSelectedImage] = useState(null);
  const[uid, setUid] = useState(null);


  const handleDelete = async () => {
    if (!selectedImage) return;

    try {
      setPhotos(prev => {
        const updated = prev.filter(photo => photo.id !== selectedImage.id);
        
        if(selectedImage.uri?.startsWith(FileSystem.documentDirectory)) {
          FileSystem.deleteAsync(selectedImage.uri, { idempotent: true }).catch(err => console.warn('File delete error:', err));
        }

        FileSystem.writeAsStringAsync(PHOTOS_FILE(uid), JSON.stringify(updated));
        return updated;
      });

      setSelectedImage(null);
    } catch (err) {
      console.error('Delete Error', err);
    }
  };

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if(user) {
          setUid(user.uid);
          await FileSystem.makeDirectoryAsync(USER_DIR(user.uid), { intermediates: true });
          await loadPhotos(user.uid);
        } else {
          setUid(null);
          setPhotos([]);
        }
      });
      return unsub;
    }, []);

    useEffect(() => {
      (async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(status !== 'granted') {
          Alert.alert('Permission Denied', ' We need access to your media library')
        }
      })();
    }, []);

     const pickFromLibrary = async () => {
      if(!uid) return;

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission denied", "We need access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Image selection canceled or failed.');
        return;
      }

      const selected = result.assets[0];
      const newID = uuid.v4();
      const fileExt = selected.uri.split('.').pop();
      const newFilePath = `${USER_DIR(uid)}${newID}.${fileExt}`;

      try {
        await FileSystem.copyAsync({
          from: selected.uri,
          to: newFilePath,
        })

        const withPhotoId = {
          ...selected,
          id: newID,
          uri: newFilePath
        };

        setPhotos(prev => {
          const updated = [...prev, withPhotoId];
          FileSystem.writeAsStringAsync(PHOTOS_FILE(uid), JSON.stringify(updated));
          return updated;
        });

      } catch (err) {
        console.error('Failed to copy image:', err);
      }
    };


    const loadPhotos = async (uid) => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(PHOTOS_FILE(uid));
        if(!fileInfo.exists) {
          return;
        }

        const saved = await FileSystem.readAsStringAsync(PHOTOS_FILE(uid));
        const parsed = JSON.parse(saved);
        setPhotos(parsed);
      } catch (err) {
        console.error('Failed to load saved Photos: ', err);
      }
    }


    useFocusEffect(
      useCallback(() => {
        if(!uid) return;
        const load = async () => {
          const info = await FileSystem.getInfoAsync(PHOTOS_FILE(uid));
          if(!info.exists) return;
          const json = await FileSystem.readAsStringAsync(PHOTOS_FILE(uid));
          setPhotos(JSON.parse(json))
        };

        load();
      }, [uid])
    );

  return (
    <View style={styles.container} >

      <View style={styles.header}>
        <Text style={styles.headerText}>Gallery</Text>

        <TouchableOpacity onPress={pickFromLibrary} activeOpacity={0.5} style={[{ borderColor:'white', borderWidth: 4.5, borderRadius: 50, marginTop: 15 }]}>
          <Entypo name="plus" size={50} color='white' />
        </TouchableOpacity>
      </View>
      
      
        <MasonryList 
          key={photos.length === 0 ? 'empty' : 'filled'}
          listContainerStyle={{ paddingTop: 130, paddingBottom: 50, }}
          images={photos.map(photo => ({
            source: { uri: photo.uri },
            width: photo.width,
            height: photo.height,
            id: photo.id,
            aspectRatio: photo.width/photo.height,
            activeOpacity: 0.8,
            onPress: () => setSelectedImage(photo), 
          }))}
          imageContainerStyle={{
            borderRadius: 12,
            overflow: 'hidden',
          }}
          columns={2}
          spacing={2}
          backgroundColor="#242424"
          onPressImage={item => item.onPress?.()}
        /> 
      
      {/* {photos.length === 0 && (
        <View style={styles.____Container}>
        </View>
      )} */}

      {selectedImage && (
        

        <View style={styles.overlayContainer}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={0.5}
            onPress={() => setSelectedImage(null)} // close on tap
          />

          <View style={styles.backButtonsContainer}>
            <TouchableOpacity onPress={() => {setSelectedImage(null)}} style={{ flexDirection: 'row' }}>
              <Ionicons name='chevron-back' size={40} color='white'/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {setSelectedImage(null)}} style={[{ flexDirection: 'row' }]}>
              <Octicons name='x-circle' size={40} color='white' />
            </TouchableOpacity>
          </View>

          {/* Centered image */}
          <Image
            source={{ uri: selectedImage.uri }}
            style={{
              width: Dimensions.get('window').width - 40,
              margin: 20,
              aspectRatio: selectedImage.width / selectedImage.height,
              borderRadius: 12,
              maxHeight: Dimensions.get('window').height * 0.7,
            }}
            resizeMode='contain'
          />

          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity onPress={() => {handleDelete()}}>
              <Feather name="trash-2" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <LinearGradient colors={['rgba(0,0,0,0.70)', 'rgba(0,0,0,0)']} style={styles.gradient}/>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',  
    alignItems: 'center', 
    paddingRight: 30,
  },

  headerText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    padding: 10,
    marginTop: 10,
  },

  masonListContainer: {
    flex: 1,
    paddingTop: 130,
  },

  gradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },

  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    paddingTop: 50,
  },

  overlayBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },

  backButtonsContainer: {
    position: 'absolute',
    top: 65,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
    width: '100%',
    paddingHorizontal: 20,
  },

  deleteButtonContainer: {
    position: 'absolute',
    bottom: 20,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
})

export default HomePage