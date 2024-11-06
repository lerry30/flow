import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formattedDate } from '@/utils/datetime';
import { useRouter } from 'expo-router';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { zUser } from '@/store/user';

import Header from '@/components/Header';

const PNL = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState(formattedDate(new Date()).slice(0, 7));
    const [monthOperations, setMonthOperations] = useState({});
    const [loading, setLoading] = useState(false);

    const today = new Date();
    const router = useRouter();
    const intervalId = useRef(undefined);
    const RELOADTIME = 10000; // should not be lower to 9 seconds

    const getDaysOfOperationsInAMonth = async () => {
        try {
            if(currentMonth) {
                const response = await sendJSON(urls['monthoperations'], {currentMonth}, 'POST');
                if(response) {
                    const prevOperations = {};
                    const operations = response?.operations || [];
                    for(const opt of operations) {
                        const date = formattedDate(new Date(opt?.entry_date));
                        prevOperations[date] = {
                            selected: true,
                            marked: true,
                            selectedColor: '#dc3f1c'
                        }
                    }

                    setMonthOperations(prevOperations);
                }
            }
        } catch(error) {
            console.log(error?.message);
        }
    }

    useFocusEffect(
        useCallback(() => {
            if(!zUser.getState()?.username) router.push('(user)/login');
            getDaysOfOperationsInAMonth();

            intervalId.current = setInterval(() => getDaysOfOperationsInAMonth(), RELOADTIME);

            return () => {
                clearInterval(intervalId.current);
            }
        }, [currentMonth])
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
            <View className="flex-1 w-full min-h-screen flex flex-col px-4 bg-white">
                <Header />
                <Text className="font-pbold text-lg py-2">P & L Calendar</Text>
                <Calendar
                    current={`${currentMonth}-01`}
                    onDayPress={(day) => {
                        const aDay = 1000 * 60 * 60 * 24;
                        const tomorrow = day.timestamp + aDay;
                        if(day.timestamp < tomorrow) {
                            setSelectedDate(day.dateString);
                            router.push(`(profitNLoss)/${day.dateString}`);
                        }
                    }}
                    onMonthChange={(month) => {
                        const formattedMonth = `${month.year}-${('0' + month.month).slice(-2)}`;
                        setCurrentMonth(formattedMonth);
                    }}
                    markedDates={{
                        ...monthOperations,

                        [selectedDate]: {
                            selected: true,
                            marked: true,
                            selectedColor: '#dc3f1c'
                        },

                        [formattedDate(today)]: {
                            selected: true,
                            marked: true,
                            selectedColor: 'teal'
                        }
                    }}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        textSectionTitleColor: '#2e2e2eaa',
                        selectedDayBackgroundColor: '#00adf5',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#2e2e2e',
                        dayTextColor: '#2d4150',
                        textDisabledColor: '#d9e1e8',
                        arrowColor: 'black',
                        monthTextColor: '#2e2e2e',
                        textDayFontWeight: '300',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '500',
                        textDayFontSize: 16,
                        textMonthFontSize: 18,
                        textDayHeaderFontSize: 16,
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

export default PNL;

