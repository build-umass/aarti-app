// Install these dependencies:
// npm install @react-navigation/native-stack @react-navigation/native

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Type definitions
interface Resource {
  id: string;
  title: string;
  content: string;
}

type RootStackParamList = {
  Resources: undefined;
  ResourceDetails: { resource: Resource };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Sample data
const resources: Resource[] = [
  { id: '1', title: 'Resource 1', content: 'Detailed content for getting started...' },
  { id: '2', title: 'Resource 2', content: 'Best practices for development...' },
  { id: '3', title: 'Resource 3', content: 'Complete API documentation...' },
];

// Resources List Screen
const ResourcesScreen: React.FC<any> = ({ navigation }) => {
  const renderResource = ({ item }: { item: Resource }) => (
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
        data={resources}
        renderItem={renderResource}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

// Resource Details Screen
const ResourceDetailsScreen: React.FC<any> = ({ route }) => {
  const { resource } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.detailsTitle}>{resource.title}</Text>
      <Text style={styles.content}>{resource.content}</Text>
    </View>
  );
};

const Resources: React.FC = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen 
          name="Resources" 
          component={ResourcesScreen}
          options={{
            title: 'Resources',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="ResourceDetails" 
          component={ResourceDetailsScreen}
          options={({ route }) => ({ 
            title: route.params.resource.title,
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  resourceTitle: {
    fontSize: 16,
    flex: 1,
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