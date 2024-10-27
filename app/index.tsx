import { Colors } from '@/constants/Colors';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActionSheet } from '@expo/react-native-action-sheet';
import 'react-native-get-random-values';

import * as WebBrowser from 'expo-web-browser';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ModalType } from '@/types/enums';

import AuthModal from '@/components/AuthModal';
import AnimatedIntro from '@/components/AnimatedIntro';


export default function Index() {
  const { top } = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['33%'], []);
  const [authType, setAuthType] = useState<ModalType | null>(null);

  const openLink = async () => {
    WebBrowser.openBrowserAsync('https://galaxies.dev');
  };

  const openActionSheet = async () => {
    const options = ['View support docs', 'Contact us', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: `Can't log in or sign up?`,
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case 1:
            // Support
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

  const showModal = async (type: ModalType) => {
    setAuthType(type);
    bottomSheetModalRef.current?.present();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => bottomSheetModalRef.current?.close()}
      />
    ),
    []
  );

  return (
<BottomSheetModalProvider>
      <View style={styles.container}>
        {/* Animated Background */}
        <AnimatedIntro />

        {/* Content Above Background */}
        <View style={styles.content}>
          

          <View style={styles.bottomContainer}>
          <Text style={styles.introText}>
           
          </Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: 'white' }]}
              onPress={() => showModal(ModalType.Login)}
            >
              <Text style={[styles.btnText, { color: 'black' }]}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, {backgroundColor: '#1B1A1F'}]} onPress={() => showModal(ModalType.SignUp)}>
              <Text style={[styles.btnText, { color: '#fff' }]}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.description}>
              By signing up, you agree to the{' '}
              <Text style={styles.link} onPress={openLink}>
                User Notice
              </Text>{' '}
              and{' '}
              <Text style={styles.link} onPress={openLink}>
                Privacy Policy
              </Text>
              .
            </Text>

            <Text style={styles.link} onPress={openActionSheet}>
              Can't log in or sign up?
            </Text>
          </View>
        </View>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        enableOverDrag={false}
        enablePanDownToClose
      >
        <AuthModal authType={authType} />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  background: {
    ...StyleSheet.absoluteFillObject, // This will ensure it covers the whole screen
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end', // Pushes the content to the bottom
    alignItems: 'center',
  },
  introText: {
    fontWeight: '600',
    color: 'white',
    fontSize: 17,
    padding: 10,
    textAlign: 'center',
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 15,
    color: 'black',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'black',
  
  },
  btn: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: '#fff',
    
  },
  btnText: {
    fontSize: 18,
    fontWeight: 500
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    color: '#fff',
    marginHorizontal: 60,
  },
  link: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});