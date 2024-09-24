import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';
import { formattedDateAndTime } from '@/utils/datetime';

//import FlowStatsChart from '@/components/FlowStatsChart';
import AppLogo from '@/components/AppLogo';

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
    const [netToday, setNetToday] = useState(0);

    const lastUpdate = useRef(null);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const getTransactions = async () => {
        try {
            setLoading(true);
            const response = await sendJSON(urls['history'], {});
            if(response) {
                const { transactions } = response;
                const now = new Date();

                lastUpdate.current = transactions.length > 0 ? transactions[0].timestamp: undefined;
                let allIns = 0;
                let allOuts = 0;
                const insMonthCollections = {jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0};
                const outsMonthCollections = {jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0};

                //setDisplayGraph(transactions.length > 0);
                for(const transaction of transactions) {
                    const {units, action, prev_status, timestamp} = transaction;
                    const nUnits = toNumber(units);
                    const transactionDate = new Date(timestamp);

                    if(action === 'OUT') allOuts += nUnits;
                    if(action === 'IN') allIns += nUnits;
                    if(now.getFullYear() === transactionDate.getFullYear()) {
                        const monthKey = months[transactionDate.getMonth()];
                        if(action === 'OUT') {
                            outsMonthCollections[monthKey] += nUnits
                        }

                        if(action === 'IN') {
                            insMonthCollections[monthKey] += nUnits
                        }
                    }
                }
    
                setOuts(outsMonthCollections);
                setIns(insMonthCollections);

                setOverAllOuts(allOuts);
                setOverAllIns(allIns);
                setNet((allOuts*-1)+allIns);
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

    const getNetForTheDay = async () => {
        try {
            setLoading(true);
            const response = await sendJSON(urls['nettoday'], {}, 'POST');
            if(response) {
                setNetToday(response?.today); 
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            getTransactions();
            getOverallNet();
            getNetForTheDay();
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
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>
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
                            <Text className="font-psemibold text-primary">Net for the Day:</Text>
                            <Text className="font-psemibold text-primary text-xl">{netToday<0?`-$${formattedNumber(Math.abs(netToday))}`:`$${formattedNumber(netToday)}`}</Text>
                        </View>
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary">Overall Net:</Text>
                            <Text className="font-psemibold text-primary text-xl">{overallNet<0?`-$${formattedNumber(Math.abs(overallNet))}`:`$${formattedNumber(overallNet)}`}</Text>
                        </View>
                    </View>
                    <View className="w-full space-y-2 mt-2">
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary">STATS from last update:</Text>
                            <Text className="font-psemibold text-primary/80">{formattedDateAndTime(new Date(lastUpdate.current))}</Text>
                        </View>
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary">Total Out:</Text>
                            <Text className="font-psemibold text-primary text-xl">-{formattedNumber(overAllOuts)}</Text>
                        </View>
                        <View className="flex flex-row justify-between border-b-2 border-primary">
                            <Text className="font-psemibold text-primary">Total In:</Text>
                            <Text className="font-psemibold text-primary text-xl">+{formattedNumber(overAllIns)}</Text>
                        </View>
                        <View className="flex flex-row justify-between pt-1" style={{backgroundColor: `${net<0?'#dc3f1caa':'#fff'}`}}>
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
