import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { formattedDateAus } from '@/utils/datetime';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import ErrorField from '@/components/ErrorField';

const AddPnL = () => {
    const [data, setData] = useState({revenue: 0, revNote: '', expense: 0, expNote: ''});
    const [error, setError] = useState({revenue: '', revNote: '', expense: '', expNote: '', default: ''});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const date = useLocalSearchParams()?.date;
    const ausDateFormat = formattedDateAus(new Date(date));

    const addNewPNL = async () => {
        try {
            setError({revenue: '', revNote: '', expense: '', expNote: '', default: ''});
            setLoading(true);
            if(!date) router.push('(tabs)/pnl');
            if(!data?.revenue && !data?.expense) throw new Error('Either the revenue or expense amount must have a value.');
            if(data?.revenue <= 0 && data?.expense <= 0) 
                throw new Error('Either the revenue or expense amount must have a value greater than zero.');
            if(data?.revenue && !data?.revNote) {
                setError(fields => ({...fields, revNote: 'Revenue note is empty.'}));
                return;
            }

            if(data?.expense && !data?.expNote) {
                setError(fields => ({...fields, expNote: 'Expense note is empty.'}));
                return;
            }

            const nData = {
                date: date,
                revenue: data.revenue,
                revNote: data.revNote,
                expense: data.expense,
                expNote: data.expNote,
            }

            const response = await sendJSON(urls['newpnl'], nData, 'POST');
            if(response) {
                router.push(`(profitNLoss)/${date}`);
            }
        } catch(error) {
            console.log(error?.message);
            setError(fields => ({...fields, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

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
                <View className="flex-1 w-full min-h-screen flex flex-col px-4 bg-white">
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>
                    <View className="w-full flex flex-row justify-between items-center">
                        <Text className="font-pbold text-lg">Profit & Loss</Text>
                        <Text className="text-lg">{ausDateFormat}</Text>
                    </View>

                    <View>
                        <FormField
                            title="Revenue"
                            value={data?.revenue}
                            placeholder="Amount of Revenue"
                            onChange={value => setData(data => ({...data, revenue: toNumber(value) }))}
                            keyboardType="numeric"
                            contClassName=""
                        />
                        <ErrorField error={error?.revenue || ''} />
                        <FormField
                            title="Note"
                            value={data?.revNote}
                            placeholder="Revenue Note"
                            onChange={value => setData(data => ({...data, revNote: value }))}
                            contClassName=""
                        />
                        <ErrorField error={error?.revNote || ''} />
                        <FormField
                            title="Expense"
                            value={data?.expense}
                            placeholder="Amount of Expense"
                            onChange={value => setData(data => ({...data, expense: toNumber(value) }))}
                            keyboardType="numeric"
                            contClassName=""
                        />
                        <ErrorField error={error?.revenue || ''} />
                        <FormField
                            title="Note"
                            value={data?.expNote}
                            placeholder="Expense Note"
                            onChange={value => setData(data => ({...data, expNote: value }))}
                            contClassName=""
                        />
                        <ErrorField error={error?.expNote || ''} />
                        <CustomButton title="Add New P&L" onPress={addNewPNL} contClassName="w-full mt-4" />
                        <ErrorField error={error?.default || ''} />
                    </View>
                </View> 
            </ScrollView>
        </SafeAreaView>
    );
}

export default AddPnL;
