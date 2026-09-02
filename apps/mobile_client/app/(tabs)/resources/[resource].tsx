import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { mainResource } from '@/mockData/resourcesMockData';
import { BrandColors } from '@/constants/Theme';

export default function ResourceDetailsScreen() {
  const { resource: id } = useLocalSearchParams<{ resource: string }>();
  const resource = mainResource.find((r) => r.id === id);

  if (!resource) {
    return (
      <View style={styles.container}>
        <Text style={styles.detailsTitle}>Resource not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: resource.title,
          headerShown: true,
          headerStyle: { backgroundColor: BrandColors.primary },
          headerTintColor: '#E0C692',
        }}
      />
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.detailsTitle}>{resource.title}</Text>
          <View>
            {resource.sections.map((s, index) => (
              <View style={styles.sectionContainer} key={`${s.header}-${index}`}>
                <Text style={styles.sectionHeader}>{index + 1}.{s.header}</Text>
                <Text style={styles.sectionContent}>{s.content}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  sectionContainer: {
    padding: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
