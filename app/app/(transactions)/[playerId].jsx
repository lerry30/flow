import { Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { formattedDateAndTime, areDatesEqual } from '@/utils/datetime';
import { formattedNumber, shrinkLargeNumber } from '@/utils/number';

import CustomAlert from '@/components/CustomAlert';
import CustomModal from '@/components/CustomModal';
import AppLogo from '@/components/AppLogo';
import Ionicons from '@expo/vector-icons/Ionicons';

const Transactions = () => {
    const [player, setPlayer] = useState({name: '', status: 0, addedBy: '', createdAt: ''});
    const [transactions, setTransactions] = useState([]);
    const [eachTransaction, setEachTransaction] = useState([]);
    const [eachPrevTransaction, setEachPrevTransaction] = useState([]);
    const [playerAlert, setPlayerAlert] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTransactionId, setDeleteTransactionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actions, setActions] = useState([]);

    const playerId = useLocalSearchParams()?.playerId;
    const router = useRouter();

    const displayActions = (index) => {
        setActions(state => state.map((value, i) => i===index && !value));
    }
    
    const deleteTransaction = async () => {
        try {
            if(!deleteTransactionId && playerId) return;
            setLoading(true);
            const response = await sendJSON(urls['deletetransaction'], {deleteTransactionId, playerId}, 'DELETE');
            if(response) {
                console.log(response?.message);
                setTransactions(state => {
                    return state.map(item => {
                        const deletedState = item?.transactionId===deleteTransactionId || item?.deleted;
                        return {...item, deleted: deletedState};
                    })
                });

                await getPlayer();    
                await getTransactionHistory();
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
            setDeleteTransactionId(null);
            setDeleteModal(false);
        }
    }

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
                const eachTotal = [];
                const prevTotal = [];
                let totalUnitsLastValue = 0;
                for(const item of response.transactions) {
                    const { transaction_id, units, note, action, transaction_date, added_by, deleted } = item;
                    const addedBy = added_by;
                    const transactionDate = transaction_date;
                    const isDeleted = !!deleted;

                    history.push({
                        transactionId: transaction_id,
                        units,
                        note,
                        action,
                        transactionDate,
                        addedBy,
                        deleted: isDeleted
                    });

                    if(isDeleted) {
                        prevTotal.push(totalUnitsLastValue);
                        eachTotal.push(0);
                    } else {
                        const isOut = action==='OUT';
                        const pTotal = prevTotal[Math.max(0, prevTotal.length-1)] || 0;
                        const totalUnits = isOut ? pTotal+units : pTotal-units;

                        prevTotal.push(totalUnits);
                        eachTotal.push(totalUnits);
                        totalUnitsLastValue = totalUnits;
                    }
                }

                console.log('get history');

                setTransactions(history.reverse());
                setActions(Array(history.length).fill(false));
                setEachTransaction(eachTotal.reverse());
                setEachPrevTransaction(prevTotal.reverse());
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
        const isSelected = actions[index];
        const isDeleted = item?.deleted;

        const isOut = item.action === 'OUT';
        const transactionTotal = eachTransaction[index];
        const prevBalance = index+1 >= eachPrevTransaction.length ? 0 : eachPrevTransaction[index+1];

        const prevStatus = shrinkLargeNumber(prevBalance);
        const insOuts = `${isOut?'+':'-'}${formattedNumber(item?.units)}`;
        const status = formattedNumber(transactionTotal);

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => displayActions(index)}>
                <View 
                    className="w-full min-h-[70px] rounded-xl p-4 mb-2 bg-lightshade" 
                    style={{backgroundColor: isOut ? '#f7614099': '#dcdcdc', opacity: isDeleted ? 0.5 : 1}}
                >
                    <View className="flex flex-row justify-between">
                        <Text className="text-primary font-psemibold">{formattedDateAndTime(new Date(item?.transactionDate))}</Text>
                        <Text className="text-primary/90 font-psemibold italic">Updated by: {item?.addedBy}</Text>
                    </View>
                    <View className="flex flex-row justify-between items-end">
                        {!isDeleted && <Text className="font-psemibold text-[20px] text-primary leading-none">{prevStatus}</Text>}
                        <Text className="font-psemibold text-[20px] text-primary leading-none">{insOuts}</Text>
                        {!isDeleted && (
                            <View className="flex flex-col">
                                <Text className="font-psemibold text-primary leading-none">Status:</Text>
                                <Text className="font-psemibold text-[20px] text-primary leading-none">{status}</Text>
                            </View>
                        )}
                    </View>
                    {!isSelected ? 
                        item?.note ? <Text numberOfLines={1}>{item?.note}</Text> : null
                    :
                        <View className="w-full flex flex-col items-end">
                            {item?.note ? <Text className="w-full" numberOfLines={1}>{item?.note}</Text> : null}
                            {!isDeleted && (
                                <TouchableOpacity className="mt-2" activeOpacity={0.9} onPress={()=>{
                                    setDeleteModal(true);
                                    setDeleteTransactionId(item?.transactionId);
                                }}>
                                    <Ionicons name="trash-bin" size={26} color="2e2e2e" />
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                </View>
            </TouchableOpacity>
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

                <Text className="font-pbold text-lg">History</Text>
                <View className="w-full flex-1">
                    <Text className="text-xl text-primary">{player?.name}</Text>
                    <Text className="text-primary/80 italic">Added by: {player?.addedBy}</Text>
                    <Text className="text-primary">{player?.createdAt}</Text>

                    <View className="w-full bg-lightshade rounded-xl px-4 pt-4 pb-2 my-4">
                        <Text className="font-psemibold text-primary">Player Stats:</Text>
                        <Text className="font-psemibold text-[34px] text-primary leading-none">{formattedNumber(player?.status)}</Text>
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
            {deleteModal && <CustomModal visible={true} onProceed={deleteTransaction} onClose={() => setDeleteModal(false)} title="Delete History" message="Are you sure do you want to remove transaction history." />}
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Transactions;
