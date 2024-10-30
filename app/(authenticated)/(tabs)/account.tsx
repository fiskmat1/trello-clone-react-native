import { useAuth, useUser, useSession } from '@clerk/clerk-expo';
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import tw from 'tailwind-react-native-classnames';
import { Feather } from '@expo/vector-icons'; // Icon pack
import { SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import * as WebBrowser from 'expo-web-browser';

const backgroundImageUrl = "https://i.imgur.com/xuU9pfX.png";

const Page = () => {
  const { user } = useUser();
  const { session } = useSession();
  const [firstName, setFirstName] = useState(user?.firstName);
  const [emailAddress, setEmail] = useState(user?.primaryEmailAddress?.emailAddress);
  const { signOut, userId } = useAuth();
  const [topOrganizations, setTopOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const sortedData = data.sort((a, b) => b.points - a.points).slice(0, 3); // Top 3 organizations
        setTopOrganizations(sortedData);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopOrganizations();
  }, [session]);

  return (
    <ImageBackground source={{ uri: backgroundImageUrl }} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
                topOrganizations.map((org, index) => (
                  <View key={org.id} style={tw`flex-row items-center justify-between mb-2`}>
                    <Text style={tw`text-base text-gray-800 font-semibold`}>
                      {org.name}
                    </Text>
                    <View style={tw`flex-row items-center`}>
                      <Text style={tw`text-base text-gray-700`}>{org.points}</Text>
                      <Image source={require('@/assets/images/logoCoinextra.png')} style={styles.coinImage} />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={tw`text-base text-gray-700`}>No saved organizations found.</Text>
              )}
            </BlurView>

            {/* Options Section */}
            <BlurView intensity={80} tint="light" style={[tw`p-4 mb-6`, styles.blurContainer]}>
              <TouchableOpacity style={tw`flex-row justify-between items-center py-4 `}>
                <Text style={tw`text-lg text-black`}>Inställningar</Text>
                <Feather name="chevron-right" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={openLink} style={tw`flex-row justify-between items-center py-4`}>
                <Text style={tw`text-lg text-black`}>Hjälp & Support</Text>
                <Feather name="chevron-right" size={24} color="black" />
              </TouchableOpacity>
            </BlurView>

            {/* Sign Out Button */}
            <BlurView intensity={80} tint="dark" style={[tw`mt-2`, styles.blurContainer]}>
              <TouchableOpacity onPress={() => signOut()} style={tw`py-3`}>
                <Text style={tw`text-white text-center text-lg font-semibold`}>Sign Out</Text>
              </TouchableOpacity>
            </BlurView>
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // glassmorphism effect
  },
  coinImage: {
    width: 32,
    height: 32,
    marginLeft: 4,
    resizeMode: 'cover',
  },
});

export default Page;
