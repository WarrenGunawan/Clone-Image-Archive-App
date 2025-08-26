import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/core';

import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

import Entypo from '@expo/vector-icons/Entypo';

const LoginPage = () => {

    const[email, setEmail] = useState('');

    const[password, setPassword] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if(user) {
                navigation.replace('tabs')
            }
        })

        return unsubscribe;
    }), [];


    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password).then(userCredentials => {
            const user = userCredentials.user;
            console.log('Signed in With:', user.email);
            navigation.replace('tabs');
        }).catch(error => alert(error.message))
    }



  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                <View style={styles.headerView}>
                    <Text style={styles.header}>CLONE</Text>
                    <Entypo name="network" size={80} color="white" style={styles.logo} />
                </View>

                <View style={styles.signInContainer}>

                    <Text style={[{ color: 'white', fontSize: 25, paddingVertical: 40, fontWeight: 'bold' }]}>Welcome to Clone!</Text>

                    <View style={styles.inputBox}>
                        <Entypo name="chevron-with-circle-right" size={40} color="white" />
                        <TextInput color={'white'} autoCapitalize='none' placeholderTextColor={'#999999'} placeholder='Email' value={email} onChangeText={text => setEmail(text)} style={styles.input} />
                    </View>
                    <View style={styles.inputBox}>
                        <Entypo name="chevron-with-circle-right" size={40} color="white" />
                        <TextInput color={'white'} autoCapitalize='none' placeholderTextColor={'#999999'} placeholder='Password' value={password} onChangeText={text => setPassword(text)} style={styles.input} secureTextEntry/>
                    </View>


                    <TouchableOpacity style={styles.button} activeOpacity={0.5} onPress={handleSignIn}>
                        <Text style={styles.buttonText}>SIGN IN</Text>
                    </TouchableOpacity>
                </View>

                    <View style={styles.createAccountSection}>
                        <Text style={styles.footerText} >Don't have an account yet?</Text>

                        <TouchableOpacity style={{ marginTop: 5 }} activeOpacity={0.5} onPress={() => navigation.replace('sign up')}>
                            <Text style={styles.createAccountText}>Create an account</Text>
                        </TouchableOpacity>
                    </View>
            </View>
        
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#242424',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
    },

    header: {
        fontSize: 50,
        fontWeight: 'bold',
        color: 'white',
        paddingVertical: 20,
        paddingLeft: 20,
    },

    logo: {
        width: 100,
        height: 100,
        marginHorizontal: 10,
        backgroundColor: '#52b788',
        padding: 10,
        borderRadius: 100,
    },

    inputBox: {
        flexDirection: 'row',
        backgroundColor: '#242424',
        padding: 10,
        marginBottom: 10,
        borderRadius: 30,
    },

    input: {
        marginLeft: 10,
        width: '100%',
    },

    button: {
        backgroundColor: '#52b788',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 100,
        paddingHorizontal: 90,
    },

    buttonText: {
        color: 'white',
        fontSize: 15,
    },
    
    createAccountText: {
        color: '#52b788',
        fontSize: '15',
        textDecorationLine: 'underline',
    },

    createAccountSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },

    signInContainer: {
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        paddingHorizontal: 20,
        paddingBottom: 30,
        width: '80%',
    },

    footerText: {
      color: '#676767',
      fontSize: 15,
    },
})


export default LoginPage;