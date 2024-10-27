import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  Pressable,
  Modal,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Coins, Info, PackageOpen, ArrowRight, Maximize2, Maximize, Gift, X } from 'lucide-react-native';
import { useSession } from '@clerk/clerk-expo';
import Animated, { useAnimatedStyle, withSpring, LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import tw from 'tailwind-react-native-classnames';
import LottieView from 'lottie-react-native'
import QRCode from 'react-native-qrcode-svg';
import NFCReader from '@/components/NFCReader';

type OrganizationRouteProp = RouteProp<{ params: { id: string; appuserId: string; getToken: string } }, 'params'>;



const OrganizationPage = () => {
  const [organization, setOrganization] = useState<any>(null);
  const [loyaltyRewards, setLoyaltyRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null); // State to manage selected reward for modal
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [confirmModalVisible, setConfirmModalVisible] = useState(false); // Modal for redeem confirmation
  const [verificationModalVisible, setVerificationModalVisible] = useState(false); // Modal for verification
  const [selectedReward, setSelectedReward] = useState<any>(null); // Store the reward being redeemed
  const [qrCodeValue, setQrCodeValue] = useState(generateQrCodeContent(selectedReward));
  const [showQRCode, setShowQRCode] = useState(false);

  const route = useRoute<OrganizationRouteProp>();
  const { id, appuserId } = route.params;
  const { session } = useSession();

  function generateQrCodeContent(selectedReward) {
    return `${selectedReward?.title || 'Reward'}_${Date.now()}`;
  }

  useEffect(() => {
    // Only set up the interval if the modal is visible
    if (verificationModalVisible) {
      const interval = setInterval(() => {
        setQrCodeValue(generateQrCodeContent(selectedReward));
      }, 3000);
  
      // Clear the interval when the component unmounts or modal is closed
      return () => clearInterval(interval);
    }
  }, [verificationModalVisible, selectedReward]);

  useEffect(() => {
    if (verificationModalVisible) {
      setShowQRCode(false);
      const timer = setTimeout(() => {
        setShowQRCode(true);
      }, 2000); // Show QR code after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [verificationModalVisible]);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(
          `https://kakfeitxqdcmedofleip.supabase.co/functions/v1/get-organization-by-id?id=${id}&appuserId=${appuserId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setOrganization(data);
        setLoyaltyPoints(data.loyaltyPoints ?? null);
        setIsJoined(data.loyaltyPoints !== null);
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLoyaltyRewards = async () => {
      try {
        const response = await fetch(
          `https://kakfeitxqdcmedofleip.supabase.co/functions/v1/fetch-loyalty?organizationId=${id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setLoyaltyRewards(data || []);
      } catch (error) {
        console.error('Error fetching loyalty rewards:', error);
      }
    };

    fetchOrganization();
    fetchLoyaltyRewards();
  }, [id, appuserId]);

  const handleJoinLoyaltyProgram = async () => {
    const clerkToken = await session?.getToken({ template: 'supabase' });

    const response = await fetch(
      `https://kakfeitxqdcmedofleip.supabase.co/functions/v1/create-loyalty-points-row?appuserId=${appuserId}&organizationId=${id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    if (data.success) {
      setIsJoined(true);
      console.log('User joined successfully');
    } else {
      console.error('Error joining loyalty program:', data.error);
    }
  };

  const handleRedeemPoints = async () => {
    const clerkToken = await session?.getToken({ template: 'supabase' });
  
    // Assuming the Supabase function `redeem-loyalty-points` deducts points
    const response = await fetch(
      `https://kakfeitxqdcmedofleip.supabase.co/functions/v1/deduct-loyalty-points?appuserId=${appuserId}&organizationId=${id}&pointsToDeduct=${selectedReward.pointsRequired}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          'Content-Type': 'application/json',
        }
      }
    );
  
    const data = await response.json();
    if (data.success) {
      // Points successfully deducted, open verification screen
      setConfirmModalVisible(false);
      setVerificationModalVisible(true);
      // Perform any additional state updates if necessary
    } else {
      console.error('Error redeeming points:', data.error);
    }
  };
  
  const openConfirmModal = (reward: any) => {
    setSelectedReward(reward);
    setConfirmModalVisible(true); // Show confirmation modal
  };
  

  const openModal = (reward: any) => {
    setSelectedRow(reward);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRow(null);
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!organization) {
    return <Text>No organization found.</Text>;
  }

  

  

  return (
    <View style={styles.container}>
      {/* Display organization image at the top */}
      
        <Image source={{ uri: organization.imageUrl || 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', }} style={styles.organizationImage} />
     

      <View style={styles.header}>
        <Text style={styles.title}>{organization.name}</Text>
        {isJoined && (
          <View style={styles.pointsContainer}>
            <Text style={styles.loyaltyPoints}>{loyaltyPoints}</Text>
            <Coins stroke={'orange'} style={styles.coinIcon} />
          </View>
        )}
      </View>
      <Text>{organization.address}</Text>
      <Text style={tw`mt-3`}>{organization.description}</Text>

      {isJoined && loyaltyRewards.length > 0 && (
        <View style={styles.rewardsContainer}>
          <View style={tw`flex-row items-center mb-5`}>
            <Text style={tw`font-bold text-xl`}>Rewards</Text>
            <Info stroke={'black'} size={13} style={tw`ml-2 mt-0.5`} />
          </View>
          <ScrollView style={styles.container2}>
            {loyaltyRewards.map((reward) => (
              <Pressable key={reward.id} style={styles.rewardContainer} onPress={() => openModal(reward)}>
               
                <Animated.View
                  layout={LinearTransition.springify()}
                  entering={FadeIn.duration(600).delay(400)}
                  exiting={FadeOut.duration(400)}
                  style={styles.rewardContent}
                >
                  <Gift stroke={'black'} size={28} style={styles.rewardImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <View style={tw`flex-row items-center`}>
                    <Text style={styles.rewardDescription}>See more</Text>
                    <ArrowRight size={11} stroke={'#888'} style={tw`ml-1`}/>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.pointsButton}
                    onPress={() => openConfirmModal(reward)}  // Trigger modal on press
                  >
                    <Text style={styles.buttonText}>{reward.pointsRequired}</Text>
                    <Coins stroke={'orange'} size={16} style={styles.coinIconSmall} />
                  </TouchableOpacity>
                </Animated.View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {!isJoined && (
        <>
          <Text style={styles.descriptionText}>
            Gå med och få tillgång till exklusiva specialerbjudanden, lojalitetsbelöningar och mycket mer! Bli en del
            av något speciellt idag och börja tjäna poäng vid varje besök.
          </Text>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinLoyaltyProgram}>
            <Text style={styles.joinButtonText}>Gå med</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal for displaying reward information */}
      {selectedRow && (
        <Modal visible={modalVisible}  animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Updated layout for the "Reward" text and the package icon */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <X stroke={'black'}/>
              </TouchableOpacity>
              <View style={styles.modalHeader}>
                <Gift stroke={'black'} size={28} style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Reward</Text>
                
              </View>
              <Text style={styles.modalRewardTitle}>{selectedRow.title}</Text>
              <Text style={styles.modalDescription}>{selectedRow.description}</Text>
              
            </View>
          </View>
        </Modal>
      )}

        {selectedReward && (
          <Modal visible={confirmModalVisible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Lös in</Text>
                <Text style={styles.modalDescription}>
                  Vill du lösa in {selectedReward.title} för {selectedReward.pointsRequired} poäng?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Avbryt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemPoints}>
                    <Text style={styles.closeButtonText}>Lös in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {selectedReward && (
        <Modal visible={verificationModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View
              entering={FadeIn.duration(600)}
              exiting={FadeOut.duration(600)}
              style={styles.verificationContent}
            >
              <TouchableOpacity style={styles.closeButton} onPress={() => setVerificationModalVisible(false)}>
                <X stroke={'gray'} />
              </TouchableOpacity>

              <View style={tw`mt-4 -mb-4`}>
                
              
                  <Animated.View entering={FadeIn.duration(600)} style={tw`p-16`}>
                    <QRCode value={qrCodeValue} size={150} />
                  </Animated.View>
             
              </View>
             
                <Animated.View entering={FadeIn.duration(600)} style={tw`flex-row`}>
                  <Gift stroke={'gray'} style={tw`mr-1 -mt-0.5`} />
                  <Text style={styles.rewardTitleText}>{selectedReward.title}</Text>
                </Animated.View>
             
            </Animated.View>
          </View>
        </Modal>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  organizationImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  container2: {
    flex: 1,
    backgroundColor: 'white',
    minHeight: '500%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loyaltyPoints: {
    fontSize: 16,
    color: 'gray',
    fontWeight: 'bold',
    marginRight: 5,
  },
  coinIcon: {
    marginTop: 1,
  },
  rewardsContainer: {
    marginTop: 30,
    backgroundColor:'white'
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  customBlurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: 'transparent'
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'white'
  },
  rewardImage: {
    marginRight: 20,
  },
  rewardTitle: {
    color: 'black',
    fontWeight: '500',
    fontSize: 16,
  },
  rewardDescription: {
    color: '#888',
    fontSize: 14,
  },
  pointsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 13,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 5,
  },
  coinIconSmall: {
    marginTop: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  joinButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'lightgray',
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    paddingTop: 30,
    alignItems: 'flex-start',  // Align items to the left
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',  // Row direction to place the icon and text side by side
    alignItems: 'center',  // Center them vertically
    marginBottom: 10,
  },
  modalIcon: {
    marginRight: 10,  // Space between the icon and text
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalRewardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',  // Left-align the description text
  },
  verificationContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  qrCodeContainer: {
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
  },
  shimmerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)', // Soft glow effect
    borderRadius: 15,
  },
  blurEffect: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  iconStyle: {
    marginBottom: 20,
  },

  verificationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#198ACF',
    marginBottom: 10,
  },
  confettiWrapper: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 10,
  },
  rewardTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: 'gray',
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  redeemButton: {
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight:'bold'
  },
});

export default OrganizationPage;
