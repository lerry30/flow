import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState, useRef } from 'react';
import { zUser } from '@/store/user';
import { useRouter } from 'expo-router';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { formattedNumber } from '@/utils/number';
import { formattedDateAndTime } from '@/utils/datetime';
import { appInactivityLogout } from '@/utils/loggedOut';

import Search from '@/components/Search';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Header from '@/components/Header';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const intervalId = useRef(undefined);
    const RELOADTIME = 5000; // should not be lower to 9 seconds

    const displayActions = (index) => {
        setActions(state => state.map((value, i) => i===index && !value));
    }

    const setPlayersData = (data) => {
        if(data) {
            const listOfPlayers = data?.players?.map(item => ({
                ...item,
                playerId: item.player_id,
                createdAt: formattedDateAndTime(new Date(item.last_updated)),
            }));

            setPlayers(listOfPlayers);
            setActions(state => {
                const currentOpen = state.indexOf(true);
                const offset = listOfPlayers.length - state.length;
                if(offset > 0) {
                    const list = Array(listOfPlayers.length).fill(false);
                    if(currentOpen >= 0) {
                        const index = currentOpen+offset;
                        if(index < list.length) list[index] = true;
                    }

                    return list;
                } else {
                    return state;
                }   
            });
        }
    }

    const getPlayers = async () => {
        try {
            const response = await sendJSON(urls['getplayers'], {});
            setPlayersData(response);
            setLoading(false);
        } catch(error) {
            console.log(error?.message);
            router.push('(user)/login');
        }
    }

    useFocusEffect(
        useCallback(() => {
            if(!zUser.getState()?.username) {
                router.push('(user)/login');
            } else {
                setLoading(true);
                getPlayers();
                intervalId.current = setInterval(() => getPlayers(), RELOADTIME);
            }

            return () => {
                clearInterval(intervalId.current);
            }
        }, [])
    );

    const renderItem = ({item, index}) => {
        const isSelected = !!actions[index];
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => displayActions(index)} className="relative" style={{marginBottom: isSelected ? 50 : 8}}>
                <View className="w-[180px] h-[50px] flex flex-row justify-between items-end px-4 py-2 rounded-b-xl bg-lightshade" style={{position: 'absolute', right: 0, bottom: isSelected ? -40 : 0}}>
                    <TouchableOpacity activeOpacity={0.9} onPress={()=>router.push(`(player)/edit/${item.playerId}`)}>
                        <FontAwesome5 name="user-edit" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.9} onPress={()=>router.push(`(transactions)/${item.playerId}`)}>
                        <FontAwesome5 name="scroll" size={24} color="#2e2e2e" />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.9} onPress={()=>router.push(`(record)/${item.playerId}`)}>
                        <MaterialCommunityIcons name="hand-coin" size={28} color="black" />
                    </TouchableOpacity>
                </View>
                <View className="min-h-[70px] rounded-xl p-4 bg-lightshade">
                    <View className="flex flex-row justify-between items-end">
                        <Text className="text-primary font-psemibold">{`${item?.firstname} ${item?.lastname}`}</Text>
                        <Text className="text-primary text-lg font-psemibold">{formattedNumber(item?.status)}</Text>
                    </View>
                    <View className="flex flex-row justify-between">
                        <Text className="text-primary font-pthin italic">Added By: @{item?.added_by}</Text>
                        <Text className="text-primary font-psemibold">{item?.createdAt}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    appInactivityLogout();

    if(loading) {
        return (
            <SafeAreaView className="flex-1 flex justify-center items-center">
                <ActivityIndicator size="large" color="#dc3f1c" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 w-full min-h-screen px-4 bg-white">
                <Header />
                <Text className="font-pbold text-lg py-2">Players</Text>
                <Search 
                    callback={(result) => {
                        setPlayers([]);
                        clearInterval(intervalId.current);
                        setPlayersData(result);
                    }} 
                    reset={() => {
                        setLoading(true);
                        getPlayers();
                        intervalId.current = setInterval(() => getPlayers(), RELOADTIME);
                    }} />
                
                <View className="flex-1 mt-4">
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.playerId.toString()}
                        renderItem={renderItem}
                        ListFooterComponent={<View style={{ height: 100 }} />} // Adjust height based on your tab bar
                        ListEmptyComponent={() => (
                            <View className="w-full h-full flex-1 flex justify-center items-center p-20">
                                <Text className="text-primary/70 text-2xl text-center font-pbold">Empty List</Text>
                            </View>
                        )}
                    />
                </View>
            </View>

            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Players;
