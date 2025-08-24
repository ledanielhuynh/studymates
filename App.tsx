import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from './lib/supabase';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    async function testConnection() {
      try {
        // Test the connection by fetching a simple query
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (error) {
          setConnectionStatus(`Connection error: ${error.message}`);
        } else {
          setConnectionStatus('✅ Supabase connected successfully!');
        }
      } catch (err) {
        setConnectionStatus(`Connection failed: ${err}`);
      }
    }

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StudyMates</Text>
      <Text style={styles.subtitle}>Supabase Connection Test</Text>
      <Text style={styles.status}>{connectionStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});
