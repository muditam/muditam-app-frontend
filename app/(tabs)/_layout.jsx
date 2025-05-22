import { Tabs } from 'expo-router';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import '../../global.css'; 

export default function Layout() {
  return ( 
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          const iconColor = focused ? '#543287' : '#666';
          const bgColor = focused ? '#f1ecff' : 'transparent';

          let icon;
          let label;

          if (route.name === 'home') {
            icon = <Ionicons name="home-outline" size={25} color={iconColor} />;
            label = 'Home';
          } else if (route.name === 'test') {
            icon = <FontAwesome5 name="file-alt" size={25} color={iconColor} />;
            label = 'Start Quiz';
          } else if (route.name === 'products') {
            icon = <Ionicons name="cart-outline" size={25} color={iconColor} />;
            label = 'Products';
          } else if (route.name === 'me') {
            icon = <MaterialIcons name="person-outline" size={25} color={iconColor} />;
            label = 'You';
          }

          return (
            <View
              style={{
                width: 70,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: bgColor,
                  padding: 2,
                  borderRadius: 50,
                  marginBottom: 0,
                }}
              >
                {icon}
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: iconColor,
                  fontWeight: focused ? '600' : '400',
                  textAlign: 'center',
                  flexWrap: 'nowrap',
                }}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="test" />
      <Tabs.Screen name="products" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}