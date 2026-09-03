import { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View, Text, ScrollView, StyleSheet } from 'react-native';
import { ResourceService } from '@/services/ResourceService';
import { BrandColors } from '@/constants/Theme';
import { MockResource, Section } from '../../../../../types';

export default function ResourceDetailsScreen() {
  const { resource: id } = useLocalSearchParams<{ resource: string }>();
  const [resource, setResource] = useState<MockResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const row = await ResourceService.getResourceById(id);
        if (row) {
          setResource({
            id: row.id,
            title: row.title,
            sections: JSON.parse(row.sections) as Section[],
          });
        }
      } catch (error) {
        console.error('Failed to load resource:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

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
