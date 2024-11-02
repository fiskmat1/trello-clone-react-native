import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Store, Soup, ShoppingCart, Heart, Gift, Music, Earth, Footprints, PartyPopper, ChevronRight } from 'lucide-react-native';
import { Header, getHeaderTitle, useHeaderHeight } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@clerk/clerk-expo';
import tw from 'tailwind-react-native-classnames';

const backgroundImageUrl = "";
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

type Organization = {
  id: string;
  name: string;
  description: string;
  address: string;
  image?: string;
  category: string;
};

const sections = [
  { title: 'Nära dig', label: 'Butiker nära dig just nu' },
  { title: 'Mat', label: 'Upptäck trendiga restauranger och matställen' },
  { title: 'Butiker', label: 'Utforska lokala butiker och butiker' },
  { title: 'Hälsa', label: 'Bästa gym, spa och wellnesscenter' },
  { title: 'Gåvor', label: 'Blommor, presenter och nödvändigheter för alla tillfällen' },
  { title: 'Nöje', label: 'Unika aktiviteter och upplevelser i närheten' },
];

const iconMap = {
  'Nära dig': Footprints,
  'Mat': Soup,
  'Butiker': Store,
  'Hälsa': Heart,
  'Gåvor': Gift,
  'Nöje': PartyPopper,
};

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [loadingGeocoding, setLoadingGeocoding] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [selected, setSelected] = useState(sections[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const headerHeight = useHeaderHeight();
  const MAPBOX_API_KEY = 'pk.eyJ1IjoiZmlza21hdCIsImEiOiJjbTF3ZmYyYXUwbmgyMmpzamlrNXVtbjdrIn0.717Y9Y6vuzKRdjlfRxaKkw';
  const navigation = useNavigation();
  const { userId } = useAuth();

  const handleOrgPress = (id) => {
    navigation.navigate('organization/[id]', { id, appuserId: userId });
  };

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    const fetchOrganizations = async () => {
      try {
        const response = await fetch(
          'https://kakfeitxqdcmedofleip.supabase.co/functions/v1/fetch-organizations',
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        const data: Organization[] = await response.json();
        setOrganizations(data);
        setFilteredOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
    fetchOrganizations();
  }, []);

  const applyFilters = () => {
    if (searchQuery.trim()) {
      const results = organizations.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrganizations(results);
    } else if (selected.title !== 'Nära dig') {
      const filteredByCategory = organizations.filter(
        (org) => org.category === selected.title
      );
      setFilteredOrganizations(filteredByCategory);
    } else {
      setFilteredOrganizations(organizations);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selected, organizations]);

  useEffect(() => {
    if (userLocation && selected.title === 'Nära dig') {
      const fetchDistances = async () => {
        setLoadingGeocoding(true);
        const nearbyOrganizations: Organization[] = [];

        for (const org of organizations) {
          const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            org.address
          )}.json?access_token=${MAPBOX_API_KEY}`;
          try {
            const response = await fetch(mapboxUrl);
            const data = await response.json();
            if (data.features.length > 0) {
              const [lon, lat] = data.features[0].center;
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                lat,
                lon
              );
              if (distance <= 5) {
                nearbyOrganizations.push(org);
              }
            }
          } catch (error) {
            console.error(`Error with Mapbox geocoding for ${org.name}:`, error);
          }
        }
        setFilteredOrganizations(nearbyOrganizations);
        setLoadingGeocoding(false);
      };

      fetchDistances();
    }
  }, [userLocation, selected, organizations]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const { width: deviceWidth } = useWindowDimensions();
  const searchBarStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isSearchOpen ? deviceWidth - 70 : 0, { duration: 300 }),
      opacity: withTiming(isSearchOpen ? 1 : 0, { duration: 300 }),
      marginLeft: 10,
    };
  });

  const IconComponent = iconMap[selected.title];

  return (
   
      <SafeAreaView style={styles.container}>
        <Drawer.Screen
          options={{
            headerBackground: () => (
              <BlurView
                intensity={100}
                tint={'light'}
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(256, 256, 256, 0.5)' }]}
              />
            ),
            headerTransparent: true,
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                <Animated.View style={[styles.searchBar, searchBarStyle]}>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search..."
                    placeholderTextColor={Colors.grey}
                    style={styles.searchInput}
                  />
                </Animated.View>
                <TouchableOpacity
                  onPress={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (isSearchOpen) setSearchQuery('');
                  }}
                >
                  <Ionicons name="search" size={24} color={Colors.grey} />
                </TouchableOpacity>
              </View>
            ),
            header: ({ options, route }) => (
              <View>
                <Header {...options} title={getHeaderTitle(options, route.name)} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
                  {sections.map((section, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelected(section)}
                      style={selected === section ? styles.sectionBtnSelected : styles.sectionBtn}>
                      <Text style={selected === section ? styles.sectionBtnTextSelected : styles.sectionBtnText}>
                        {section.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ),
          }}
        />
         <ImageBackground source={{ uri: backgroundImageUrl }} style={{ flex: 1, marginTop:70 }} resizeMode="cover">
        <BlurView intensity={80} tint="light" style={[styles.sectionCard, { marginTop: headerHeight-100 }]}>
          <View style={tw`flex-row`}>
          {IconComponent && <IconComponent stroke={'black'} style={tw`mr-1.5 mt-0.5`} />}
          <Text style={styles.sectionTitle}>{selected.title}</Text>
          </View>
          <Text style={styles.sectionLabel}>{selected.label}</Text>
        </BlurView>
          
        <View style={styles.orgContainerCard}>
        <BlurView intensity={80} tint="light" style={styles.orgBlurCard} >
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, marginTop: 20 }}>
          {loading || loadingGeocoding ? (
            <ActivityIndicator size="large" color={Colors.grey} />
          ) : (
            filteredOrganizations.map((organization, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleOrgPress(organization.id)} style={styles.cardWrapper}>
                <View style={styles.cardContainer}>
                <BlurView intensity={60} tint="light" style={styles.card}>
                  <ShimmerPlaceholder width={60} height={60} shimmerStyle={{ borderRadius: 30 }} visible={!loading}>
                    <Image
                      source={{
                        uri: organization.image || 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                      }}
                      style={styles.cardImage}
                    />
                  </ShimmerPlaceholder>
                  <View style={styles.cardContent}>
                    <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                      <Text style={styles.cardTitle}>{organization.name}</Text>
                    </ShimmerPlaceholder>
                    <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                      <View style={tw`items-center flex-row`}>
                      <Text style={styles.cardDesc}>Se mer</Text>
                      <ChevronRight stroke={'black'} size={11} style={tw`mt-1.5`} />
                      </View>
                    </ShimmerPlaceholder>
                  </View>
                </BlurView>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
        </BlurView>
        </View>
        </ImageBackground>
      </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  searchBar: {
    height: 37,
    marginRight: 10,
    backgroundColor: '#EDEDEF',
    borderRadius: 9,
    paddingHorizontal: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  searchInput: {
    color: 'black',
    fontSize: 16,
    width: '100%',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 28,
    marginTop: 25,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F2F1F3',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#666'
  },
  sectionBtn: {
    backgroundColor: '#EDEDEF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionBtnSelected: {
    backgroundColor: '#7D7D7F',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  orgContainerCard: {
    paddingHorizontal:15,
    borderRadius: 15,
    height: '72%',
    overflow: 'hidden'
  },
  orgBlurCard: {
    borderRadius: 15,
    height: '80%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F2F1F3',
  },
  sectionBtnText: {
    color: '#000',
    fontWeight: '500',
  },
  sectionBtnTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  cardWrapper: {
    marginBottom: 8,
    borderRadius: 12,
  },
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden', // Ensures BlurView respects the border radius
  },
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  cardContent: {
    borderRadius: 12,
    flexShrink: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
});

export default Page;
