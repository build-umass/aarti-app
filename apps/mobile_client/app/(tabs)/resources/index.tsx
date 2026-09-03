import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ResourceService } from '@/services/ResourceService';
import { MockResource, Section } from '../../../../../types';

export default function ResourcesScreen() {
  const [resources, setResources] = useState<MockResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await ResourceService.getAllResources();
        setResources(
          rows.map((r) => ({
            id: r.id,
            title: r.title,
            sections: JSON.parse(r.sections) as Section[],
          }))
        );
      } catch (error) {
        console.error('Failed to load resources:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderResource = ({ item }: { item: MockResource }) => (
    <TouchableOpacity
      style={styles.resourceItem}
      onPress={() => router.push(`/resources/${item.id}`)}
    >
      <Text style={styles.resourceTitle}>{item.title}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={resources}
        renderItem={renderResource}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    height: '100%',
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    height: '100%',
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
  arrow: {
    fontSize: 18,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
