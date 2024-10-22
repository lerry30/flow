import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLayoutEffect, useState, useRef } from 'react';
import { formattedDateAus } from '@/utils/datetime';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import ErrorField from '@/components/ErrorField';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

const AddXCashFlow = () => {
    const [data, setData] = useState({amount: '', note: ''});
    const [action, setAction] = useState({plus: false, minus: true});
    const [error, setError] = useState({amount: '', note: '', default: ''});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const date = useLocalSearchParams()?.date;
    const ausDateFormat = formattedDateAus(new Date(date));
    const isClicked = useRef(false);

    const add = async () => {
        try {
            if(isClicked.current) return;
            setError({amount: 0, note: '', default: ''});
            setLoading(true);
            if(!date) router.push('(tabs)/pnl');

            const nAmount = Math.abs(toNumber(data?.amount));
            data.amount = action?.minus ? nAmount * -1 : nAmount;
            data.note = data?.note?.trim();

            if(!data?.amount) {
                setError(fields => ({...fields, amount: 'The amount for X cash flow must not be empty.'}));
                return;
            }

            if(!data?.note) {
                setError(fields => ({...fields, note: 'The note for X cash flow must not be empty.'}));
                return;
            }

            const nData = {
                date: date,
                amount: data.amount,
                note: data.note,
            }

            isClicked.current = true;
            const response = await sendJSON(urls['newx'], nData, 'POST');
            if(response) {
                router.push(`(profitNLoss)/${date}`);
            }
        } catch(error) {
            console.log(error?.message);
            setError(fields => ({...fields, default: error?.message}));
            isClicked.current = false;
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        const sign = action.minus ? '-' : action.plus ? '+' : '';
        const nAmount = Math.abs(toNumber(data?.amount));
        const fAmount = nAmount === 0 ? '0' : `${sign}${formattedNumber(nAmount)}`;

        setData(state => ({...data, amount: fAmount}));
    }, [action]);

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

                    <View className="w-full flex flex-row py-4">
                        <TouchableOpacity 
                            activeOpacity={1} 
                            onPress={() => {
                                setAction({minus: true, plus: false});
                            }}
                            className="w-[48%] h-[60px] flex justify-center items-center bg-lightshade rounded-xl mr-[4%]"
                            style={{backgroundColor: action.minus ? '#dc3f1cbb' : '#dcdcdc'}}
                        >
                            <Feather name="minus" size={30} color={action.minus ? 'white' : '#2e2e2e'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={1} 
                            onPress={() => {
                                setAction({minus: false, plus: true});
                            }}
                            className="w-[48%] h-[60px] flex justify-center items-center bg-lightshade rounded-xl"
                            style={{backgroundColor: action.plus ? '#dc3f1cbb' : '#dcdcdc'}}
                        >
                            <AntDesign name="plus" size={30} color={action.plus ? 'white' : '#2e2e2e'} />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <FormField
                            title="X Cash Flow"
                            value={data?.amount}
                            placeholder="Amount of X"
                            onChange={value => setData(data => {
                                const sign = action.minus ? '-' : action.plus ? '+' : '';
                                const nAmount = Math.abs(toNumber(value));
                                const fAmount = nAmount === 0 ? '0' : `${sign}${formattedNumber(nAmount)}`;
                                return {...data, amount: fAmount}
                            })}
                            keyboardType="numeric"
                            contClassName=""
                        />
                        <ErrorField error={error?.amount || ''} />
                        <FormField
                            title="Note"
                            value={data?.note}
                            placeholder="X Note"
                            onChange={value => setData(data => ({...data, note: value }))}
                            contClassName=""
                        />
                        <ErrorField error={error?.note || ''} />
                    </View>

                    <CustomButton title="Add" onPress={add} contClassName="w-full mt-4" />
                    <ErrorField error={error?.default || ''} />
                </View> 
            </ScrollView>
        </SafeAreaView>
    );
}

export default AddXCashFlow;
