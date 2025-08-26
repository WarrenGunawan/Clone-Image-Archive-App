import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/core';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

import Entypo from '@expo/vector-icons/Entypo';

const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];

const SignUp = () => {

    const[email, setEmail] = useState('');
    
    const[password, setPassword] = useState(''); //setPassword and setEmail are for the text boxes that update this state whenever the user types in their information

    const[name, setName] = useState('');

    const navigation = useNavigation();

    const isValidEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.toLowerCase())) return false;

      const domain = email.split("@")[1].toLowerCase();
      return allowedDomains.includes(domain);
    };

    const handleSignUp = () => {
      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

        createUserWithEmailAndPassword(auth, email, password).then(async (userCredentials) => {
            const user = userCredentials.user;

            const formattedName = name.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

            await updateProfile(user, {
              displayName: formattedName,
        })

            console.log('Registered With:', user.email, 'Name:', formattedName);
            navigation.replace('tabs');
        }).catch(error => alert(error.message))
    };
    
  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                <View style={styles.headerView}>
                    <Text style={styles.header}>CLONE</Text>
                    <Entypo name="network" size={80} color="white" style={styles.logo} />
                </View>

                <View style={styles.signUpContainer}>
                    <Text style={[{ color: 'white', padding: 30, fontSize: 30, fontWeight: 'bold' }]}>Sign Up!</Text>

                    <View style={styles.inputBox}>
                        <TextInput color={'white'} autoCapitalize='words' autoCorrect={false} placeholderTextColor={'#999999'} placeholder='Name' value={name} onChangeText={text => setName(text)} style={styles.input} />
                    </View>
                    <View style={styles.inputBox}>
                        <TextInput color={'white'} autoCapitalize='none' placeholderTextColor={'#999999'} placeholder='Email' value={email} onChangeText={text => setEmail(text)} style={styles.input} />
                    </View>
                    <View style={styles.inputBox}>
                        <TextInput color={'white'} autoCapitalize='none' placeholderTextColor={'#999999'} placeholder='Password' value={password} onChangeText={text => setPassword(text)} style={styles.input} secureTextEntry/>
                    </View>


                    <TouchableOpacity style={styles.button} activeOpacity={0.5} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>SIGN UP</Text>
                    </TouchableOpacity>
                </View>

                    <View style={styles.backToLoginSection}>
                        <Text style={styles.footerText}>Already have an account?</Text>

                        <TouchableOpacity onPress={() => navigation.replace('login')}>
                          <Text style={styles.backToLoginText}> Log in</Text>
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

    text: {
        color: 'black',
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
        padding: 10,
        marginHorizontal: 40,

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

    signUpContainer: {
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        paddingHorizontal: 20,
        paddingBottom: 30,
        width: '80%',
    },

    backToLoginText: {
        color: '#52b788',
        fontSize: '15',
        textDecorationLine: 'underline',
    },

    backToLoginSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        flexDirection: 'row',
    },

    footerText: {
      color: '#676767',
      fontSize: 15,
    },
})

export default SignUp