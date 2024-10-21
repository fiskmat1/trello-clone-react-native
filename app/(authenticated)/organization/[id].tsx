import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

type OrganizationRouteProp = RouteProp<{ params: { id: string } }, 'params'>;

const OrganizationPage = () => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute<OrganizationRouteProp>();
  const { id } = route.params;

  useEffect(() => {
    // Fetch organization data based on ID
    const fetchOrganization = async () => {
      try {
        
        const response = await fetch(`https://kakfeitxqdcmedofleip.supabase.co/functions/v1/get-organization-by-id?id=${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        console.log(response)
        const data = await response.json();
    
        setOrganization(data);
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!organization) {
    return <Text>No organization found.</Text>;
  }

  return (
   
    <View style={styles.container}>
      <Text style={styles.title}>{organization.name}</Text>
      <Text>{organization.address}</Text>
      <Text>{organization.phone}</Text>
    </View>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default OrganizationPage;
