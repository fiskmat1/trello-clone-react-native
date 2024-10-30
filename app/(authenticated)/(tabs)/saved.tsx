import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { useAuth, useSession } from '@clerk/clerk-expo';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { Coins } from 'lucide-react-native';
import tw from 'tailwind-react-native-classnames';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import logoCoinTransparentExtra from '@/assets/images/logoCoinextra.png';

const backgroundImageUrl = "https://i.imgur.com/xuU9pfX.png";

const Page = () => {
  const { userId } = useAuth();
  const { session } = useSession();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const clerkToken = await session?.getToken({ template: 'supabase' });

      const response = await fetch(
        `https://kakfeitxqdcmedofleip.supabase.co/functions/v1/fetch-saved?appuserId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, session]);

  useEffect(() => {
    if (userId) {
      fetchOrganizations();
    }
  }, [userId, fetchOrganizations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrganizations();
  };

  const handleOrgPress = (id) => {
    if (userId) {
      navigation.navigate('organization/[id]', { id, appuserId: userId });
    } else {
      console.error('User is not signed in');
    }
  };

  if (loading && !refreshing) {
    return null;
  }

  return (
    <ImageBackground
      source={{ uri: backgroundImageUrl }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flex: 1, padding: 20 }}>
        <BlurView intensity={80} tint="light" style={[styles.sectionCard]}>
          <View style={tw`flex-row`}>
          <Bookmark stroke={'black'} style={tw`mr-1.5 mt-0.5`} />
          <Text style={styles.sectionTitle}>Sparade</Text>
          </View>
          <Text style={styles.sectionLabel}>Dina sparade butiker</Text>
        </BlurView>
        
        <View style={styles.orgContainerCard}>
        <BlurView intensity={80} tint="light" style={styles.orgBlurCard} >
          <FlatList
            showsVerticalScrollIndicator={false}
            data={organizations}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item: organization }) => (
              <TouchableOpacity onPress={() => handleOrgPress(organization.id)} style={styles.cardContainer}>
                <BlurView intensity={60} tint="light" style={styles.card}>
                  <ShimmerPlaceholder
                    width={60}
                    height={60}
                    shimmerStyle={{ borderRadius: 30 }}
                    visible={!loading}>
                    <Image
                      source={{
                        uri: organization.image || 'https://images.unsplash.com/photo-1660792709474-cc1e1e4c88ba?q=80&w=2324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                      }}
                      style={styles.cardImage}
                    />
                  </ShimmerPlaceholder>

                  <View style={{ flexShrink: 1, gap: 4 }}>
                    <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                      <Text style={styles.cardTitle}>{organization.name}</Text>
                    </ShimmerPlaceholder>

                    <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                    <View style={tw`items-center flex-row`}>
                      <Text style={styles.cardDesc}>Se mer</Text>
                      <ChevronRight stroke={'black'} size={11} style={tw`mt-0.5`} />
                      </View>
                    </ShimmerPlaceholder>
                    
                    <View style={tw `flex-row items-center`}>
                      <Text style={styles.pointsText}>{organization.points}</Text>
                      <Image source={logoCoinTransparentExtra} style={styles.coinImage} />
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No organizations found</Text>}
          />
          </BlurView>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 28,
  
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
  orgContainerCard: {
    borderRadius: 15,
    height: '72%',
    overflow: 'hidden'
  },
  orgBlurCard: {
    borderRadius: 15,
    padding: 15,
    height: '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F2F1F3',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Semi-transparent background for glass effect
    borderRadius: 16,
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
    color: '#333',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
  },
  pointsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  coinImage: {
    width: 35,
    height: 35,
    alignSelf: 'center',
    marginLeft: -4
 

  },
});

export default Page;
