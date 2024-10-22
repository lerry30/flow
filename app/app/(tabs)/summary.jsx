import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';
import { formattedDateAndTime, toTimeZoneDate, formattedDateAus } from '@/utils/datetime';
import { zUser } from '@/store/user';
import { useRouter } from 'expo-router';

//import FlowStatsChart from '@/components/FlowStatsChart';
import Header from '@/components/Header';

const Summary = () => {
    const [displayGraph, setDisplayGraph] = useState(false);
    // for this year
    const [ins, setIns] = useState({jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0});
    const [outs, setOuts] = useState({jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0});
    // overall
    const [overAllIns, setOverAllIns] = useState(0);
    const [overAllOuts, setOverAllOuts] = useState(0);
    const [net, setNet] = useState(0);
    const [loading, setLoading] = useState(false);

    const [overallNet, setOverallNet] = useState(0);
    const [lastNet, setLastNet] = useState(0);
    const [lastNetDate, setLastNetDate] = useState('');

    const router = useRouter();

    const lastUpdate = useRef(null);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const getTransactions = async () => {
        try {
            setLoading(true);
            const response = await sendJSON(urls['history'], {});
            if(response) {
                const { transactions } = response;
                const now = toTimeZoneDate(new Date());

                lastUpdate.current = transactions.length > 0 ? transactions[0].timestamp: undefined;
                let allIns = 0;
                let allOuts = 0;
                const insMonthCollections = {jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0};
                const outsMonthCollections = {jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0};

                //setDisplayGraph(transactions.length > 0);
                for(const transaction of transactions) {
                    const {units, action, deleted, timestamp} = transaction;
                    const nUnits = toNumber(units);
                    const isDeleted = !!deleted;
                    const transactionDate = new Date(timestamp);

                    if(action === 'OUT' && !isDeleted) allOuts += nUnits;
                    if(action === 'IN' && !isDeleted) allIns += nUnits;
                    if(now.getFullYear() === transactionDate.getFullYear()) {
                        const monthKey = months[transactionDate.getMonth()];
                        if(action === 'OUT' && !isDeleted) {
                            outsMonthCollections[monthKey] += nUnits
                        }

                        if(action === 'IN' && !isDeleted) {
                            insMonthCollections[monthKey] += nUnits
                        }
                    }
                }
    
                setOuts(outsMonthCollections);
                setIns(insMonthCollections);

                setOverAllOuts(allOuts);
                setOverAllIns(allIns);
                setNet(allOuts+(allIns*-1));
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const getOverallNet = async () => {
        try {
            setLoading(true);
            const response = await sendJSON(urls['overall'], {}, 'POST');
            if(response) {
                setOverallNet(response?.overallNet);
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const getLastNet = async () => {
        try {
            setLoading(true);
            const response = await sendJSON(urls['lastnet'], {}, 'POST');
            if(response) {
                setLastNet(response?.last);
                setLastNetDate(formattedDateAus(new Date(response?.date)));
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            if(!zUser.getState()?.username) router.push('(user)/login');
            getTransactions();
            getOverallNet();
            getLastNet();
        }, [])
    );

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
                <View className="flex-1 w-full min-h-screen px-4 bg-white">
                    <Header />
                    <Text className="font-pbold text-lg py-2">Summary</Text>
                    {/*{ displayGraph && (
                        <View>
                            <FlowStatsChart 
                                months={months}
                                monthlyIn={ins} 
                                monthlyOut={outs} 
                            />
                            <View className="flex flex-row pl-4 py-2 space-x-1">
                                <View className="w-[18px] aspect-square bg-[#dc3f1c] rounded-sm"></View>
                                <Text className="text-primary">Out</Text>
                                <View className="w-[18px] aspect-square bg-[#3be9de] rounded-sm"></View>
                                <Text className="text-primary">In</Text>
                            </View>
                        </View>
                    )}*/}
                    <View className="w-full space-y-2 mt-2 mb-10">
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary text-lg w-1/2 shrink">Net of Last Game ({`${lastNetDate}`}):</Text>
                            <Text className="font-psemibold text-primary text-xl">{lastNet<0?`-$${formattedNumber(Math.abs(lastNet))}`:`$${formattedNumber(lastNet)}`}</Text>
                        </View>
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary text-lg">Overall Net:</Text>
                            <Text className="font-psemibold text-primary text-xl">{overallNet<0?`-$${formattedNumber(Math.abs(overallNet))}`:`$${formattedNumber(overallNet)}`}</Text>
                        </View>
                    </View>
                    <View className="w-full space-y-2 mt-2">
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary">STATS from last update:</Text>
                            <Text className="font-psemibold text-primary/80">{formattedDateAndTime(new Date(lastUpdate.current))}</Text>
                        </View>
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary text-lg">Total Out:</Text>
                            <Text className="font-psemibold text-primary text-xl">-{formattedNumber(overAllIns)}</Text>
                        </View>
                        <View className="flex flex-row justify-between border-b-2 border-primary">
                            <Text className="font-psemibold text-primary text-lg">Total In:</Text>
                            <Text className="font-psemibold text-primary text-xl">+{formattedNumber(overAllOuts)}</Text>
                        </View>
                        <View className="flex flex-row justify-between pt-1" style={{backgroundColor: `${net<0?'#dc3f1c77':'#fff'}`}}>
                            <Text className="font-psemibold text-primary text-lg">Net Statistics</Text>
                            <Text className="font-psemibold text-primary text-2xl">{formattedNumber(net)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Summary;
