import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Header, getHeaderTitle, useHeaderHeight } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors'; // Assuming you have this in your project

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const sections = [
  { title: 'Near you', label: 'Curated top picks from this week' },
  { title: 'Food', label: 'Transform your ideas into amazing images' },
  { title: 'Clothing', label: 'Enhance your writing with tools for creation, editing, and style refinement' },
  { title: 'Productivity', label: 'Increase your efficiency' },
  { title: 'Flowers', label: 'Find, evaluate, interpret, and visualize information' },
  { title: 'Books', label: 'Write code, debug, test, and learn' },
];

// Example apps array to use for displaying content
const apps = [
  {
    title: 'Instant Website [Multipage]',
    description:
      'Generates functional multipage websites aimed at meeting the needs of startups and small businesses.',
    author: 'By Max & Kirill Dubovitsky',
    image: 'https://example.com/image1.jpg',
  },
  {
    title: 'Diagrams & Data',
    description: 'Helps research, analyze, and visualize complex data through diagrams and charts.',
    author: 'By Max & Kirill Dubovitsky',
    image: 'https://example.com/image2.jpg',
  },
  {
    title: 'ChatPRD',
    description:
      'Acts as an on-demand Chief Product Officer, enhancing product requirement documents.',
    author: 'By Claire V Lawless',
    image: 'https://example.com/image3.jpg',
  },
];

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(sections[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Track if search bar is open
  const [searchQuery, setSearchQuery] = useState(''); // Track search query
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  // Animated styles for the search bar
  const searchBarStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isSearchOpen ? 300 : 0, { duration: 300 }), // Animate width
      opacity: withTiming(isSearchOpen ? 1 : 0, { duration: 300 }), // Animate opacity
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header and Drawer Setup */}
      <Drawer.Screen
        options={{
          headerBackground: () => (
            <BlurView
              intensity={60}
              tint={'light'}
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(256, 256, 256, 0.5)' }]}
            />
          ),
          headerTransparent: true,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              {/* Search Bar */}
              <Animated.View style={[styles.searchBar, searchBarStyle]}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search..."
                  placeholderTextColor={Colors.grey}
                  style={styles.searchInput}
                />
              </Animated.View>

              {/* Search Icon */}
              <TouchableOpacity
                onPress={() => {
                  setIsSearchOpen(!isSearchOpen); // Toggle search bar
                  if (isSearchOpen) setSearchQuery(''); // Reset search query if closing
                }}
              >
                <Ionicons name="search" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>
          ),
          header: ({ options, route }) => (
            <View>
              <Header {...options} title={getHeaderTitle(options, route.name)} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
                {sections.map((section, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelected(section);
                    }}
                    style={selected === section ? styles.sectionBtnSelected : styles.sectionBtn}>
                    <Text
                      style={
                        selected === section ? styles.sectionBtnTextSelected : styles.sectionBtnText
                      }>
                      {section.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ),
        }}
      />

      {/* Main Content */}
      <ScrollView contentContainerStyle={{ paddingTop: headerHeight - 40 }}>
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            {selected === section && (
              <Animated.View
                style={styles.section}
                entering={FadeIn.duration(600).delay(400)}
                exiting={FadeOut.duration(400)}>
                <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                  <Text style={styles.title}>{selected.title}</Text>
                </ShimmerPlaceholder>
                <ShimmerPlaceholder
                  width={280}
                  height={20}
                  visible={!loading}
                  shimmerStyle={{ marginVertical: 10 }}>
                  <Text style={styles.label}>{selected.label}</Text>
                </ShimmerPlaceholder>

                {/* Sample Content (Cards) */}
                {apps.map((app, idx) => (
                  <View key={idx} style={styles.card}>
                    <ShimmerPlaceholder
                      width={60}
                      height={60}
                      shimmerStyle={{ borderRadius: 30 }}
                      visible={!loading}>
                      <Image source={{ uri: app.image }} style={styles.cardImage} />
                    </ShimmerPlaceholder>

                    <View style={{ flexShrink: 1, gap: 4 }}>
                      <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                        <Text style={styles.cardTitle}>{app.title}</Text>
                      </ShimmerPlaceholder>

                      <ShimmerPlaceholder width={160} height={20} visible={!loading}>
                        <Text style={styles.cardDesc}>{app.description}</Text>
                      </ShimmerPlaceholder>

                      <ShimmerPlaceholder width={250} height={20} visible={!loading}>
                        <Text style={styles.cardAuthor}>{app.author}</Text>
                      </ShimmerPlaceholder>
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchBar: {
    height: 40,
    marginRight: 10,
    backgroundColor: '#EEE9F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  searchInput: {
    color: 'black',
    fontSize: 16,
    width: '100%',
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionBtn: {
    backgroundColor: '#EEE9F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionBtnSelected: {
    backgroundColor: Colors.grey,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionBtnText: {
    color: '#000',
    fontWeight: '500',
  },
  sectionBtnTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    borderRadius: 8,
    backgroundColor: Colors.input,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 14,
    color: '#000',
  },
  cardAuthor: {
    fontSize: 14,
    color: '#666',
  },
});

export default Page;
