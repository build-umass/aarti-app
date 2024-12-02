import React, { useState, useCallback, useEffect } from 'react';
import { View, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { storage } from '@/constants/Storage';

const API_URL = 'https://jsonplaceeeholder.typicode.com/posts/1';

export default function DataUpdateExample() {
    // Store the serialized data in MMKV
    const [storedData, setStoredData] = useMMKVString("api.data");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchAndUpdateData = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL);
            const newData = await response.json();
            const serializedNewData = JSON.stringify(newData);

            // Compare with currently stored data
            if (serializedNewData !== storedData) {
                setStoredData(serializedNewData);
            }
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    }, [storedData, setStoredData]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchAndUpdateData();
    }, []);

    const displayData = storedData ? JSON.parse(storedData) : null;

    return (
        <View style={styles.container}>
            <Button
                title="Refresh Data"
                onPress={fetchAndUpdateData}
                disabled={isLoading}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            <View style={styles.displayContainer}>
                <Text style={styles.label}>Stored Data:</Text>
                {displayData ? (
                    <View style={styles.dataContainer}>
                        <Text style={styles.title}>{displayData.title}</Text>
                        <Text style={styles.body}>{displayData.body}</Text>
                    </View>
                ) : (
                    <Text style={styles.noData}>No data stored</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    loadingContainer: {
        marginVertical: 20,
    },
    displayContainer: {
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dataContainer: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    body: {
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
    noData: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#666',
    },
});