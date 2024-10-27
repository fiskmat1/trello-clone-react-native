import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { QrCode, Bell, User, House, Search } from 'lucide-react-native'; // Importing Lucide icons
import { SafeAreaView } from 'react-native-safe-area-context';
import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";
import { View } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { StatusBar } from 'expo-status-bar';

const Layout = () => {
  return (
    <>
    <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderTopWidth: 0, // Remove the top border from the tab bar
        },
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Hem',
          tabBarIcon: ({ size, color }) => (
            <House size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Sök',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} /> // Using Lucide's QrCode icon
          ),
          
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Skanna',
          tabBarIcon: ({ size, color }) => (
            <QrCode size={size} color={color} />
          ),
          tabBarStyle: {
            backgroundColor: 'transparent', // Transparent background for scan tab
            position: 'absolute', // Make the tab bar float
            borderTopWidth: 0, // Remove the top border
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
          },
          tabBarActiveTintColor: 'white'
        }}
        
      />
      <Tabs.Screen
        name="notifications"
        options={{
          headerStyle: {
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
            borderBottomWidth: 0, // Hide the bottom border
          },
          title: 'Notiser',
          tabBarIcon: ({ size, color }) => (
            <Bell size={size} color={color} /> // Using Lucide's Bell icon for notifications
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          headerStyle: {
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
            borderBottomWidth: 0, // Hide the bottom border
          },
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} /> // Using Lucide's User icon for the profile
          ),
        }}
      />
    </Tabs>
    </>
  );
};

export default Layout;
