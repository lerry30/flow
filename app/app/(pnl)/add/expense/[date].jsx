import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { formattedDateAus } from '@/utils/datetime';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import ErrorField from '@/components/ErrorField';
import DropDownPicker from 'react-native-dropdown-picker';

const AddExpense = () => {
    const listOfExpenses = ['Venue', 'Staff', 'Shops', 'Meals', 'Miscellaneous', 'Other'];
    const [data, setData] = useState(Array(listOfExpenses).fill({amount: 0, note: ''}));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [dropdown, setDropdown] = useState(1);
    const [openFields, setOpenFields] = useState([]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(
        Array(listOfExpenses.length)
            .fill({})
            .map((item, i) => ({label: listOfExpenses[i], value: listOfExpenses[i]})));

    const router = useRouter();
    const date = useLocalSearchParams()?.date;
    const ausDateFormat = formattedDateAus(new Date(date));

    const isClicked = useRef(false);

    const add = async () => {
        try {
            if(isClicked.current) return;
            setLoading(true);
            if(!date) router.push('(tabs)/pnl');
            
            const nData = {date, expenses: []};
            for(let i = 0; i < data.length; i++) {
                const expense = data[i];
                if(toNumber(expense?.amount) > 0) {
                    const fieldName = openFields[i];
                    if(fieldName.trim().toLowerCase() === 'other' && !expense.note) throw new Error('Please add a note for other expense.');
                    expense.note = expense?.note?.trim();
                    const note = `${fieldName}${expense?.note && `: ${expense?.note}`}`;
                    nData.expenses.push({amount: expense.amount, note});
                }
            }

            if(nData.expenses.length === 0) throw new Error('Cannot save the expense due to empty fields.');
            isClicked.current = true;

            const response = await sendJSON(urls['newexpense'], nData, 'POST');
            if(response) {
                router.push(`(profitNLoss)/${date}`);
            }
        } catch(error) {
            console.log(error?.message);
            setError(error?.message);
            isClicked.current = false;
        } finally {
            setLoading(false);
        }
    }

    const addTable = (value) => {
        setDropdown(dropdown+1);
        setOpenFields(state => [...state, value]);
        setItems(state => state.filter(item => item?.value !== value));
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
                <View className="flex-1 w-full min-h-screen flex flex-col px-4 bg-white pb-[80px]">
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>
                    <View className="w-full flex flex-row justify-between items-center">
                        <Text className="font-pbold text-lg">Profit & Loss</Text>
                        <Text className="text-lg">{ausDateFormat}</Text>
                    </View>

                    {openFields.map((field, i) => {
                        return (
                            <View key={i}>
                                <FormField
                                    title={field}
                                    value={formattedNumber(toNumber(data[i]?.amount))}
                                    placeholder="Amount of Expense"
                                    onChange={value => setData(data => {
                                        const prevData = data[i];
                                        data[i] = {...prevData, amount: toNumber(value)};
                                        return [...data];
                                    })}
                                    keyboardType="numeric"
                                    contClassName=""
                                />
                                <FormField
                                    title="Note"
                                    value={data?.note}
                                    placeholder="Expense Note"
                                    onChange={value => setData(data => {
                                        const prevData = data[i];
                                        data[i] = {...prevData, note: value};
                                        return data;
                                    })}
                                    contClassName="my-4"
                                />
                            </View>
                        )
                    })}

                    {items.length > 0 && (
                         <DropDownPicker
                            key={dropdown}
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                            listMode="SCROLLVIEW"
                            placeholder="Select Expense Type"
                            onChangeValue={addTable}
                            style={{
                                borderColor: '#dc3f1c',
                                borderRadius: 10,
                                borderWidth: 2,
                                height: 64,
                                paddingHorizontal: 24,
                            }}
                            textStyle={{
                                color: '#2e2e2e',
                                fontSize: 16,
                                fontWeight: '600',
                            }}
                            dropDownContainerStyle={{
                                borderColor: '#dc3f1c',
                                maxHeight: items.length * 52,
                            }}
                        />
                    )}

                    <CustomButton title="Add" onPress={add} contClassName="w-full mt-4" />
                    <ErrorField error={error} />
                </View> 
            </ScrollView>
        </SafeAreaView>
    );
}

export default AddExpense;
