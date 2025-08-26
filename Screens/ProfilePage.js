import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, TouchableNativeFeedback } from 'react-native'
import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { onAuthStateChanged } from 'firebase/auth';

import { Entypo } from '@expo/vector-icons';

const ProfilePage = () => {

  const PROFILE_KEY = (uid) => `profile_photo_filename:${uid}`;
  const USER_DIR = (uid) => FileSystem.documentDirectory + `users/${uid}/`;

  const[profileUri, setProfileUri] = useState(null);
  const[cacheBuster, setCacheBuster] = useState(0);
  const[email, setEmail] = useState('');
  const[name, setName] = useState('')
  const[uid, setUid] = useState(null);

  const sanitizeExt = (uri) => {
    const raw = (uri.split('.').pop() || 'jpg').toLowerCase();
    return raw.replace(/\?.*$/, '');
  }

  const ensureUserDir = async (uid) => {
    await FileSystem.makeDirectoryAsync(USER_DIR(uid), { intermediates: true });
  };

  const pickProfilePhoto = async () => {
    if (!uid) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker?.MediaType?.Image ?? ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) return;

    try {
      const asset = result.assets[0];
      const ext = sanitizeExt(asset.uri);
      const newFileName = `profile.${ext}`;
      const target = USER_DIR(uid) + newFileName;
      await ensureUserDir(uid);

      const oldFileName = await AsyncStorage.getItem(PROFILE_KEY(uid));
      if(oldFileName) {
        const oldUri = USER_DIR(uid) + oldFileName;
        const toDelete = oldFileName === newFileName ? target : oldUri;
        await FileSystem.deleteAsync(toDelete, { idempotent: true }).catch(()=> {});
      }

      await FileSystem.copyAsync({from: asset.uri, to: target});
      await AsyncStorage.setItem(PROFILE_KEY(uid), newFileName);

      setProfileUri(target);
      setCacheBuster(Date.now());

    } catch (err) {
      console.warn('Failed to set profile photo', err)
      Alert.alert('Error', 'Could not set that image')
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if(user) {
        setEmail(user.email);
        setName(user.displayName);
        setUid(user.uid);

        await ensureUserDir(user.uid);

        const filename = await AsyncStorage.getItem(PROFILE_KEY(user.uid));
        if(filename) {
          const uri = USER_DIR(user.uid) + filename;
          const info = await FileSystem.getInfoAsync(uri);

          if(info.exists) {
            setProfileUri(uri);
          } else {
            await AsyncStorage.removeItem(PROFILE_KEY(user.uid));
            setProfileUri(null);
          }
        } else {
          setProfileUri(null);
        }
      } else {
        setEmail(null);
        setName(null);
        setUid(null);
        setProfileUri(null);
      }
    });
    return unsub;
  }, []);

  const navigation = useNavigation();

  const handleSignOut = () => {
    signOut(auth).then(() => { console.log('Signed Out'); navigation.replace('login')}).catch(error => console.log(error))
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.header}>Profile</Text>
        
        <View style={styles.mainBox}>

          <View style={[{ borderRadius: 200, borderColor: '#52b788', borderWidth: 5, }]}>
            {profileUri ? (
              <Image 
                source={{uri: cacheBuster ? `${profileUri}?v=${cacheBuster}` : profileUri}} 
                style={styles.profileImage} 
                onError={(e) => console.warn('Image load error:', profileUri, e.nativeEvent?.error)} 
              />
            ) : (
              <TouchableOpacity onPress={pickProfilePhoto} activeOpacity={0.8}>
                <View style={styles.profileEmpty}>
                  <Entypo name="plus" size={150} color='white' />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {profileUri && (
            <TouchableOpacity> 
              <Text style={[{ color: 'white', fontWeight: 600, fontSize: 15, marginTop: 20 }]} onPress={pickProfilePhoto} >Edit Image</Text>
            </TouchableOpacity>
          )}

          <View style={styles.textEmail}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{name ?? 'No data'}</Text>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email ?? 'Not signed in'}</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.5} style={styles.button} onPress={handleSignOut} >
          <Text style={styles.buttonText} >Log Out</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient colors={['rgba(0,0,0,0.70)', 'rgba(0,0,0,0)']} style={styles.gradient}/>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242424',
  },

  button: {
    backgroundColor: '#52b788',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 100,
    paddingHorizontal: 70,
  },

  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },

  mainBox: {
    backgroundColor: 'black',
    borderRadius: 40,
    width: 350,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    paddingVertical: 30,
    borderWidth: 10,
  },

  gradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },

  profileEmpty: {
    borderRadius: 100,
    borderColor: 'black',
    borderWidth: 3,
  },
  
  label: { 
    color: '#9ca3af', fontSize: 14, marginBottom: 6 
  },

  value: { 
    color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 6 
  },

  textEmail: {
    marginTop: 20,
  },  

  header: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    zIndex: 1000,
    marginTop: 50,
  },

  profileImage: {
    height: 200, 
    width: 200,
    overflow: 'hidden',
    borderRadius: 100,
    borderWidth: 10,
  }
})

export default ProfilePage;