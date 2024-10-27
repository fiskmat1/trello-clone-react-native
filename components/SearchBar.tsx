import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MapPin, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';

const MAPBOX_API_KEY = 'pk.eyJ1IjoiZmlza21hdCIsImEiOiJjbTF3ZmYyYXUwbmgyMmpzamlrNXVtbjdrIn0.717Y9Y6vuzKRdjlfRxaKkw';

type SearchBarProps = {
  setCity: (city: string) => void;
  city: string;
};

const SearchBar = ({ setCity, city }: SearchBarProps) => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'MapScreen'>>();

  const fetchMapboxPlaces = async (text: string) => {
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=${MAPBOX_API_KEY}`
      );
      const data = await response.json();
      setResults(data.features || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setCity(place.place_name);
    setSearchText(place.place_name);
    setResults([]);
    setSelectedLocation(place.center);
  };

  const handleSearch = () => {
    if (selectedLocation) {
      navigation.navigate('mapscreen/index', { coordinates: selectedLocation });
      setSearchText('');
    }
  };

  const closeAutocomplete = () => {
    setResults([]);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={closeAutocomplete}>
      <BlurView intensity={40} tint="light" style={styles.glassContainer}>
        <View style={styles.inputRow}>
          <MapPin size={24} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Sök"
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              fetchMapboxPlaces(text);
            }}
            style={styles.textInput}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={13} color="black" />
            <Text style={styles.searchButtonText}>Sök</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="small" color="#000000" style={styles.loading} />}

        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectPlace(item)}>
                <Text style={styles.resultItem}>{item.place_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.resultsList}
          />
        )}
      </BlurView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: 15,
    padding: 9,
    overflow: 'hidden',
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 15,
    fontWeight: '700',
    color: '#000000', // Black text color
    marginLeft: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly transparent for button
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  searchButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
    color: 'gray', // Black text color
  },
  loading: {
    marginTop: 10,
  },
  resultsList: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly transparent for glass effect
    borderRadius: 10,
    paddingHorizontal: 10,
    maxHeight: 200,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    color: '#000000', // Black text color
  },
});

export default SearchBar;
