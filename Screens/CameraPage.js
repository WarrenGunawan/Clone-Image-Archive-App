import { StyleSheet, Text, View, SafeAreaView, Button, Image, Dimensions, Platform, TouchableOpacity } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import Animated, { useSharedValue, clamp, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth } from '../firebase';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { onAuthStateChanged } from 'firebase/auth';

const USER_DIR = (uid) => FileSystem.documentDirectory + `users/${uid}/`;
const PHOTOS_FILE = (uid) => USER_DIR(uid) + 'photos.json';



const CameraPage = () => {
  let cameraRef = useRef(null);

  const [uid, setUid] = useState(null);
  const [zoom, setZoom] = useState(0);
  const zoomShared = useSharedValue(0);
  const startZoom = useSharedValue(0);

  const pinch = Gesture.Pinch().onStart(() => {startZoom.value = zoomShared.value}).onUpdate((e) => {
    const next = clamp(startZoom.value + (e.scale - 1) * 0.23, 0, 1);
    zoomShared.value = next;
    runOnJS(setZoom)(next);
  })


  const navigation = useNavigation();

  const[permission, requestPermission] = useCameraPermissions();
  const[photo, setPhoto] = useState(null);
  const[facing, setFacing] = useState('back');

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);


  const takePic = async () => {
    const options = { quality: 1, base64: false, exif: false };
    const newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };


  const savePhotoToGallery = async () => {
    try {
      const newID = uuid.v4();
      const fileExt = photo.uri.split('.').pop() || 'jpg';
      const newFilePath = `${FileSystem.documentDirectory}${newID}.${fileExt}`;

      await FileSystem.copyAsync({
        from: photo.uri,
        to: newFilePath,
      })

      const {width, height} = await new Promise((resolve, reject) => {
        Image.getSize(newFilePath, (w, h) => resolve({ width: w, height: h }), reject);
      });

      const newPhotoObj = {
        id: newID,
        uri: newFilePath,
        width,
        height,
      };

      let existingPhotos = [];
      const fileInfo = await FileSystem.getInfoAsync(PHOTOS_FILE(uid));
      if(fileInfo.exists) {
        const saved = await FileSystem.readAsStringAsync(PHOTOS_FILE(uid));
        existingPhotos = JSON.parse(saved);
      }

      const updatedPhotos = [...existingPhotos, newPhotoObj];
      await FileSystem.writeAsStringAsync(PHOTOS_FILE(uid), JSON.stringify(updatedPhotos))

      setPhoto(null)
      navigation.navigate('home');
    } catch (err) {
      console.error('Error Saving Photo:', err);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        await FileSystem.makeDirectoryAsync(USER_DIR(user.uid), { intermediates: true })
      } else {
        setUid(null);
      }
    });
    return unsub;
  }, []);


  if (!permission) return <Text>Requesting permissions...</Text>;
  if (!permission.granted) return <Text>Permission for camera not granted. Please change in settings</Text>;


  if (photo) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.previewContainer}>

          <Image style={styles.previewImg} source={{ uri: photo.uri }}/>

          <View style={styles.backButton}>
            <TouchableOpacity activeOpacity={0.6} onPress={() => setPhoto(null)}>
              <FontAwesome name="angle-left" size={70} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.saveButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={savePhotoToGallery}>
              <Ionicons name="checkmark-done-sharp" size={55} color="white" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} onPress={() => setPhoto(null)}>
              <Ionicons name="reload-circle" size={55} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.blackBar}/>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.cameraFrame}>
        <GestureDetector gesture={pinch}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            // iOS can honor ratio; Android usually ignores it, so the frame controls the look
            {...(Platform.OS === 'ios' ? { ratio: '16:9' } : {})}
            zoom={zoom}
          />
        </GestureDetector>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={takePic} activeOpacity={0.6}>
          <Ionicons name="add-circle-outline" size={90} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.flipButton}>
        <TouchableOpacity onPress={toggleFacing} activeOpacity={0.6}>
          <FontAwesome name="refresh" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'flex-end'
  },

  cameraFrame: {
    width: Dimensions.get('window').width,
    aspectRatio: 9 / 16,
    overflow: 'hidden',
    borderRadius: 30,
  },

  controls: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },

  flipButton: {
    position: 'absolute',
    top: 100,
    right: 30,
  },

  previewContainer: {
    flex: 1,
    backgroundColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 70,
  },

  previewImg: {
    width: Dimensions.get('window').width - 50,
    height: Dimensions.get('window').height * 0.7,
    resizeMode: 'cover',
    borderRadius: 15,      
    backgroundColor: 'black',
    marginBottom: 60,
  },

  saveButtonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#52b788',
    borderRadius: 50,
    padding: 10,
    bottom: 5,
  },

  backButton: {
    position: 'absolute',
    gap: 50,
    flexDirection: 'row',
    left: 35,
    bottom: 10,
  },
  
  blackBar: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'black',
    padding: 30,
    width: '100%',
  },
})

export default CameraPage;