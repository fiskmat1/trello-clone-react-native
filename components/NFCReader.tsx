import Animated, {
    withDelay,
    withRepeat,
    withTiming,
    interpolate,
    withSequence,
    useSharedValue,
    useAnimatedStyle,
  } from 'react-native-reanimated';
  import React from 'react';
  import { InteractionManager, StyleSheet, Text, View } from 'react-native';
  import QRCode from 'react-native-qrcode-svg';
  import tw from 'tailwind-react-native-classnames';

  const NFCReader = () => {
    const progress = useSharedValue(0);
  
    const phone = useAnimatedStyle(() => ({
      transform: [
        { perspective: 400 },
        { rotateX: `${interpolate(progress.value, [0, 1], [0, 40])}deg` },
        { translateY: interpolate(progress.value, [0, 1], [0, 4]) },
      ],
    }));
  
    const phoneShadow = useAnimatedStyle(() => ({
      width: interpolate(progress.value, [0, 1], [70, 70]),
      height: interpolate(progress.value, [0, 1], [110, 110]),
      transform: [
        {
          rotate: `${interpolate(
            progress.value,
            [0, 0.01, 1],
            [0, -35, -65],
          )}deg`,
        },
        { translateY: interpolate(progress.value, [0, 0.01, 1], [0, -24, -24]) },
        { translateX: interpolate(progress.value, [0, 1], [0, -32]) },
      ],
    }));
  
    React.useEffect(() => {
      InteractionManager.runAfterInteractions(() => {
        progress.value = withRepeat(
          withSequence(
            withDelay(350, withTiming(1, { duration: 750 })),
            withDelay(250, withTiming(0, { duration: 750 })),
          ),
          -1,
        );
      });
    }, []);
  
    return (
      <View style={styles.container}>
        <View style={styles.circle}>
          <Animated.View style={[phone, styles.phoneContainer]}>
            <Animated.View style={[phoneShadow, styles.phoneShadow]} />
            {/* Place notch above QR code */}
            <View style={styles.notch} />
            {/* QR Code inside the phone screen */}
            
            
          </Animated.View>
        </View>
      </View>
    );
  };
  
  export default NFCReader;
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      padding: 30,
      marginBottom:15
    },
    circle: {
      borderColor: '#0e83fe',
      borderWidth: 4,
      width: 70,
      height: 70,
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderRadius: 1000,
      overflow: 'hidden',
    },
    phoneContainer: {
      top: 20,
      borderRadius: 8,
      height: 70,
      width: 34,
      backgroundColor: '#F0F8FF',
      borderColor: '#0e83fe',
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'flex-start', // Align items towards the top
      overflow: 'hidden',
    },
    phoneShadow: {
      position: 'absolute',
      backgroundColor: 'white',
    },
    notch: {
      width: 8,
      height: 3,
      borderRadius: 8,
      backgroundColor: '#0e83fe',
      marginTop: 5, // Add space between notch and QR code
      alignSelf: 'center',
      marginBottom: 10
    },
    label: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
      marginTop: 20,
    },
  });
  