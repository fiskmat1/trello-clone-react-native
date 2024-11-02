import { useAuth, useUser, useSession } from '@clerk/clerk-expo';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Alert,
  Linking
} from 'react-native';
import { useState, useEffect } from 'react';
import tw from 'tailwind-react-native-classnames';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import * as WebBrowser from 'expo-web-browser';
import * as Location from 'expo-location';
import { useCameraPermissions } from 'expo-camera';

const backgroundImageUrl = "";

const Page = () => {
  const { user } = useUser();
  const { session } = useSession();
  const [firstName, setFirstName] = useState(user?.firstName);
  const [emailAddress, setEmail] = useState(user?.primaryEmailAddress?.emailAddress);
  const { signOut, userId } = useAuth();
  const [topOrganizations, setTopOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permissions state
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const openLink = async () => {
    WebBrowser.openBrowserAsync('https://clientclub.se');
  };

  // Fetch saved organizations and get the top 3 by points
  useEffect(() => {
    const fetchTopOrganizations = async () => {
      try {
        const clerkToken = await session?.getToken({ template: 'supabase' });

        const response = await fetch(
          `https://kakfeitxqdcmedofleip.supabase.co/functions/v1/fetch-saved?appuserId=${userId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${clerkToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        const sortedData = data.sort((a, b) => b.points - a.points).slice(0, 3);
        setTopOrganizations(sortedData);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopOrganizations();
    checkLocationPermission();
  }, [session]);

  // Check initial location permission status
  const checkLocationPermission = async () => {
    const locationStatus = await Location.getForegroundPermissionsAsync();
    setLocationEnabled(locationStatus.granted);
  };

  // Request location permission with prompt to open settings if initially denied
  const handleLocationToggle = async (value) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationEnabled(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for this feature. Please open system settings to enable it.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      Alert.alert(
        "Revoke Location Permission",
        "To disable location access, please go to your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  // Request camera permission with prompt to open settings if initially denied
  const handleCameraToggle = async (value) => {
    if (value) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required for this feature. Please open system settings to enable it.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      Alert.alert(
        "Revoke Camera Permission",
        "To disable camera access, please go to your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from Clerk
              

              // Delete from database
              const clerkToken = await session?.getToken({ template: 'supabase' });
              await fetch(`https://kakfeitxqdcmedofleip.supabase.co/functions/v1/delete-user?appuserId=${userId}`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${clerkToken}`,
                  'Content-Type': 'application/json',
                }
              });

              signOut(); // Sign out user after deletion
              await user.delete();
            } catch (error) {
              Alert.alert("Error", "Failed to delete account. Please try again later.");
              console.error("Error deleting account:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground source={{ uri: backgroundImageUrl }} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
        <ScrollView style={tw`flex-1`}>
          <View style={tw`px-6 py-8`}>
            {/* Profile Section */}
            <View style={tw`flex-row justify-between items-center mb-8`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`ml-4`}>
                  <Text style={tw`text-xl font-bold text-black`}>{firstName}</Text>
                  <Text style={tw`text-sm text-gray-500`}>{emailAddress}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => signOut()}>
                <Feather name="log-out" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Saved Organizations Section */}
            <BlurView intensity={80} tint="light" style={[tw`p-4 mb-6`, styles.blurContainer]}>
              <Text style={tw`text-sm font-bold text-black mb-2`}>LOJALITETSPOÄNG</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : topOrganizations.length > 0 ? (
                topOrganizations.map((org) => (
                  <View key={org.id} style={tw`flex-row items-center justify-between mb-2`}>
                    <Text style={tw`text-base text-gray-800 font-semibold`}>
                      {org.name}
                    </Text>
                    <View style={tw`flex-row items-center`}>
                      <Text style={tw`text-base text-gray-700`}>{org.points}</Text>
                      <Image source={require('@/assets/images2/logoloyaltytransparent.png')} style={styles.coinImage} />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={tw`text-base text-gray-700`}>Inga sparade butiker hittades.</Text>
              )}
            </BlurView>

            {/* Permissions Toggles */}
            <BlurView intensity={80} tint="light" style={[tw`p-4 mb-6`, styles.blurContainer]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ flex: 1, fontSize: 16 }}>Platstjänster</Text>
                <Switch value={locationEnabled} onValueChange={handleLocationToggle} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ flex: 1, fontSize: 16 }}>Kamera</Text>
                <Switch value={cameraPermission?.granted || false} onValueChange={handleCameraToggle} />
              </View>
            </BlurView>

            <BlurView intensity={80} tint="light" style={[tw`p-4 mb-6`, styles.blurContainer]}>
              <TouchableOpacity onPress={openLink} style={tw`flex-row justify-between items-center py-4`}>
                <Text style={tw`text-lg text-black`}>Hjälp & Support</Text>
                <Feather name="chevron-right" size={24} color="black" />
              </TouchableOpacity>
            </BlurView>

            {/* Sign Out Button */}
            <BlurView intensity={80} tint="dark" style={[tw`mt-2`, styles.blurContainer]}>
              <TouchableOpacity onPress={() => signOut()} style={tw`py-3`}>
                <Text style={tw`text-white text-center text-lg font-semibold`}>Logga ut</Text>
              </TouchableOpacity>
            </BlurView>

            {/* Delete Account Button */}
            <TouchableOpacity onPress={handleDeleteAccount} style={tw`py-3 mt-10`}>
              <Text style={tw`text-red-600 text-center text-sm font-semibold`}>Radera konto</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  coinImage: {
    width: 20,
    height: 20,
    marginLeft: 4,
    resizeMode: 'cover',
  },
});

export default Page;
