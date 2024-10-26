import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, AppState, Alert, ActivityIndicator } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Stack } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { Overlay } from "@/components/Scan/Overlay";
import * as Location from "expo-location";
import { useSession } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false); // Processing state for the indicator
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const { userId } = useAuth();
  const { session } = useSession();
  const isPermissionGranted = Boolean(permission?.granted);

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
      setIsProcessing(true); // Show the processing indicator

      // Set a timer to reset the QR lock after 5 seconds
      setTimeout(() => {
        qrLock.current = false;
      }, 5000);

      try {
        // Get the JWT token from the session
        const token = await session?.getToken({ template: 'supabase' });

        // Extract organizationId from the last part of the URL
        const organizationId = data.split("/").pop();

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

        // Request the user's location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission to access location was denied.");
          return;
        }

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
            Alert.alert("Success", "Points have been added to your account.");
          } else {
            Alert.alert("Error", "Failed to add points.");
          }
        } else {
          Alert.alert("Out of Range", "You are not within the required range.");
        }
      } catch (error) {
        Alert.alert("Error", error.message || "An error occurred while processing the QR code.");
        console.error(error);
      } finally {
        setIsProcessing(false); // Hide the processing indicator
      }
    }
  };

  if (!isPermissionGranted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Request Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isPermissionGranted) {
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
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}

        <Overlay />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Scanner</Text>
      <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
        <Text style={styles.buttonText}>Grant Camera Permission</Text>
      </TouchableOpacity>
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
  title: {
    color: "black",
    fontSize: 24,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#0E7AFE",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#0E7AFE",
    fontSize: 18,
    textAlign: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
