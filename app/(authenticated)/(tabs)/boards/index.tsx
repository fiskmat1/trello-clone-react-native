import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Alert,
  ActivityIndicator,
  View,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import HeaderTabs from '@/components/HeaderTabs'; // Represents the Delivery/Pickup tabs
import SearchBar from '@/components/SearchBar'; // A search bar for entering a city
import Categories from '@/components/Categories'; // Scrollable categories section
import { Colors } from '@/constants/Colors';
import tailwind from 'tailwind-react-native-classnames';
import { SafeAreaView } from 'react-native';

const Page = () => {
  const [city, setCity] = useState('San Francisco');
  const [activeTab, setActiveTab] = useState('Delivery'); // Represents "Delivery" or "Pickup"
  const [restaurantData, setRestaurantData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRestaurants = async () => {
    const YELP_API_KEY = 'YOUR_YELP_API_KEY';
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${city}`;

    const apiOptions = {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    };

    setLoading(true);
    try {
      const res = await fetch(yelpUrl, apiOptions);
      const json = await res.json();
      setRestaurantData(
        json?.businesses?.filter((business) =>
          business.transactions.includes(activeTab.toLowerCase())
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Could not fetch restaurant data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRestaurants();
  }, [city, activeTab]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white' }} edges={['top']}>
    <View style={styles.container}>
      {/* Header Tabs */}
      <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Search Bar */}
      <SearchBar city={city} setCity={setCity} />

      {/* Scrollable Categories & Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={tailwind`flex-1`}>
        <Categories />

        {/* Loading Indicator */}
        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={tailwind`mt-2 mb-6`}
          />
        )}

        {/* Placeholder for Restaurant Items */}
        {/* Map over the restaurantData array and show items in the future */}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default Page;
