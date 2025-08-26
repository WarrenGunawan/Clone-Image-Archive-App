import{ View } from 'react-native'
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screens/HomePage';
import Profile from '../Screens/ProfilePage';
import Camera from '../Screens/CameraPage';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const getIconName = (routeName) => {
  switch (routeName) {
    case 'home':
      return { focused: 'home', unfocused: 'home-outline' };
    case 'camera':
      return { focused: 'camera', unfocused: 'camera-outline'};
    case 'profile':
      return { focused: 'person', unfocused: 'person-outline'};
    default:
      return { focused: 'ellipse', unfocused: 'ellipse-outline' }; 
  }
};

const Tabs = () => {
  return (
    <Tab.Navigator 
        initialRouteName='home'
        screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#52b788',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarIcon: ({ focused, color }) => {
        
        const iconNames = getIconName(route.name);
        const iconName = focused ? iconNames.focused : iconNames.unfocused;
        return (
          <Ionicons name={iconName} size={30} color={color} />
        )}
    })}
    >
        <Tab.Screen options={{title: 'Camera'}} name='camera' component={Camera} />
        <Tab.Screen options={{title: 'Home'}} name='home' component={Home} />
        <Tab.Screen options={{title: 'Profile'}} name='profile' component={Profile} />
    </Tab.Navigator>
  )
}

export default Tabs