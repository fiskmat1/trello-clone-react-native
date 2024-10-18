import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Linking, AppState } from "react-native";
import { Camera, CameraView } from "expo-camera"; // Import Camera and CameraView from expo-camera
import { Stack } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { Overlay } from "@/components/Scan/Overlay";

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions(); // State to handle camera permission
  const qrLock = useRef(false); // Lock to prevent multiple scans
  const appState = useRef(AppState.currentState);

  // Request camera permissions manually when user clicks the button
  const isPermissionGranted = Boolean(permission?.granted);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false; // Reset QR lock when app becomes active
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove(); // Clean up event listener
    };
  }, []);

  // Handle the barcode scanned event
  const handleBarCodeScanned = ({ data }) => {
    if (data && !qrLock.current) {
      qrLock.current = true; // Lock to prevent multiple scans
      setTimeout(async () => {
        await Linking.openURL(data); // Open scanned URL
        qrLock.current = false; // Reset lock after URL is opened
      }, 500);
    }
  };

  // If camera permission was denied
  if (!isPermissionGranted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Request Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If camera permission is granted, show the QR code scanner
  if (isPermissionGranted) {
    return (
      <View style={styles.fullScreen}>
        <Stack.Screen options={{ title: "Scan", headerShown: false }} />
        
        {Platform.OS === "android" && <StatusBar hidden={true} />}
        {Platform.OS === "ios" && <StatusBar hidden={true} translucent />}

        {/* Camera View with QR scanning */}
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back" // Use back camera
          onBarcodeScanned={handleBarCodeScanned} // Handle QR code scanning
        />

        
       
        <Overlay />
      </View>
    );
  }

  // If permission is not granted yet, show the button to request permission
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
    backgroundColor: "black", // Ensure the background is black when the camera is loading
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
  scanInstructionsContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanInstructions: {
    color: "#0E7AFE",
    fontSize: 18,
    textAlign: "center",
  },
});
