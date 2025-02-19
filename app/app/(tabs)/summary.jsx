import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber, formattedNumber } from '@/utils/number';
import { formattedDateAndTime, formattedDateAus, getFirstMonday } from '@/utils/datetime';
import { zUser } from '@/store/user';
import { useRouter } from 'expo-router';
import { listOfExpenses } from '@/constants/expenses';

//import FlowStatsChart from '@/components/FlowStatsChart';
import Header from '@/components/Header';
import DropDownPicker from 'react-native-dropdown-picker';
import TitleFormat from '@/utils/titleFormat';

const Summary = () => {
    //const [displayGraph, setDisplayGraph] = useState(false);
    // for this year graph
    //const [ins, setIns] = useState({jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0});
    //const [outs, setOuts] = useState({jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0});

    // overall
    //const [overAllIns, setOverAllIns] = useState(0);
    //const [overAllOuts, setOverAllOuts] = useState(0);
    const [net, setNet] = useState(0);
    const [loading, setLoading] = useState(false);

    const [overallNet, setOverallNet] = useState(0);
    const [lastNet, setLastNet] = useState(0);
    const [lastNetDate, setLastNetDate] = useState('');

    // weekly & monthly report
    const today = new Date();
    const startYear = 2024;
    const months = [
        'January', 
        'February', 
        'March', 
        'April', 
        'May', 
        'June', 
        'July', 
        'August', 
        'September', 
        'October', 
        'November', 
        'December'
    ];
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const lfy = (today.getFullYear()%4===0&&today.getFullYear()%100!==0||today.getFullYear()%400===0) ? 1 : 0;
    const daysInMonths = [31, lfy?28+1:28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // number of days on every month
    const initMonths = () => {
        return Array((() => {
            if(toNumber(yearDropdownValue)!==toNumber(today?.getFullYear())) return 12;
            return toNumber(today?.getMonth())+1;
        })())
        .fill({})
        .map((_, i) => ({label: months[i], value: months[i]}))
        .reverse();
    }

    const initWeeks = () => {
        return Array((() => {
            if(toNumber(yearDropdownValue)!==toNumber(today?.getFullYear())) return 52;
            const aDay = 1000*60*60*24;
            const offset = getFirstMonday(yearDropdownValue)?.getTime()-aDay;
            const aWeek = 1000*60*60*24*7;
            const dateTime = today?.getTime();
            const noOfWeeks = Math.floor((dateTime-offset)/aWeek);
            return noOfWeeks;
        })()) // 52 weeks in a year
        .fill({})
        .map((_, i) => {
            const fMonday = getFirstMonday(yearDropdownValue)?.getTime();
            const aDay = 1000*60*60*24;
            const offset = i*7*aDay;
            const monday = new Date(fMonday+offset);
            const saturday = new Date(fMonday+(5*aDay)+offset);

            const nMonday = `${monday?.getDate()} ${months[monday?.getMonth()].substring(0,3)} Mon`;
            const nSaturday = `${saturday?.getDate()} ${months[saturday?.getMonth()].substring(0,3)} Sat`;
            const label = `Week ${i+1}: ${nMonday} - ${nSaturday}`;
            const value = `${monday?.getTime()}-${saturday?.getTime()}/Week ${i+1}`;
            return {label, value}
        })
        .reverse();
    }

    const [reportData, setReportData] = useState({title: '', revenue: 0, expenses: {}, xcashflow: 0, net});

    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [yearDropdownValue, setYearDropdownValue] = useState(toNumber(today.getFullYear()));
    const [yearDropdownItems, setYearDropdownItems] = useState(
        Array(toNumber(today?.getFullYear()-startYear+1))
        .fill({})
        .map((_, i) => {
            const year = startYear+i;
            return {label: year, value: year};
        })
        .reverse()
    );

    const [monthDropdownKey, setMonthDropdownKey] = useState(1);
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
    const [monthDropdownValue, setMonthDropdownValue] = useState(null);
    const [monthDropdownItems, setMonthDropdownItems] = useState(initMonths);

    const [weekDropdownKey, setWeekDropdownKey] = useState(1);
    const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
    const [weekDropdownValue, setWeekDropdownValue] = useState(null);
    const [weekDropdownItems, setWeekDropdownItems] = useState(initWeeks);

    const router = useRouter();

    const settingReportData = (data) => {
        let revenue = 0;
        let xcashflow = 0;
        let totalExpense = 0;
        const expenses = {};
        const expTypes = listOfExpenses.map(type => type?.trim()?.toLowerCase());

        for(const pnl of data) {
            if(pnl?.category==='Profit') {
                revenue = revenue + toNumber(pnl?.amount);
            } else if(pnl?.category==='Loss') {
                let key = pnl?.note;
                for(const expenseType of expTypes) {
                    if(pnl?.note?.toLowerCase()?.includes(expenseType)) {
                        key = expenseType;
                        break;
                    }
                }

                const nAmount = toNumber(pnl?.amount);
                expenses[key] = toNumber(expenses[key]) + nAmount;
                totalExpense = totalExpense + nAmount;
            } else if(pnl?.category==='Cashflow') {
                xcashflow = xcashflow + toNumber(pnl?.amount);                        
            }
        }

        const net = revenue - totalExpense + xcashflow;
        return {revenue, expenses, xcashflow, net};
    }

    const initMonthlyReport = async (value) => {
        try {
            setLoading(true);
            const monthIndex = months.indexOf(value)+1; // plus 1 since january is 1 in mysql
            const selectedYear = !yearDropdownValue ? today?.getFullYear : yearDropdownValue;

            const response = await sendJSON(urls['monthlyreport'], {month: monthIndex, year: selectedYear});
            if(response) {
                const data = response?.data;
                //console.log(JSON.stringify(data, null, 4));
                const title = `Monthly Report for ${value}-${selectedYear}`;
                const {revenue, expenses, xcashflow, net} = settingReportData(data);
                setReportData(state => ({...state, title, revenue, expenses, xcashflow, net}));
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const initWeeklyReport = async (value) => {
        try {
            setLoading(true);
            const selectedYear = !yearDropdownValue ? today?.getFullYear : yearDropdownValue;
            const [weeks, label] = String(value)?.trim()?.split('/');
            const response = await sendJSON(urls['weeklyreport'], {week: weeks});
            if(response) {
                const data = response?.data;
                //console.log(data);
                //console.log(JSON.stringify(data, null, 4));
                const title = `Weekly Report for ${label}-${selectedYear}`;
                const {revenue, expenses, xcashflow, net} = settingReportData(data);
                setReportData(state => ({...state, title, revenue, expenses, xcashflow, net}));
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const lastUpdate = useRef(null);
    //const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const getTransactions = async () => {
        try {
            setLoading(true);
            const response = await sendJSON(urls['history'], {});
            if(response) {
                const { transactions } = response;
                const now = new Date();

                lastUpdate.current = transactions.length > 0 ? transactions[0].createdAt: undefined;
                let allIns = 0;
                let allOuts = 0;
                //const insMonthCollections = {jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0};
                //const outsMonthCollections = {jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0};

                //setDisplayGraph(transactions.length > 0);
                for(const transaction of transactions) {
                    const {units, action, history, createdAt} = transaction;
                    const nUnits = toNumber(units);
                    const transactionDate = new Date(createdAt);
                    let isDeleted = false;

                    const historyInObject = JSON.parse(history || '[]'); // history was in string
                    for(const state of historyInObject) {
                        if(state?.action === 'DELETED') isDeleted = true;
                    }

                    if(action === 'OUT' && !isDeleted) allOuts += nUnits;
                    if(action === 'IN' && !isDeleted) allIns += nUnits;
                    //if(now.getFullYear() === transactionDate.getFullYear()) {
                    //    const monthKey = months[transactionDate.getMonth()];
                    //    if(action === 'OUT' && !isDeleted) {
                    //        outsMonthCollections[monthKey] += nUnits
                    //    }

                    //    if(action === 'IN' && !isDeleted) {
                    //        insMonthCollections[monthKey] += nUnits
                    //    }
                    //}
                }
    
                //setOuts(outsMonthCollections);
                //setIns(insMonthCollections);

                //setOverAllOuts(allOuts);
                //setOverAllIns(allIns);
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
                <View className="flex-1 w-full h-[400vh] px-4 bg-white">
                    <Header />
                    <Text className="font-pbold text-lg py-2">Summary</Text>
                    {/*{ displayGraph && (
                        <View>
                            <FlowStatsChart 
                                months={months}
                                monthIn={ins} 
                                monthOut={outs} 
                            />
                            <View className="flex flex-row pl-4 py-2 space-x-1">
                                <View className="w-[18px] aspect-square bg-[#dc3f1c] rounded-sm"></View>
                                <Text className="text-primary">Out</Text>
                                <View className="w-[18px] aspect-square bg-[#3be9de] rounded-sm"></View>
                                <Text className="text-primary">In</Text>
                            </View>
                        </View>
                    )}*/}
                    <View className="w-full space-y-2 mt-2 mb-4">
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary text-lg w-1/2 shrink">Net of Last Game {lastNetDate !== 'Invalid Date' ? `(${lastNetDate})` : ''}:</Text>
                            <Text className="font-psemibold text-primary text-xl">{lastNet<0?`-$${formattedNumber(Math.abs(lastNet))}`:`$${formattedNumber(lastNet)}`}</Text>
                        </View>
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary text-lg">Overall Net:</Text>
                            <Text className="font-psemibold text-primary text-xl">{overallNet<0?`-$${formattedNumber(Math.abs(overallNet))}`:`$${formattedNumber(overallNet)}`}</Text>
                        </View>
                    </View>
                    <View className="w-full py-4 border-t border-neutral-300">
                        <View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary">TICK from last update:</Text>
                            <Text className="font-psemibold text-primary/80">{formattedDateAndTime(new Date(lastUpdate.current))}</Text>
                        </View>
                        {/*<View className="flex flex-row justify-between">
                            <Text className="font-psemibold text-primary text-lg">Total Out:</Text>
                            <Text className="font-psemibold text-primary text-xl">-{formattedNumber(overAllIns)}</Text>
                        </View>
                        <View className="flex flex-row justify-between border-b-2 border-primary">
                            <Text className="font-psemibold text-primary text-lg">Total In:</Text>
                            <Text className="font-psemibold text-primary text-xl">+{formattedNumber(overAllOuts)}</Text>
                        </View>*/}
                        <View className="flex flex-row justify-between pt-1 px-1" style={{backgroundColor: `${net<0?'#dc3f1c77':'#fff'}`}}>
                            <Text className="font-psemibold text-primary text-lg">Net TICK</Text>
                            <Text className="font-psemibold text-primary text-2xl">{formattedNumber(net)}</Text>
                        </View>
                    </View>
                    <View className="w-full pt-4 border-t border-neutral-300 z-50">
                         {yearDropdownItems?.length > 0 && (
                             <DropDownPicker
                                open={yearDropdownOpen}
                                value={yearDropdownValue}
                                items={yearDropdownItems}
                                setOpen={setYearDropdownOpen}
                                setValue={setYearDropdownValue}
                                setItems={setYearDropdownItems}
                                listMode="SCROLLVIEW"
                                placeholder="Select Year"
                                onChangeValue={() => {
                                    setMonthDropdownKey(state => state+1);
                                    setWeekDropdownKey(state => state+1);

                                    setMonthDropdownItems(initMonths());
                                    setWeekDropdownItems(initWeeks());
                                }}
                                onOpen={() => {
                                    setMonthDropdownOpen(false);
                                    setWeekDropdownOpen(false);
                                }}
                                maxHeight={8000} // try to adjust maxHeight to fit the contents
                                dropDownDirection="bottom"
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
                                    backgroundColor: '#ececec',
                                    elevation: 3,
                                }}
                            />
                        )}
                    </View>

                    <View className="w-full pt-4 z-40">
                        {monthDropdownItems.length > 0 && (
                             <DropDownPicker
                                key={monthDropdownKey}
                                open={monthDropdownOpen}
                                value={monthDropdownValue}
                                items={monthDropdownItems}
                                setOpen={setMonthDropdownOpen}
                                setValue={setMonthDropdownValue}
                                setItems={setMonthDropdownItems}
                                listMode="SCROLLVIEW"
                                placeholder="Select Month"
                                onChangeValue={initMonthlyReport}
                                onOpen={() => {
                                    setYearDropdownOpen(false);
                                    setWeekDropdownOpen(false);
                                }}
                                maxHeight={1000} // try to adjust maxHeight to fit the contents
                                zIndex={80}
                                dropDownDirection="bottom"
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
                                    backgroundColor: '#ececec',
                                    elevation: 3,
                                }}
                            />
                        )}
                    </View>

                    <View className="w-full pt-4 z-30">
                        {weekDropdownItems.length > 0 && (
                             <DropDownPicker
                                key={weekDropdownKey}
                                open={weekDropdownOpen}
                                value={weekDropdownValue}
                                items={weekDropdownItems}
                                setOpen={setWeekDropdownOpen}
                                setValue={setWeekDropdownValue}
                                setItems={setWeekDropdownItems}
                                listMode="SCROLLVIEW"
                                placeholder="Select Week"
                                onChangeValue={initWeeklyReport}
                                onOpen={() => {
                                    setYearDropdownOpen(false);
                                    setMonthDropdownOpen(false);
                                }}
                                maxHeight={10000} // try to adjust maxHeight to fit the contents
                                zIndex={80}
                                dropDownDirection="bottom"
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
                                    backgroundColor: '#ececec',
                                    elevation: 3,
                                }}
                            />
                        )}
                    </View>

                    {reportData?.title && (
                        <View className="w-full pt-4">
                            <Text className="font-psemibold text-primary text-lg">{reportData?.title||''}</Text>
                            <View className="pt-2 px-2">
                                <View className="w-full flex flex-row justify-center items-center">
                                    <Text className="max-w-[180px] font-psemibold text-primary text-lg">Revenue</Text>
                                    <View className="grow border-t border-dashed border-neutral-300 mx-2"></View>
                                    <Text className="font-psemibold text-primary text-lg">
                                        {formattedNumber(reportData?.revenue||0)}
                                    </Text>
                                </View>
                                {Object.entries(reportData?.expenses).map((item, index) => {
                                    const [key, value] = item;
                                    return (
                                        <View key={index} className="w-full flex flex-row justify-center items-center">
                                            <Text className="max-w-[180px] font-psemibold text-primary text-lg">{TitleFormat(key)}</Text>
                                            <View className="grow border-t border-dashed border-neutral-300 mx-2"></View>
                                            <Text className="font-psemibold text-primary text-lg">
                                                {formattedNumber(value||0)}
                                            </Text>
                                        </View>
                                    )
                                })}
                                {/* It's just to display that expenses are zero*/}
                                {Object.values(reportData?.expenses).length===0 && (
                                    <View className="w-full flex flex-row justify-center items-center">
                                        <Text className="max-w-[180px] font-psemibold text-primary text-lg">Expenses</Text>
                                        <View className="grow border-t border-dashed border-neutral-300 mx-2"></View>
                                        <Text className="font-psemibold text-primary text-lg">0</Text>
                                    </View>
                                )}
                                <View className="w-full flex flex-row justify-center items-center">
                                    <Text className="max-w-[180px] font-psemibold text-primary text-lg">X Cash Flow</Text>
                                    <View className="grow border-t border-dashed border-neutral-300 mx-2"></View>
                                    <Text className="font-psemibold text-primary text-lg">
                                        {formattedNumber(reportData?.xcashflow||0)}
                                    </Text>
                                </View>
                                <View className="w-full flex flex-row justify-center items-center">
                                    <Text className="max-w-[180px] font-psemibold text-primary text-lg">Net</Text>
                                    <View className="grow border-t border-dashed border-neutral-300 mx-2"></View>
                                    <Text className="font-psemibold text-primary text-lg">
                                        {formattedNumber(reportData?.net||0)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Summary;
