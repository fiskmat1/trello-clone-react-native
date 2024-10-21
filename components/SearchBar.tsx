import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import tailwind from 'tailwind-react-native-classnames';
import { MapPin } from 'lucide-react-native';
import { Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './@types'; // Import the types

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

  // Use StackNavigationProp with our defined RootStackParamList
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'MapScreen'>>(); 

  // Function to fetch results from Mapbox API
  const fetchMapboxPlaces = async (text: string) => {
    if (text.length < 2) {
      setResults([]); // Clear results if input is too short
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
    setSelectedLocation(place.center); // Store the coordinates of the selected place
  };

  const handleSearch = () => {
    if (selectedLocation) {
      // Navigate to the map screen with the selected coordinates
      navigation.navigate('mapscreen/index', { coordinates: selectedLocation });
    }
  };

  const closeAutocomplete = () => {
    setResults([]); // Close results list when clicking outside
    Keyboard.dismiss(); // Close the keyboard
  };

  return (
    <TouchableWithoutFeedback onPress={closeAutocomplete}>
      <View style={styles.container}>
        {/* Input and Button Wrapper */}
        <View style={tailwind`flex-row items-center`}>
          {/* Left Icon and Text Input */}
          <View style={tailwind`flex-1 flex-row items-center`}>
            <MapPin size={24} color="#CCCCCC" style={tailwind`ml-3`} />
            <TextInput
              placeholder={"Search"}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                fetchMapboxPlaces(text);
              }}
              style={styles.textInput}
              onFocus={() => setResults([])} // Show results only when typing
            />
          </View>

          {/* Right Button */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={13} color="black" />
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && <ActivityIndicator size="small" color="#000" style={tailwind`mt-2`} />}

        {/* Results List */}
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
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderBottomWidth: 0,
    borderColor: '#ddd',
    paddingBottom: 10,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  searchButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  resultsList: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    maxHeight: 200,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default SearchBar;
