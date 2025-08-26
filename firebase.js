// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTF-eHptNuuzDA_Pi5IR5aCJMr__l9f6U",
  authDomain: "imagearchiveauthentication.firebaseapp.com",
  projectId: "imagearchiveauthentication",
  storageBucket: "imagearchiveauthentication.firebasestorage.app",
  messagingSenderId: "463314589071",
  appId: "1:463314589071:web:916ae51c18599c090867fa"
};

// Initialize Firebase


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// const db = getFirestore(app)  // export these two when you can get storage to wrok

// const storage = getStorage(app)



export { auth };