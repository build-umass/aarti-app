// Install these dependencies:
// npm install @react-navigation/native-stack @react-navigation/native

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { resources } from '@/mockData/resourcesMockData';
import { mainResource } from '@/mockData/resourcesMockData';
import { MockResource } from '../../../../types';
// Type definitions
interface Resource {
  id: string;
  title: string;
  content: string;
}

type RootStackParamList = {
  Resources: undefined;
  ResourceDetails: { resource: MockResource }; //include a parameter resource when accessing the route
};

const Stack = createNativeStackNavigator<RootStackParamList>(); //passing in the RootStackParamList means that the Stack later will have 2 screens, one is Resources and one is ResourcesDetail screen
// Mock data

// Resources List Screen
const ResourcesScreen: React.FC<any> = ({ navigation }) => {
  const renderResource = ({ item }: { item: MockResource }) => (
    <TouchableOpacity
      style={styles.resourceItem}
      onPress={() => navigation.navigate('ResourceDetails', { resource: item })}
    >
      <Text style={styles.resourceTitle}>{item.title}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mainResource}
        renderItem={renderResource}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

// Resource Details Screen
const ResourceDetailsScreen: React.FC<any> = ({ route }) => {
  const { resource } : {resource : MockResource} = route.params;

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.detailsTitle}>{resource.title}</Text>
        {/* <Text style={styles.content}>{resource.content}</Text> */}
        <View>
          {/* container of all sections */}
          {resource.sections.map( (s, index) => (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>{index + 1}.{s.header}</Text>
              <Text style={styles.sectionContent}>{s.content}</Text>
            </View>
          ))}

        </View>
        
      </View>
    </ScrollView>
  );
};

const Resources = () => {
  return (
      <Stack.Navigator 
        screenOptions={ {
          headerShown: false
        }}
      >
        {/* !First screen, also the root screen */}
        <Stack.Screen 
          name="Resources" 
          component={ResourcesScreen}
          // options={{
          //   title: '',
          //   headerStyle: {
          //     backgroundColor: '#FFFFFF',
          //   },
          //   headerTintColor: '#E0C692',
          // }}
        />
        <Stack.Screen 
          name="ResourceDetails" 
          component={ResourceDetailsScreen}
          options={({ route }) => ({ 
            title: route.params.resource.title, //!ResourceDetails is defined as {resource : MockResource} so we can access it as route.param.resource, MockResource has a title attribute so we can access it as normal
            headerStyle: {
              backgroundColor: '#5F2446',
            },
            headerTintColor: '#E0C692',
            headerShown : true
          })}
        />
      </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    height: '100%',
  },
  listContainer:{
     // flex : 1,
     backgroundColor: '#FFFFFF',
     // backgroundColor: '#F0FFF0',
     height: '100%',
     // justifyContent: 'space-evenly',
     // alignItems: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    
  },
  resourceTitle: {
    flex: 1,
    color: '#2270CA',
    fontSize: 25,
  },

  sectionContainer:{
    padding: 10
  },
  sectionHeader:{
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent:{
    fontSize: 16,
    lineHeight: 24,
  },
  arrow: {
    fontSize: 18,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Resources;