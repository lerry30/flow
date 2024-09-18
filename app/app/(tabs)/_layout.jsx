import { Text } from 'react-native';
import { Tabs } from 'expo-router';

import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

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
                name="home"
                options={{
                    tabBarLabel: ({color}) => <Text className="font-pbold text-[12px]" style={{color: `${color}`}}>Home</Text>,
                    tabBarIcon: ({color}) => (
                        <Ionicons name="home-sharp" size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    tabBarLabel: ({color}) => <Text className="font-pbold text-[12px]" style={{color: `${color}`}}></Text>,
                    tabBarIcon: ({color}) => (
                        <AntDesign name="pluscircleo" size={38} color={color} />
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
