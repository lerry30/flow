import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayoutEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { formattedDateAndTime, formattedDateAus } from '@/utils/datetime';
import { appInactivityLogout } from '@/utils/loggedOut';

import AppLogo from '@/components/AppLogo';

const PnLHistory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params?.id;
    const category = params?.category;
    const date = params?.date;
    const ausDateFormat = formattedDateAus(new Date(date));

    const getHistory = async () => {
        try {
            setLoading(true);
            const validCategories = ['xcashflow', 'revenue', 'expense'];
            
            if(!id || !validCategories.includes(category)) throw new Error('There\'s something wrong.');

            const response = await sendJSON(urls['getpnlhistory'], {id, category});
            if(response) {
                setData(response?.history);
            }
        } catch(error) {
            console.log(error?.message);
            router.back();
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getHistory();    
    }, []);

    appInactivityLogout();

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
                <View className="flex-1 w-full min-h-screen flex flex-col px-4 bg-white pb-[80px]">
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>
                    <View className="w-full flex flex-row justify-between items-center mb-[20px]">
                        <Text className="font-pbold text-lg">X Cash Flow History</Text>
                        <Text className="text-lg">{ausDateFormat}</Text>
                    </View>
                    {data?.map((item, index) => {
                        return (
                            <View key={index} className="relative w-full pl-[24px] pb-6 ml-2 border-l-2 border-secondary/80">
                                <View className="absolute w-[20px] h-[20px] top-[5px] -left-[11px] bg-secondary rounded-full"></View>
                                <Text className="text-lg">{formattedDateAndTime(new Date(item?.timestamp))}</Text>
                                <View className="flex flex-row">
                                    <Text className="text-lg">Amount: </Text>
                                    <Text className="text-lg font-semibold">{item?.amount}</Text>
                                </View>
                                <View className="flex flex-row">
                                    <Text className="text-lg">Note: </Text>
                                    <Text className="text-lg font-semibold">{item?.note}</Text>
                                </View>
                                <View className="flex flex-row">
                                    <Text className="text-lg">{`${item?.action[0]}${item?.action?.substring(1)?.toLowerCase()}`} by: </Text>
                                    <Text className="text-lg font-semibold italic">@{item?.modifiedBy}</Text>
                                </View>
                            </View>
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default PnLHistory;
