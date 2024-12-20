import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import SearchBar from '@/components/SearchBar';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';
import { Info, User, Store, Glasses, Soup, BookMarked, Coins } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import logoCoinTransparent from '@/assets/images2/logoloyaltytransparent.png';
import logoCoinTransparentExtra from '@/assets/images2/banner123.png';
import logoSite from '@/assets/images2/logoloyalty123.png'

const backgroundImageUrl = "";

const backgroundImages = {
  restaurants: require('@/assets/images2/burger.gif'),
  explore: require('@/assets/images2/location.gif'),
  stores: require('@/assets/images2/shopping3.gif'),
  saved: require('@/assets/images2/coin123.gif'),
  
};

const Page = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, userId } = useAuth();
  const navigation = useNavigation();

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://kakfeitxqdcmedofleip.supabase.co/functions/v1/fetch-organizations',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Could not fetch organization data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };

    if (isSignedIn) {
      fetchOrganizations();
      requestNotificationPermission(); // Request notification permission after sign-in
    }
  }, [isSignedIn]);

  const handleCardPress = () => {
    navigation.navigate('search');
  };

  const handleOrgPress = (id) => {
    if (userId) {
      navigation.navigate('organization/[id]', { id, appuserId: userId });
    } else {
      console.error('User is not signed in');
    }
  };

  const handleSavedPress = () => {
    if (userId) {
      navigation.navigate('saved');
    } else {
      console.error('User is not signed in');
    }
  };

  const handleAccountPress = () => {
    navigation.navigate('account');
  };

  return (
    
      <SafeAreaView style={{ flex: 1, backgroundColor:'white' }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={tw`flex-row items-center`}>
            <View
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 5, height: 5 },
                shadowOpacity: 0.13,
                shadowRadius: 6,
                borderRadius: 10,
                elevation: 5, // Android shadow
                overflow: 'visible', // Ensure the shadow is not cut off
                marginRight: 8, // Adds space between image and text
              }}
            >
              <Image
                source={logoSite}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                   // If needed for rounded edges
                }}
              />
            </View>
            <Text style={tw`font-bold text-3xl text-black `}>ClientClub</Text>
            </View>
            <TouchableOpacity onPress={handleAccountPress}>
            <BlurView intensity={20} tint="light" style={styles.userIconBackground}>
              <User stroke={'#5A5A5A'} />
            </BlurView>
            </TouchableOpacity>
          </View>

          <SearchBar city={'Organization'} setCity={() => {}} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrganizations} />}
          >
            <View style={styles.categoriesContainer}>

             
              <BlurView intensity={50} tint="light" style={[styles.categoryCard, styles.cardOne]}>
                <ImageBackground source={backgroundImages.restaurants} style={{flex:1}}>
                  <View style={styles.innerContent}>
                <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Restauranger</Text>
                  <Text style={styles.categoryDesc}>Upptäck restauranger</Text>
                  <View style={styles.iconContainer}>
                    <Soup stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
                </View>
                </ImageBackground>
              </BlurView>
              

              <BlurView intensity={50} tint="light" style={[styles.categoryCard, styles.cardTwo]}>
              <ImageBackground source={null} style={{flex:1}}>
              <View style={styles.innerContent}>
                <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Utforska</Text>
                  <Text style={styles.categoryDesc}>Utforska butiker</Text>
                  <View style={styles.iconContainer}>
                    <Glasses stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
                </View>
                </ImageBackground>
              </BlurView>

              <BlurView intensity={50} tint="light" style={[styles.categoryCard, styles.cardThree]}>
              <ImageBackground source={backgroundImages.stores} style={{flex:1}}>
              <View style={styles.innerContent}>
                <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Butiker</Text>
                  <Text style={styles.categoryDesc}>Upptäck butiker</Text>
                  <View style={styles.iconContainer}>
                    <Store stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
                </View>
                </ImageBackground>
              </BlurView>

              <BlurView intensity={50} tint="light" style={[styles.categoryCard, styles.cardFour]}>
              <ImageBackground source={null} style={{flex:1}}>
              <View style={styles.innerContent}>
                <TouchableOpacity onPress={handleSavedPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Sparade</Text>
                  <Text style={styles.categoryDesc}>Sparade butiker</Text>
                  <View style={styles.iconContainer}>
                    <BookMarked stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
                </View>
                </ImageBackground>
              </BlurView>
              
            </View>

            <View style={tw`flex-row items-center mt-5`}>
              <Text style={tw`font-bold text-xl text-black`}>Rekommendationer</Text>
              <Info stroke={'black'} size={13} style={tw`ml-2 mt-0.5`} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`flex-1 mt-4`}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.title}>Loading...</Text>
                </View>
              ) : (
                organizations.map((org) => (
                  <BlurView intensity={40} tint="light" style={styles.cardWrapper} key={org.id}>
                    <TouchableOpacity onPress={() => handleOrgPress(org.id)}>
                      <View style={styles.orgCard}>
                      <Image
                          source={
                            org.image
                              ? { uri: org.image }
                              : logoCoinTransparentExtra // Use local image if org.image is undefined
                          }
                          style={styles.orgImage}
                        />
                        <View style={styles.orgDetails}>
                          <Text style={styles.orgName}>{org.name}</Text>
                          <View style={styles.orgInfoContainer}>
                          <Image source={logoCoinTransparent} style={styles.coinImage} />
                            <Text style={styles.orgInfo}>• samla poäng • {org.category}</Text>
                          </View>
                          <Text style={styles.orgDeliveryInfo}>Se mer</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </BlurView>
                ))
              )}
            </ScrollView>
            <View style={tw`flex-row items-center mt-5`}>
              <Text style={tw`font-bold text-xl text-black`}>Nytt & Intressant</Text>
              <Info stroke={'black'} size={13} style={tw`ml-2 mt-0.5`} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`flex-1 mt-4`}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.title}>Loading...</Text>
                </View>
              ) : (
                organizations.map((org) => (
                  <BlurView intensity={50} tint="light" style={styles.cardWrapper} key={org.id}>
                    <TouchableOpacity onPress={() => handleOrgPress(org.id)}>
                      <View style={styles.orgCard}>
                      <Image
                          source={
                            org.image
                              ? { uri: org.image }
                              : logoCoinTransparentExtra // Use local image if org.image is undefined
                          }
                          style={styles.orgImage}
                        />
                        <View style={styles.orgDetails}>
                          <Text style={styles.orgName}>{org.name}</Text>
                          <View style={styles.orgInfoContainer}>
                          <Image source={logoCoinTransparent} style={styles.coinImage} />
                            <Text style={styles.orgInfo}>• samla poäng • {org.category}</Text>
                          </View>
                          <Text style={styles.orgDeliveryInfo}>Se mer</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </BlurView>
                ))
              )}
            </ScrollView>
          </ScrollView>
        </View>
      </SafeAreaView>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userIconBackground: {
    padding: 9,
    borderRadius: 20, // Ensures a circular background for the icon
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orgCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Darker background for readability
    borderRadius: 12,
    width: 250,
    height: 180,
  },
  orgImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  orgDetails: {
    padding: 10,
  },
  orgName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orgInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coinIcon: {
    marginRight: 4,
    marginTop: 2
  },
  orgInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orgDeliveryInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCard: {
    width: '49%',
    borderRadius: 7,
    marginTop: 10,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  innerContent: {
    flex: 1,
    padding: 15, // Only affects text and icon, not background image
  },
  cardOne: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 213,
    borderWidth: 1,
    borderColor: '#F2F1F3',
  },
  cardTwo: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 123,
    position: 'absolute',
    right: 0,
    top: 0,
    borderWidth: 1,
    borderColor: '#F2F1F3',
  },
  cardThree: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 160,
    marginTop: 140,
    borderWidth: 1,
    borderColor: '#F2F1F3',
  },
  cardFour: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 70,
    position: 'absolute',
    left: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#F2F1F3',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5A5A5A',
    marginBottom: 5,
  },
  categoryDesc: {
    fontSize: 12,
    color: 'gray',
  },
  coinImage: {
    width: 17,
    height: 17,
    marginRight: 4, // Adds space between the image and the text
  },
  iconContainer: {
    position: 'absolute',
    right: 1,
    bottom: 1,
  },
});

export default Page;
