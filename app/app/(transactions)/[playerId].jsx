import { Text, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { formattedDateAndTime, areDatesEqual } from '@/utils/datetime';
import { formattedNumber, shrinkLargeNumber } from '@/utils/number';

import CustomAlert from '@/components/CustomAlert';
import AppLogo from '@/components/AppLogo';

const Transactions = () => {
    const [player, setPlayer] = useState({name: '', status: 0, addedBy: '', createdAt: ''});
    const [transactions, setTransactions] = useState([]);
    const [playerAlert, setPlayerAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const playerId = useLocalSearchParams()?.playerId;
    const router = useRouter();

    const getPlayer = async () => {
        try {
            setLoading(true);
            if(playerId < 0) throw new Error('Player not found.');

            const response = await sendJSON(urls['getplayer'], {playerId});
            if(response) {
                const {firstname, lastname, status, added_by, created_at} = response.player;
                const name = `${firstname} ${lastname}`;
                const createdAt = formattedDateAndTime(new Date(created_at));
                setPlayer({name, status, addedBy: added_by, createdAt});
            }
        } catch(error) {
            setPlayerAlert(true);
            console.log('Function: getPlayer ', error?.message);
        } finally {
            setLoading(false);
        }
    }

    const getTransactionHistory = async() => {
        try {
            setLoading(true);
            if(playerId < 0) throw new Error('Player not found.');

            const response = await sendJSON(urls['gettransactions'], {playerId});
            if(response) {
                const history = [];
                for(const item of response.transactions) {
                    const { transaction_id, units, action, transaction_date, prev_status, added_by } = item;
                    const addedBy = added_by;
                    const transactionDate = transaction_date;
                    const prevStatus = prev_status;

                    // Merge employees ins/outs a day
                    //for(const existing of history) {
                    //    if(existing.addedBy === addedBy) {
                    //        if(areDatesEqual(new Date(existing.transactionDate), new Date(transactionDate))) {
                    //            console.log(existing.transactionDate, transactionDate);
                    //        }
                    //    }
                    //}

                    history.push({
                        transactionId: transaction_id,
                        units,
                        action,
                        prevStatus,
                        transactionDate,
                        addedBy
                    });
                }

                setTransactions(history.reverse());
            }
        } catch(error) {
            setPlayerAlert(true);
            console.log('Function: getTransactionHistory ', error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getPlayer();    
        getTransactionHistory();
    }, [])

    const renderItem = ({item, index}) => {
        const isOut = item.action === 'OUT';
        const prevStatus = shrinkLargeNumber(item?.prevStatus);
        const insOuts = `${isOut?'+':'-'}${formattedNumber(item?.units)}`;
        const status = formattedNumber(isOut ? item?.prevStatus + item?.units : item?.prevStatus - item?.units);
        return (
            <View 
                className="w-full min-h-[70px] rounded-xl p-4 mb-2 bg-lightshade" 
                style={{backgroundColor: isOut ? '#dc3f1c77': '#dcdcdc'}}
            >
                <View className="flex flex-row justify-between">
                    <Text className="text-primary font-psemibold">{formattedDateAndTime(new Date(item?.transactionDate))}</Text>
                    <Text className="text-primary/90 font-psemibold italic">Updated by: {item?.addedBy}</Text>
                </View>
                <View className="flex flex-row justify-between items-end">
                    <View className="flex flex-col">
                        {/* <Text className="font-psemibold text-primary leading-none">Balance:</Text> */}
                        <Text className="font-psemibold text-[20px] text-primary leading-none">{prevStatus}</Text>
                    </View>
                    <Text className="font-psemibold text-[20px] text-primary leading-none">{insOuts}</Text>
                    <View className="flex flex-col">
                        <Text className="font-psemibold text-primary leading-none">Status:</Text>
                        <Text className="font-psemibold text-[20px] text-primary leading-none">{status}</Text>
                    </View>
                </View>
            </View>
        );
    }

    if(loading) {
        return (
            <SafeAreaView className="flex-1 flex justify-center items-center">
                <ActivityIndicator size="large" color="#dc3f1c" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 w-full px-4 bg-white">
                <View className="w-[90px]">
                    <AppLogo style={{ width: 'fit-content' }} />
                </View>

                <Text className="font-pbold text-lg py-2">History</Text>
                <View className="w-full flex-1">
                    <Text className="text-xl text-primary">{player?.name}</Text>
                    <Text className="text-primary/80 italic">Added by: {player?.addedBy}</Text>
                    <Text className="text-primary">{player?.createdAt}</Text>

                    <View className="w-full bg-lightshade rounded-xl px-4 pt-4 pb-2 my-4">
                        <Text className="font-psemibold text-primary">Player Stats:</Text>
                        <Text className="font-psemibold text-[40px] text-primary leading-none">{formattedNumber(player?.status)}</Text>
                    </View>

                    <View className="flex-1">
                        <FlatList
                            data={transactions}
                            keyExtractor={(item) => item.transactionId.toString()}
                            renderItem={renderItem}
                            ListFooterComponent={() => <></>}
                            ListEmptyComponent={() => (
                                <View className="flex justify-content items-center p-20">
                                    <Text className="text-2xl text-primary/70 font-pbold">Empty List</Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </View>

            {playerAlert && <CustomAlert visible={true} onClose={() => router.push('(tabs)/players')} title="Player not Found" message="There's something wrong." />}
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Transactions;
