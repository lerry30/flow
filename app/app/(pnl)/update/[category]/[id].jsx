import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { formattedDateAus, formattedDate } from '@/utils/datetime';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import ErrorField from '@/components/ErrorField';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

const UpdatePnL = () => {
    const [data, setData] = useState({id: 0, amount: 0, note: '', date: ''});
    const [error, setError] = useState({amount: '', note: '', default: ''});
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState({plus: false, minus: true}); // for x cash flow

    const router = useRouter();
    const parameters = useLocalSearchParams();
    const category = parameters?.category;
    const catId = parameters?.id;
    const isXCashFlow = category === 'xcashflow';
    const fCategory = isXCashFlow ? 'X cash flow' : category ? category[0].toUpperCase() + category.substring(1) : ''; 
    //const ausDateFormat = formattedDateAus(new Date(date));

    const updatePNL = async () => {
        try {
            setError({amount: '', note: '', default: ''});
            setLoading(true);

            const nAmount = Math.abs(toNumber(data?.amount));
            data.amount = (action?.minus && isXCashFlow) ? nAmount * -1 : nAmount;
            data.note = data?.note?.trim();

            if(!data?.amount) {
                setError(fields => ({...fields, amount: `${fCategory} amount must have a value.`}));
                return
            }

            if(data?.amount <= 0 && !isXCashFlow) {
                setError(fields => ({...fields, amount: `${fCategory} amount must have a value greater than zero.`}));
                return
            }

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

                if(isXCashFlow) {
                    setAction({plus: true, minus: false});
                    if(amount < 0) {
                        setAction({plus: false, minus: true});
                    }
                }
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
                        <Text className="font-pbold text-lg">Update {fCategory}</Text>
                        <Text className="text-lg">{formattedDateAus(new Date(data?.date))}</Text>
                    </View>

                    {category === 'revenue' && (
                        <View>
                            <FormField
                                title="Revenue"
                                value={String(data?.amount)}
                                placeholder="Amount of Revenue"
                                onChange={value => setData(data => 
                                    ({...data, amount: formattedNumber(toNumber(value)) }))}
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
                            <ErrorField error={error?.note || ''} />
                        </View>
                    )}
                    
                    {category === 'expense' && (
                        <View>
                            <FormField
                                title="Expense"
                                value={String(data?.amount)}
                                placeholder="Amount of Expense"
                                onChange={value => setData(data => 
                                        ({...data, amount: formattedNumber(toNumber(value)) }))}
                                keyboardType="numeric"
                                contClassName=""
                            />
                            <ErrorField error={error?.amount || ''} />
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

                    {isXCashFlow && (
                        <View>
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
                                    value={String(data?.amount)}
                                    placeholder="Amount of X Cash Flow"
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
                                    placeholder="Expense Note"
                                    onChange={value => setData(data => ({...data, note: value }))}
                                    contClassName=""
                                />
                                <ErrorField error={error?.note || ''} />
                            </View>
                        </View>
                    )}
                    <CustomButton title={`Update ${fCategory}`} onPress={updatePNL} contClassName="w-full mt-4" />
                    <ErrorField error={error?.default || ''} />
                </View> 
            </ScrollView>
        </SafeAreaView>
    );
}

export default UpdatePnL;
