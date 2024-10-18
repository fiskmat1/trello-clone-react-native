import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import tw from 'tailwind-react-native-classnames';
import { Feather } from '@expo/vector-icons'; // Icon pack
import { SafeAreaView } from 'react-native';

const Page = () => {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName);
  const [emailAdress, setEmail] = useState(user?.primaryEmailAddress?.emailAddress);
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white' }} edges={['top']}>
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`px-6 py-8`}>
        {/* Profile Section */}
        <View style={tw`flex-row justify-between items-center mb-8`}>
          <View style={tw`flex-row items-center`}>
            
            <View style={tw`ml-4`}>
              <Text style={tw`text-xl font-bold text-black`}>{firstName}</Text>
              <Text style={tw`text-sm text-gray-500`}>{emailAdress}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => signOut()}>
            <Feather name="log-out" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Options Section */}
        <View style={tw`bg-gray-100 rounded-lg p-4 mb-6`}>
          
          <TouchableOpacity style={tw`flex-row justify-between items-center py-4 border-b border-gray-200`}>
            <Text style={tw`text-lg text-black`}>Payment Methods</Text>
            <Feather name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={tw`flex-row justify-between items-center py-4 border-b border-gray-200`}>
            <Text style={tw`text-lg text-black`}>Settings</Text>
            <Feather name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={tw`flex-row justify-between items-center py-4`}>
            <Text style={tw`text-lg text-black`}>Help & Support</Text>
            <Feather name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={() => signOut()}
          style={tw`bg-black py-4 rounded-lg mt-4`}>
          <Text style={tw`text-white text-center text-lg font-semibold`}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
