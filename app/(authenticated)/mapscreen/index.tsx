import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image, TouchableOpacity, Share as RNShare } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams for getting coordinates
import Modal from 'react-native-modal'; // Use react-native-modal instead of BottomSheet
import { Heart, ShareIcon } from 'lucide-react-native'; // Import the Heart icon

const MAPBOX_API_KEY = 'pk.eyJ1IjoiZmlza21hdCIsImEiOiJjbTF3ZmYyYXUwbmgyMmpzamlrNXVtbjdrIn0.717Y9Y6vuzKRdjlfRxaKkw';

const MapScreen: React.FC = () => {
  const { coordinates } = useLocalSearchParams(); // Get default coordinates from local search params
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false); // State to track favorite toggle

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

  // Geocode an address into latitude and longitude using Mapbox API
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
    fetchOrganizations();
  }, []);

  // Toggle favorite function
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited); // Toggle the favorite state
  };

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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  // Use coordinates from local search params or fallback to default ones
  const defaultLatitude = coordinates?.[1] ?? 59.3293;
  const defaultLongitude = coordinates?.[0] ?? 18.0686;

  return (
    <View style={styles.container}>
      <MapView
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
              onPress={() => {
                setSelectedOrganization(org);
                setModalVisible(true);
              }}
            />
          ) : null
        )}
      </MapView>

      {/* Modal to display organization info with image on top and heart toggle */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          {selectedOrganization && (
            <>
              {/* Image on top */}
              <Image
                source={{
                  uri: selectedOrganization.imageUrl || 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                }}
                style={styles.modalImage}
              />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedOrganization.name}</Text>
                <View style={styles.iconContainer}>
                    {/* Heart icon to toggle favorite */}
                    <TouchableOpacity onPress={toggleFavorite} style={styles.iconSpacing}>
                    <Heart
                        stroke={isFavorited ? 'red' : 'black'}
                        fill={isFavorited ? 'red' : 'none'}
                        size={20}
                    />
                    </TouchableOpacity>
                    {/* Share icon */}
                    <TouchableOpacity onPress={handleShare} style={styles.iconSpacing}>
                    <ShareIcon stroke="black" size={20} />
                    </TouchableOpacity>
                </View>
              </View>

              <Text>{selectedOrganization.address}</Text>
              <Text>{selectedOrganization.description || 'No description available'}</Text>
            </>
          )}
        </View>
      </Modal>
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalImage: {
    width: '100%',
    height: 200, // Adjust this value as needed
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 20, // Space between image and content
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row', // Ensures the icons are in a row
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 10, // Adds spacing between the icons
  },
});

export default MapScreen;
