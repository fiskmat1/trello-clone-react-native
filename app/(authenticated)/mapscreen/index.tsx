import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Added useNavigation
import { Locate } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';

const MAPBOX_API_KEY = 'pk.eyJ1IjoiZmlza21hdCIsImEiOiJjbTF3ZmYyYXUwbmgyMmpzamlrNXVtbjdrIn0.717Y9Y6vuzKRdjlfRxaKkw'; // Add your Mapbox API key here

const MapScreen: React.FC = () => {
  const { coordinates } = useLocalSearchParams();
  const navigation = useNavigation(); // Get navigation object
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const { userId } = useAuth()
  const mapRef = useRef<MapView | null>(null);

  // Request location permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLocationPermission(true);
    } else {
      setLocationPermission(false);
    }
  };

  // Fetch organization data
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('https://kakfeitxqdcmedofleip.supabase.co/functions/v1/fetch-organizations');
      const data = await response.json();
      const organizationsWithCoords = await Promise.all(
        data.map(async (org) => {
          const coordinates = await geocodeAddress(org.address);
          return { ...org, coordinates };
        })
      );
      setOrganizations(organizationsWithCoords);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Geocode an address using Mapbox API
  const geocodeAddress = async (address: string) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${MAPBOX_API_KEY}`
      );
      const [longitude, latitude] = response.data.features[0].center;
      return { latitude, longitude };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  useEffect(() => {
    requestLocationPermission(); // Request permission on load
    fetchOrganizations(); // Fetch organizations data
  }, []);

  const centerMapOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  const handleOrgPress = (id: string) => {
    navigation.navigate('organization/[id]', { id, appuserId: userId }); // Navigate to organization page
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  const defaultLatitude = coordinates?.[1] ?? 59.3293;
  const defaultLongitude = coordinates?.[0] ?? 18.0686;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: defaultLatitude,
          longitude: defaultLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {organizations.map((org) =>
          org.coordinates ? (
            <Marker
              key={org.id}
              coordinate={{
                latitude: org.coordinates.latitude,
                longitude: org.coordinates.longitude,
              }}
              title={org.name}
              onPress={() => handleOrgPress(org.id)} // Handle organization press
            >
              <Image
                source={{
                  uri: org.iconUrl || 'https://i.imgur.com/PLWelDm.png',
                }}
                style={styles.customMarker}
              />
            </Marker>
          ) : null
        )}
      </MapView>

      {/* Button to center the map on user location */}
      {userLocation && locationPermission && (
        <TouchableOpacity style={styles.centerButton} onPress={centerMapOnUser}>
          <Locate size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarker: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  centerButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});

export default MapScreen;
