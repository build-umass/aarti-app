import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type BottomNavProps = {
  activeTab: string;
  onTabPress: (tabName: string) => void;
};

const BottomNavigation: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Home' && styles.activeTab]}
        onPress={() => onTabPress('Home')}
      >
        <Text style={styles.tabText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Search' && styles.activeTab]}
        onPress={() => onTabPress('Search')}
      >
        <Text style={styles.tabText}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Profile' && styles.activeTab]}
        onPress={() => onTabPress('Profile')}
      >
        <Text style={styles.tabText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#333',
  },
});

export default BottomNavigation;