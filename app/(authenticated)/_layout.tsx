import { usePush } from '@/hooks/usePush';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, View, Alert, Share as RNShare } from 'react-native';
import { ArrowLeft, Heart, Share as ShareIcon } from 'lucide-react-native';
import React, { useState } from 'react';


const Layout = () => {
  usePush();
  const router = useRouter();

  // State to track if the heart icon is pressed (favorited)
  const [isFavorited, setIsFavorited] = useState(false);

  // Function to toggle the heart's state
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  // Function to handle the iOS native share functionality
  const handleShare = async () => {
    try {
      const result = await RNShare.share({
        message: 'Check out this organization on ClientClub!',
        url: 'https://yourwebsite.com', // Optional, URL to be shared
        title: 'Organization Details', // Optional, title of the shared content
      });
      
      if (result.action === RNShare.sharedAction) {
        if (result.activityType) {
          // User shared via specific activity type
          console.log('Shared via', result.activityType);
        } else {
          // User shared but no specific activity chosen
          console.log('Shared');
        }
      } else if (result.action === RNShare.dismissedAction) {
        // User dismissed the share dialog
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      

      <Stack.Screen
        name="organization/[id]"
        options={{
          headerShown: true,
          title: '',
          headerBackTitleVisible: false, // Hide the default back title
          headerStyle: {
            backgroundColor: '#fff', // Customize as needed
          },
          headerShadowVisible: false, // Remove the bottom border/shadow

          // Custom back button using lucide-react-native
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ArrowLeft stroke="black" size={22} />
            </TouchableOpacity>
          ),

          // Custom right-side icons (Heart and Share)
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 10 }}>
              {/* Heart icon with toggle state */}
              <TouchableOpacity onPress={toggleFavorite} style={{ marginRight: 15 }}>
                <Heart
                  stroke={isFavorited ? 'red' : 'black'}
                  fill={isFavorited ? 'red' : 'none'}
                  size={22}
                />
              </TouchableOpacity>
              {/* Share/Export icon */}
              <TouchableOpacity onPress={handleShare}>
                <ShareIcon stroke="black" size={22} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <Stack.Screen
        name="mapscreen/index"
        options={{
          headerShown: true,
          headerTransparent: true,
          title: 'Utforska', // Set custom title
          headerBackTitleVisible: false, // Hide the back title
          
          headerTitleStyle: {
            color: '#333', // Customize the header text color
            fontWeight: 'bold', // Customize header title font
          },
          // Custom back button
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ArrowLeft stroke="#333" size={22} />
            </TouchableOpacity>
          ),
        }}
      />

       
    </Stack>
  );
};

export default Layout;
