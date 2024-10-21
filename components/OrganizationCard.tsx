import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrganizationCard = ({ name, email, phone }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.phone}>{phone}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    color: 'gray',
    marginTop: 5,
  },
  phone: {
    color: 'gray',
    marginTop: 5,
  },
});

export default OrganizationCard;
