import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, AppState, Alert, ActivityIndicator } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Stack } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { Overlay } from "@/components/Scan/Overlay";
import * as Location from "expo-location";
import * as SecureStore from 'expo-secure-store';
import { useSession } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECONDS_IN_A_DAY = 86400;

export default function Home() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const { userId } = useAuth();
  const { session } = useSession();

  // Function to request both camera and location permissions
  const requestPermissions = async () => {
    const cameraPermissionStatus = await requestCameraPermission();
    const locationPermissionStatus = await Location.requestForegroundPermissionsAsync();

    if (cameraPermissionStatus.granted && locationPermissionStatus.status === "granted") {
      setLocationPermission(true);
    } else {
      Alert.alert("Behörigheter krävs", "Vi behöver både kamera- och platsbehörighet för att skanna och verifiera din position.");
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      setIsProcessing(true);

      setTimeout(() => {
        qrLock.current = false;
      }, 9000);

      try {
        const token = await session?.getToken({ template: 'supabase' });
        const organizationId = data.split("/").pop();

        // Check if 24 hours have passed since the last scan for this organization
        const lastScanTime = await AsyncStorage.getItem(`lastScan_${organizationId}`);
        const currentTime = Math.floor(Date.now() / 1000);

        if (lastScanTime && currentTime - parseInt(lastScanTime) < SECONDS_IN_A_DAY) {
          Alert.alert("Fel", "Du kan bara skanna i denna butik en gång per 24h.");
          setIsProcessing(false);
          return;
        }

        // Fetch geofence data for the organization with JWT authorization
        const geofenceResponse = await fetch(`https://kakfeitxqdcmedofleip.supabase.co/functions/v1/fetch-geofence?organizationId=${organizationId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const geofenceData = await geofenceResponse.json();

        if (!geofenceResponse.ok) {
          throw new Error(geofenceData.error || "Failed to fetch geofence data");
        }

        // Get user's current location
        const userLocation = await Location.getCurrentPositionAsync({});
        const distance = getDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          geofenceData.latitude,
          geofenceData.longitude
        );

        if (distance <= geofenceData.radius) {
          // Award points with JWT authorization
          const awardPointsResponse = await fetch(
            `https://kakfeitxqdcmedofleip.supabase.co/functions/v1/award-points?appuserId=${userId}&organizationId=${organizationId}&pointsToAdd=${5}`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const pointsResult = await awardPointsResponse.json();

          if (pointsResult.success) {
            Alert.alert("Lyckat", "Poäng har lagts till på ditt konto.");
            await AsyncStorage.setItem(`lastScan_${organizationId}`, currentTime.toString());
          } else {
            Alert.alert("Fel", "Det gick inte att lägga till poäng.");
          }
        } else {
          Alert.alert("Utanför räckvidd", "Du är inte inom det angivna området.");
        }
      } catch (error) {
        Alert.alert("Fel", error.message || "Ett fel inträffade vid behandling av QR-koden.");
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // If permissions are not granted, display a button to request them
  if (!cameraPermission?.granted || !locationPermission) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={requestPermissions}>
          <Text style={styles.permissionButtonText}>Begär Behörigheter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <Stack.Screen options={{ title: "Scan", headerShown: false }} />
      {Platform.OS === "android" && <StatusBar hidden={true} />}
      {Platform.OS === "ios" && <StatusBar hidden={true} translucent />}

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
      />

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.processingText}>Behandlar...</Text>
        </View>
      )}

      <Overlay />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  permissionButtonText: {
    color: "#0E7AFE",
    fontSize: 18,
    textAlign: "center",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 10,
  },
});

// Helper function to calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      (1 - Math.cos(dLon)) / 2;

  return R * 2 * Math.asin(Math.sqrt(a)) * 1000; // Distance in meters
}
