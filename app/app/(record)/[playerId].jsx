import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLayoutEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';
import { toNumber, formattedNumber } from '@/utils/number';
import { appInactivityLogout } from '@/utils/loggedOut';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import ErrorField from '@/components/ErrorField';
//import CustomAlert from '@/components/CustomAlert';

const Record = () => {
    const [player, setPlayer] = useState({name: '', maxLimit: 0, note: '', status: 0, addedBy: '', createdAt: ''});
    const [amount, setAmount] = useState(0);
    const [errorData, setErrorData] = useState({amount: ''});
    const [note, setNote] = useState('');
    const [action, setAction] = useState({plus: false, minus: true});
    const [loading, setLoading] = useState(false);
    const [playerAlert, setPlayerAlert] = useState(false);
    //const [amountAlert, setAmountAlert] = useState(false);

    const playerId = useLocalSearchParams()?.playerId;
    const router = useRouter();

    const isClicked = useRef(false);

    const inputData = async () => {
        try {
            if(isClicked.current) return;
            setLoading(true);
            const nAmount = toNumber(amount);
            const nNote = note?.trim();
            if(nAmount === 0) {
                //setAmountAlert(true);
                setErrorData({amount: 'Unable to record the input, possibly due to a zero value.'});
                throw new Error('Unable to record the input, possibly due to a zero value.');
            }

            if(action?.minus) {
                const limit = toNumber(player?.maxLimit)*-1; // I just make it negative
                const newBalance = toNumber(player?.status)-nAmount; // I just make it subtraction since nAmount should be negative to decrease the balance more
                if(limit < 0) {
                    if(newBalance < limit) {// since limit is negative(-4000)
                        const message = `The maximum input allowed for ${player?.name} is limited to ${limit}`;
                        setErrorData({amount: message});
                        throw new Error(message);
                    }
                }
            }

            isClicked.current = true;
            const response = await sendJSON(urls['borrowpay'], 
                {playerId, action, amount: nAmount, note: nNote}, 'PUT');
            if(response) {
                setAmount(0);
                router.push('(tabs)/players');
            }
        } catch(error) {
            //setAmountAlert(true);
            console.log(error?.message);
            setErrorData({amount: error?.message});
            isClicked.current = false;
        } finally {
            setLoading(false);
        }
    }

    const getPlayer = async () => {
        try {
            setLoading(true);
            if(playerId < 0) throw new Error('Player not found.');

            const response = await sendJSON(urls['getplayer'], {playerId});
            if(response) {
                const {firstname, lastname, max_limit, note, status, added_by, created_at} = response.player;
                const name = `${firstname} ${lastname}`;
                const createdAt = formattedDateAndTime(new Date(created_at));
                setPlayer({name, maxLimit: max_limit, note, status, addedBy: added_by, createdAt});
            }
        } catch(error) {
            setPlayerAlert(true);
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        getPlayer();
        return () => {
            isClicked.current = false;
        }
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
                <View className="flex-1 w-full min-h-screen flex flex-col px-4 pb-4 bg-white">
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>

                    <Text className="font-pbold text-lg">Stats</Text>
                    <View className="w-full flex flex-col justify-center">
                        <Text className="text-xl text-primary">{player?.name}</Text>
                        <Text className={`text-primary ${player?.maxLimit?'flex':'hidden'}`}>
                            Limit: {formattedNumber(player?.maxLimit)}
                        </Text>
                        <Text className={`text-primary/80 ${player?.note?'flex':'hidden'}`}>{player?.note}</Text>
                        <Text className="text-primary/80 italic">Added by: {player?.addedBy}</Text>
                        <Text className="text-primary">{player?.createdAt}</Text>
                        <View className="w-full bg-lightshade rounded-xl px-4 pt-4 pb-2 my-4">
                            <Text className="font-psemibold text-primary">Player Stats:</Text>
                            <Text className="font-psemibold text-[34px] text-primary leading-none">{formattedNumber(player?.status)}</Text>
                        </View>
                    </View>

                    <View className="w-full flex flex-row">
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
                    <FormField
                        title="Input"
                        value={`${amount===0?'':action.plus?'+':'-'}${formattedNumber(amount)}`}
                        placeholder="Data"
                        onChange={value => {
                            const units = Math.floor(Math.abs(toNumber(value)));
                            if(units < 900_000_000_000_000) setAmount(units)
                        }}
                        keyboardType="numeric"
                        contClassName="mt-4"
                    />
                    <ErrorField error={errorData?.amount || ''} /> 
                    <FormField
                        title="Note"
                        value={note}
                        placeholder="Note"
                        onChange={value => setNote(value)}
                        contClassName="my-4"
                    />
                    <CustomButton title="Input Data" onPress={inputData} contClassName="w-full mt-4" />
                </View>
            </ScrollView>
            {playerAlert && <CustomAlert visible={true} onClose={()=>router.push('(tabs)/players')} title="Player not Found" message="There's something wrong." />}
            {/*{amountAlert && <CustomAlert visible={true} onClose={()=>setAmountAlert(false)} title="Number of Units" message="An error occurred. Unable to record the input, possibly due to a zero value. Please try again." />}*/}
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Record;

