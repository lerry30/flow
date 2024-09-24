import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';

import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const TabLayout = () => {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#dc3f1c',
            tabBarInactiveTintColor: '#2e2e2e',
            tabBarStyle: {
                backgroundColor: '#fff',
                height: 68,
                paddingTop: 4,
                paddingBottom: 8,
            }
        }}>
            <Tabs.Screen 
                name="players"
                options={{
                    tabBarLabel: ({color}) => <Text className="font-pbold text-[12px]" style={{color: `${color}`}}>Players</Text>,
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="account-group-outline" size={30} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    tabBarLabel: ({color}) => <Text className="font-pbold text-[12px]" style={{color: `${color}`}}>Add Player</Text>,
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="account-plus-outline" size={30} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="pnl"
                options={{
                    tabBarLabel: ({color}) => <Text className="font-pbold text-[12px]" style={{color: `${color}`}}>P & L</Text>,
                    tabBarIcon: ({color}) => (
                        <View className="rotate-[90deg]">
                            <FontAwesome6 name="arrow-right-arrow-left" size={20} color={color} />
                        </View>
                    )
                }}
            />
            <Tabs.Screen
                name="summary"
                options={{
                    tabBarLabel: ({color}) => <Text className="font-pbold text-[12px]" style={{color: `${color}`}}>Summary</Text>,
                    tabBarIcon: ({color}) => (
                        <Octicons name="graph" size={24} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}

export default TabLayout;
