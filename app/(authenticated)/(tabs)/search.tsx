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
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Header, getHeaderTitle, useHeaderHeight } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';

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
  { title: 'Nära dig', label: 'Handplockade favoriter från veckan' },
  { title: 'Mat', label: 'Upptäck trendiga restauranger och matställen' },
  { title: 'Butiker', label: 'Utforska lokala butiker och butiker' },
  { title: 'Hälsa', label: 'Bästa gym, spa och wellnesscenter' },
  { title: 'Gåvor', label: 'Blommor, presenter och nödvändigheter för alla tillfällen' },
  { title: 'Nöje', label: 'Unika aktiviteter och upplevelser i närheten' },
];

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
        setFilteredOrganizations(data); // Set initial organizations
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
      // Search across all organizations if search query is present
      const results = organizations.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrganizations(results);
    } else if (selected.title !== 'Nära dig') {
      // Filter by selected category if no search query is present
      const filteredByCategory = organizations.filter(
        (org) => org.category === selected.title
      );
      setFilteredOrganizations(filteredByCategory);
    } else {
      setFilteredOrganizations(organizations); // Default to all if no section or query selected
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const { width: deviceWidth } = useWindowDimensions();
  const searchBarStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isSearchOpen ? deviceWidth - 70 : 0, { duration: 300 }),
      opacity: withTiming(isSearchOpen ? 1 : 0, { duration: 300 }),
      marginLeft: 10,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Drawer.Screen
        options={{
          headerBackground: () => (
            <BlurView
              intensity={60}
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
                    onPress={() => {
                      setSelected(section);
                    }}
                    style={selected === section ? styles.sectionBtnSelected : styles.sectionBtn}>
                    <Text
                      style={
                        selected === section ? styles.sectionBtnTextSelected : styles.sectionBtnText
                      }>
                      {section.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingTop: headerHeight - 40 }}>
        <Animated.View
          style={styles.section}
          entering={FadeIn.duration(600).delay(400)}
          exiting={FadeOut.duration(400)}>
          <ShimmerPlaceholder width={160} height={20} visible={!loading}>
            <Text style={styles.title}>{selected.title}</Text>
          </ShimmerPlaceholder>
          <ShimmerPlaceholder
            width={280}
            height={20}
            visible={!loading}
            shimmerStyle={{ marginVertical: 10 }}>
            <Text style={styles.label}>{selected.label}</Text>
          </ShimmerPlaceholder>

          {loading || loadingGeocoding ? (
            <ActivityIndicator size="large" color={Colors.grey} />
          ) : (
            filteredOrganizations.map((organization, idx) => (
              <View key={idx} style={styles.card}>
                <ShimmerPlaceholder
                  width={60}
                  height={60}
                  shimmerStyle={{ borderRadius: 30 }}
                  visible={!loading}>
                  <Image source={{ uri: organization.image || 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }} style={styles.cardImage} />
                </ShimmerPlaceholder>

                <View style={{ flexShrink: 1, gap: 4 }}>
                  <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                    <Text style={styles.cardTitle}>{organization.name}</Text>
                  </ShimmerPlaceholder>

                  <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                    <Text style={styles.cardDesc}>{organization.description}</Text>
                  </ShimmerPlaceholder>
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionBtn: {
    backgroundColor: '#EDEDEF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionBtnSelected: {
    backgroundColor: Colors.grey,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionBtnText: {
    color: '#000',
    fontWeight: '500',
  },
  sectionBtnTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 14,
    color: '#000',
  },
});

export default Page;
