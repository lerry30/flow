import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { formattedDateAus, formatTimeFromString } from '@/utils/datetime';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import CustomButton from '@/components/CustomButton';
import CustomModal from '@/components/CustomModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ProfitNLoss = () => {
    const [data, setData] = useState({profits: [], losses: []});
    const [revActions, setRevActions] = useState([]);
    const [expActions, setExpActions] = useState([]);
    const [totalNet, setTotalNet] = useState(0);
    const [loading, setLoading] = useState(false);
    const [deleteData, setDeleteData] = useState({status: false, id: 0, category: ''});

    const router = useRouter();
    const date = useLocalSearchParams()?.date;
    const ausDateFormat = formattedDateAus(new Date(date));

    const removePnL = async () => {
        try {
            setLoading(true);
            const category = deleteData?.category;
            if(category!=='revenue' && category!=='expense') throw new Error('Unknown category');
            if(!deleteData?.id || !deleteData?.category) throw new Error('Unable to proceed deletion due to lack of properties needed.');    

            const fData = {id: deleteData?.id, category: deleteData?.category};
            const response = await sendJSON(urls['deletepnl'], fData, 'DELETE'); 
            if(response) {
                await getPnL();
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
            setDeleteData({status: false, id: 0, category: ''});
        }
    }

    const getPnL = async () => {
        try {
            setLoading(true);
            const response = await sendJSON(urls['getpnl'], {date}, 'POST');
            if(response) {
                const revenues = response?.revenues || [];
                const expenses = response?.expenses || [];
 
                let totalRev = 0;
                for(let i = 0; i < revenues.length; i++) {
                    const rev = revenues[i];
                    revenues[i] = {
                        id: rev.id,
                        revenue: rev.revenue,
                        revNote: rev.revenue_note,
                        time: formatTimeFromString(rev.entry_time),
                        addedBy: rev.username,
                    }

                    totalRev += toNumber(rev.revenue);
                }

                let totalExp = 0;
                for(let i = 0; i < expenses.length; i++) {
                    const exp = expenses[i];
                    expenses[i] = {
                        id: exp.id,
                        expense: exp.expense,
                        expNote: exp.expense_note,
                        time: formatTimeFromString(exp.entry_time),
                        addedBy: exp.username,
                    }

                    totalExp += toNumber(exp.expense);
                }

                setData({profits: revenues, losses: expenses});

                const total = totalRev - totalExp;
                setTotalNet(total);

                setRevActions(Array(revenues.length).fill(false));
                setExpActions(Array(expenses.length).fill(false));
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPnL();

        const backAction = () => {
            router.push('(tabs)/pnl');
            return true;
        }
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    if(loading) {
        return (
            <SafeAreaView className="flex-1 flex justify-center items-center">
                <ActivityIndicator size="large" color="#dc3f1c" />
            </SafeAreaView>
        )
    }
    
    return (
        <SafeAreaView>
            <ScrollView>
                <View className="flex-1 w-full min-h-screen flex flex-col px-4 pb-2 bg-white">
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>
                    <View className="w-full flex flex-row justify-between items-center">
                        <Text className="font-pbold text-lg">Profit & Loss</Text>
                        <Text className="text-lg">{ausDateFormat}</Text>
                    </View>
                    <View className="w-full bg-lightshade rounded-xl px-4 pt-4 pb-2 my-2">
                        <Text className="font-psemibold text-primary">Daily Net:</Text>
                        <Text className="font-psemibold text-[40px] text-primary leading-none">{totalNet<0?`-$${formattedNumber(Math.abs(totalNet))}`:`$${formattedNumber(totalNet)}`}</Text>
                    </View>
                    <CustomButton title="Add New P&L" onPress={() => router.push(`(pnl)/add/${date}`)} contClassName="w-full my-2" />
                    <View className="min-h-[150px]">
                        <Text className="font-psemibold text-primary text-lg">Revenue:</Text>
                        {data?.profits?.length > 0 ?
                                data.profits.map((profit, index) => {
                                    const isSelected = !!revActions[index];
                                    return (
                                        <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => {
                                            setRevActions(state => {
                                                state[index]=!state[index];
                                                return [...state];
                                            });
                                        }} className="relative" style={{marginBottom: isSelected ? 50 : 8}}>
                                            <View className="w-[120px] h-[50px] flex flex-row justify-between items-end px-4 py-2 rounded-b-xl bg-lightshade" style={{position: 'absolute', right: 0, bottom: isSelected ? -40 : 0}}>

                                                <TouchableOpacity activeOpacity={0.9} onPress={() => 
                                                    setDeleteData({status: true, id: profit?.id, category: 'revenue'})
                                                }>
                                                    <Ionicons name="trash-bin" size={26} color="2e2e2e" />
                                                </TouchableOpacity>
                                                <TouchableOpacity activeOpacity={0.9} onPress={() => {
                                                    router.push(`(pnl)/update/revenue/${profit?.id}`);
                                                }}>
                                                    <MaterialCommunityIcons name="playlist-edit" size={34} color="2e2e2e" />
                                                </TouchableOpacity>
                                            </View>
                                            <View className="min-h-[70px] rounded-xl p-4 bg-lightshade">
                                                <View className="flex flex-row justify-between items-end">
                                                    <Text className="text-primary text-lg font-psemibold">${formattedNumber(profit?.revenue)}</Text>
                                                    <Text className="text-primary font-psemibold">{`@${profit?.addedBy} ${profit?.time}`}</Text>
                                                </View>
                                                <View className="flex flex-row justify-between">
                                                    <Text className="text-primary font-pthin italic">{profit?.revNote}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })
                            : (
                                <View className="flex-1 flex justify-center items-center">
                                    <Text className="font-psemibold text-primary/50 text-lg">Empty</Text>
                                </View>
                            )
                        }
                    </View>
                    <View className="min-h-[150px]">
                        <Text className="font-psemibold text-primary text-lg">Expenses:</Text>
                        {data?.losses?.length > 0 ? (
                                data.losses.map((loss, index) => {
                                    const isSelected = !!expActions[index];
                                    return (
                                        <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => {
                                            setExpActions(state => {
                                                state[index]=!state[index];
                                                return [...state];
                                            });
                                        }} className="relative" style={{marginBottom: isSelected ? 50 : 8}}>
                                            <View className="w-[120px] h-[50px] flex flex-row justify-between items-end px-4 py-2 rounded-b-xl bg-lightshade" style={{position: 'absolute', right: 0, bottom: isSelected ? -40 : 0}}>

                                                <TouchableOpacity activeOpacity={0.9} onPress={() =>
                                                    setDeleteData({status: true, id: loss?.id, category: 'expense'})
                                                }>
                                                     <Ionicons name="trash-bin" size={26} color="2e2e2e" />
                                                </TouchableOpacity>
                                                <TouchableOpacity activeOpacity={0.9} onPress={() => {
                                                    router.push(`(pnl)/update/expense/${loss?.id}`);
                                                }}>
                                                    <MaterialCommunityIcons name="playlist-edit" size={34} color="2e2e2e" />
                                                </TouchableOpacity>
                                            </View>
                                            <View className="min-h-[70px] rounded-xl p-4 bg-lightshade">
                                                <View className="flex flex-row justify-between items-end">
                                                    <Text className="text-primary text-lg font-psemibold">${formattedNumber(loss?.expense)}</Text>
                                                    <Text className="text-primary font-psemibold">{`@${loss?.addedBy} ${loss?.time}`}</Text>
                                                </View>
                                                <View className="flex flex-row justify-between">
                                                    <Text className="text-primary font-pthin italic">{loss?.expNote}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })
                            ) : (
                                <View className="flex-1 flex justify-center items-center">
                                    <Text className="font-psemibold text-primary/50 text-lg">Empty</Text>
                                </View>
                            )
                        }
                    </View>
                </View> 
            </ScrollView>
            {deleteData.status && <CustomModal visible={true} onProceed={removePnL} title={`Delete ${deleteData?.category[0].toUpperCase()+deleteData?.category.substring(1)}`} onClose={()=>setDeleteData({status: false, id: 0, category: ''})} message={`Are you sure you want to remove this ${deleteData?.category}?`} />}
        </SafeAreaView>
    );
}

export default ProfitNLoss;
