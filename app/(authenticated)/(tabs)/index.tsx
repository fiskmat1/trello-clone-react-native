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
import { SafeAreaView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';
import { Info, User, Store, Glasses, Soup, BookMarked } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';

const backgroundImageUrl = "https://i.imgur.com/j5YfcXX.png";

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
    if (isSignedIn) {
      fetchOrganizations();
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

  const handleAccountPress = () => {
    navigation.navigate('account');
  };

  return (
    <ImageBackground
      source={{ uri: backgroundImageUrl }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={tw`font-bold text-3xl text-black`}>ClientClub</Text>
            <TouchableOpacity onPress={handleAccountPress}>
            <BlurView intensity={20} tint="light" style={styles.userIconBackground}>
              <User stroke={'black'} />
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
                <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Restauranger</Text>
                  <Text style={styles.categoryDesc}>Favoritmaten till dörren</Text>
                  <View style={styles.iconContainer}>
                    <Soup stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
              </BlurView>

              <BlurView intensity={50} tint="light" style={[styles.categoryCard, styles.cardTwo]}>
                <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Utforska</Text>
                  <Text style={styles.categoryDesc}>Utforska butiker</Text>
                  <View style={styles.iconContainer}>
                    <Glasses stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
              </BlurView>

              <BlurView intensity={50} tint="light" style={[styles.categoryCard, styles.cardThree]}>
                <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Butiker</Text>
                  <Text style={styles.categoryDesc}>ICA, Hemmakväll</Text>
                  <View style={styles.iconContainer}>
                    <Store stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
              </BlurView>

              <BlurView intensity={50} tint="light" style={[styles.categoryCard, styles.cardFour]}>
                <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>Sparade</Text>
                  <Text style={styles.categoryDesc}>Sparade butiker</Text>
                  <View style={styles.iconContainer}>
                    <BookMarked stroke={'#5A5A5A'} size={20} />
                  </View>
                </TouchableOpacity>
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
                  <BlurView intensity={50} tint="light" style={styles.cardWrapper} key={org.id}>
                    <TouchableOpacity onPress={() => handleOrgPress(org.id)}>
                      <View style={styles.orgCard}>
                        <Image
                          source={{
                            uri: 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                          }}
                          style={styles.orgImage}
                        />
                        <View style={styles.orgDetails}>
                          <Text style={styles.orgName}>{org.name}</Text>
                          <Text style={styles.orgInfo}>$$ • 120 kr min. • {org.category}</Text>
                          <Text style={styles.orgDeliveryInfo}>10-25 min • 29 kr</Text>
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
                          source={{
                            uri: 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                          }}
                          style={styles.orgImage}
                        />
                        <View style={styles.orgDetails}>
                          <Text style={styles.orgName}>{org.name}</Text>
                          <Text style={styles.orgInfo}>$$ • 120 kr min. • {org.category}</Text>
                          <Text style={styles.orgDeliveryInfo}>10-25 min • 29 kr</Text>
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
    </ImageBackground>
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
    padding: 15,
    borderRadius: 7,
    marginTop: 10,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  cardOne: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 213,
  },
  cardTwo: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 123,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardThree: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 160,
    marginTop: 140,
  },
  cardFour: {
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    height: 70,
    position: 'absolute',
    left: 0,
    bottom: 0,
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
  iconContainer: {
    position: 'absolute',
    right: 1,
    bottom: 1,
  },
});

export default Page;
