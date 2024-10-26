import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import SearchBar from '@/components/SearchBar'; // A search bar for entering a city
import { SafeAreaView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native'; // Assuming you're using Clerk for authentication
import tw from 'tailwind-react-native-classnames';
import { Info, User, Store, Glasses, Soup, BookMarked } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

const Page = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, userId} = useAuth();
  const navigation = useNavigation();


  // Fetch Organizations from Supabase Edge Function
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch organizations');
      }

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
    navigation.navigate('search'); // Navigate to the "Search" tab
  };

  const handleOrgPress = (id) => {
    if (userId) {
      navigation.navigate('organization/[id]', { id, appuserId: userId }); // Pass both organization id and appuserId
    } else {
      console.error('User is not signed in');
    }
  };

  const handleAccountPress = () => {
    navigation.navigate('account'); // Navigate to the "Search" tab
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={tw`font-bold text-3xl`}>ClientClub</Text>
            <View>
              <TouchableOpacity onPress={handleAccountPress}>
                <User stroke={'black'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <SearchBar city={'Organization'} setCity={() => {}} />
          <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrganizations} />} // RefreshControl applied to the entire screen
      >
          {/* Categories Layout */}
          <View style={styles.categoriesContainer}>
            <View style={[styles.categoryCard, styles.cardOne]}>
              <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                <Text style={styles.categoryTitle}>Restauranger</Text>
                <Text style={styles.categoryDesc}>Favoritmaten till dörren</Text>
                <View style={styles.iconContainer}>
                  <Soup stroke={'white'} size={20} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.categoryCard, styles.cardTwo]}>
              <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                <Text style={styles.categoryTitle}>Utforska</Text>
                <Text style={styles.categoryDesc}>Utforska butiker</Text>
                <View style={styles.iconContainer}>
                  <Glasses stroke={'white'} size={20} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.categoryCard, styles.cardThree]}>
              <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                <Text style={styles.categoryTitle}>Butiker</Text>
                <Text style={styles.categoryDesc}>ICA, Hemmakväll</Text>
                <View style={styles.iconContainer}>
                  <Store stroke={'white'} size={20} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.categoryCard, styles.cardFour]}>
              <TouchableOpacity onPress={handleCardPress} style={{ flex: 1 }}>
                <Text style={styles.categoryTitle}>Sparade</Text>
                <Text style={styles.categoryDesc}>Sparade butiker</Text>
                <View style={styles.iconContainer}>
                  <BookMarked stroke={'white'} size={20} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Organizations */}
          <View style={tw`flex-row items-center mt-5`}>
            <Text style={tw`font-bold text-xl`}>Rekommendationer</Text>
            <Info stroke={'black'} size={13} style={tw`ml-2 mt-0.5`} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`flex-1 mt-4`}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.title}>Loading...</Text>
              </View>
            ) : (
              organizations.map((org) => (
                <View style={styles.cardWrapper} key={org.id}>
                  <TouchableOpacity onPress={() => handleOrgPress(org.id)}>
                    <View style={styles.orgCard}>
                      <Image
                        source={{
                          uri: 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        }} // Assuming the organization has an image URL field
                        style={styles.orgImage}
                      />
                      <View style={styles.orgDetails}>
                        <Text style={styles.orgName}>{org.name}</Text>
                        <Text style={styles.orgInfo}>
                          $$ • 120 kr min. • {org.category}
                        </Text>
                        <Text style={styles.orgDeliveryInfo}>10-25 min • 29 kr</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          <View style={tw`flex-row items-center mt-12`}>
            <Text style={tw`font-bold text-xl`}>Nytt & Intressant</Text>
            <Info stroke={'black'} size={13} style={tw`ml-2 mt-0.5`} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`flex-1 mt-4`}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.title}>Loading...</Text>
              </View>
            ) : (
              organizations.map((org) => (
                <View style={styles.cardWrapper} key={org.id}>
                  <TouchableOpacity onPress={() => handleOrgPress(org.id)}>
                    <View style={styles.orgCard}>
                      <Image
                        source={{
                          uri: 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        }} // Assuming the organization has an image URL field
                        style={styles.orgImage}
                      />
                      <View style={styles.orgDetails}>
                        <Text style={styles.orgName}>{org.name}</Text>
                        <Text style={styles.orgInfo}>
                          $$ • 120 kr min. • {org.category}
                        </Text>
                        <Text style={styles.orgDeliveryInfo}>10-25 min • 29 kr</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: 'transparent',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardWrapper: {
    marginRight: 12, // Adjust margin between cards
  },
  orgCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 250,
    height: 180, // Adjust card height
  },
  orgImage: {
    width: '100%',
    height: 100, // Adjust image height
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
  },
  cardOne: {
    backgroundColor: '#FF0066',
    height: 213, // Larger card
  },
  cardTwo: {
    backgroundColor: '#004D40',
    height: 123, // Smaller card
    position: 'absolute',
    right: 0,
    top: 0, // Positioned at the top right, allowing it to overlap
  },
  cardThree: {
    backgroundColor: Colors.greyLight,
    height: 160,
    marginTop: 140, // Offset downwards to simulate overlapping the row
  },
  cardFour: {
    backgroundColor: '#DF970B',
    height: 70, // Shorter card
    position: 'absolute',
    left: 0,
    bottom: 0, // Positioned lower-left to overlap
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#fff',
  },
  iconContainer: {
    position: 'absolute',
    right: 1, // Centers the icon vertically
    bottom: 1,
  },
});

export default Page;
