import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { formattedDateAus, formattedDate } from '@/utils/datetime';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import ErrorField from '@/components/ErrorField';

const UpdatePnL = () => {
    const [data, setData] = useState({id: 0, amount: 0, note: '', date: ''});
    const [error, setError] = useState({amount: '', note: '', default: ''});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const parameters = useLocalSearchParams();
    const category = parameters?.category;
    const catId = parameters?.id;
    const fCategory = category ? category[0].toUpperCase() + category.substring(1) : ''; 
    //const ausDateFormat = formattedDateAus(new Date(date));

    const updatePNL = async () => {
        try {
            setError({amount: '', note: '', default: ''});
            setLoading(true);
            if(!data?.amount) throw new Error(`${fCategory} amount must have a value.`);
            if(data?.amount <= 0) 
                throw new Error(`${fCategory} amount must have a value greater than zero.`);
            if(!data?.note) {
                setError(fields => ({...fields, note: `${fCategory} note is empty.`}));
                return;
            }

            const nData = {
                id: catId,
                category,
                amount: data.amount,
                note: data.note,
            }

            const response = await sendJSON(urls['updatepnl'], nData, 'PUT');
            if(response) {
                const fDate = formattedDate(new Date(data?.date));
                router.push(`(profitNLoss)/${fDate}`);
            }
        } catch(error) {
            console.log(error?.message);
            setError(fields => ({...fields, default: error?.message}));
        } finally {
            setLoading(false);
        }
    }

    const getData = async () => {
        try {
            setLoading(true);
            if(!category || !catId) router.push('(tabs)/pnl');
            
            const response = await sendJSON(urls['getselectedpnl'], {category, id: catId}, 'POST');
            if(response) {
                const {id, amount, note, date}  = response[category];
                setData({id, amount, note, date});
            }
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getData();
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
            <View className="flex-1 w-full min-h-screen flex flex-col px-4 bg-white">
                <View className="w-[90px]">
                    <AppLogo style={{width: 'fit-content'}}/>
                </View>
                <View className="w-full flex flex-row justify-between items-center">
                    <Text className="font-pbold text-lg">Update {fCategory}</Text>
                    <Text className="text-lg">{formattedDateAus(new Date(data?.date))}</Text>
                </View>

                {category === 'revenue' ? (
                    <View>
                        <FormField
                            title="Revenue"
                            value={String(data?.amount)}
                            placeholder="Amount of Revenue"
                            onChange={value => setData(data => ({...data, amount: toNumber(value) }))}
                            keyboardType="numeric"
                            contClassName=""
                        />
                        <ErrorField error={error?.amount || ''} />
                        <FormField
                            title="Note"
                            value={data?.note}
                            placeholder="Revenue Note"
                            onChange={value => setData(data => ({...data, note: value }))}
                            contClassName=""
                        />
                        <ErrorField error={error?.revNote || ''} />
                    </View>
                ) : (
                    <View>
                        <FormField
                            title="Expense"
                            value={String(data?.amount)}
                            placeholder="Amount of Expense"
                            onChange={value => setData(data => ({...data, amount: toNumber(value) }))}
                            keyboardType="numeric"
                            contClassName=""
                        />
                        <ErrorField error={error?.revenue || ''} />
                        <FormField
                            title="Note"
                            value={data?.note}
                            placeholder="Expense Note"
                            onChange={value => setData(data => ({...data, note: value }))}
                            contClassName=""
                        />
                        <ErrorField error={error?.note || ''} />
                    </View>
                )}
                <CustomButton title={`Update ${fCategory}`} onPress={updatePNL} contClassName="w-full mt-4" />
                <ErrorField error={error?.default || ''} />
            </View> 
        </SafeAreaView>
    );
}

export default UpdatePnL;
