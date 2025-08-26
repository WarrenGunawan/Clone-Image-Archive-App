import React, { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/core';

import Login from './LoginPage';
import Tabs from './Navigation/Tabs';
import SignUp from './Navigation/SignUp';

const Stack = createNativeStackNavigator();

console.log('app is loading');

export default function App() {

  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName='login'>
        <Stack.Screen options={{headerShown: false}} name='login' component={Login} />
        <Stack.Screen options={{headerShown: false}} name='sign up' component={SignUp} />
        <Stack.Screen options={{headerShown: false}} name='tabs' component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
}

