import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { formattedDateAndTime } from '@/utils/datetime';
import { toNumber, formattedNumber } from '@/utils/number';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomAlert from '@/components/CustomAlert';

const Record = () => {
    const [player, setPlayer] = useState({name: '', status: 0, addedBy: '', createdAt: ''});
    const [amount, setAmount] = useState(0);
    const [action, setAction] = useState({plus: false, minus: true});
    const [loading, setLoading] = useState(false);
    const [playerAlert, setPlayerAlert] = useState(false);
    const [amountAlert, setAmountAlert] = useState(false);

    const playerId = useLocalSearchParams()?.playerId;
    const router = useRouter();

    const inputData = async () => {
        try {
            setLoading(true);
            const nAmount = toNumber(amount);
            if(nAmount === 0) {
                setAmountAlert(true);
                return;
            }

            const response = await sendJSON(urls['borrowpay'], {playerId, action, amount: nAmount}, 'PUT');
            if(response) {
                setAmount(0);
                router.push('(tabs)/home');
            }
        } catch(error) {
            setAmountAlert(true);
            console.log(error?.message);
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
                const {firstname, lastname, status, added_by, created_at} = response.player;
                const name = `${firstname} ${lastname}`;
                const createdAt = formattedDateAndTime(new Date(created_at));
                setPlayer({name, status, addedBy: added_by, createdAt});
            }
        } catch(error) {
            setPlayerAlert(true);
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            getPlayer();    
            return () => {
                setPlayer({});
                setAmount(0);
                setAction({plus: false, minus: true});
                setLoading(false);
                setPlayerAlert(false);
                setAmountAlert(false);
            }
        }, [playerId])
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
                <View className="flex-1 w-full min-h-screen flex flex-col p-4 bg-white">
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>

                    <Text className="font-pbold text-lg py-2">Stats</Text>
                    <View className="w-full flex flex-col justify-center">
                        <Text className="text-xl text-primary">{player?.name}</Text>
                        <Text className="text-primary/80 italic">Added by: {player?.addedBy}</Text>
                        <Text className="text-primary">{player?.createdAt}</Text>
                        <View className="w-full bg-lightshade rounded-xl px-4 pt-4 pb-2 my-4">
                            <Text className="font-psemibold text-primary">Player Stats:</Text>
                            <Text className="font-psemibold text-[40px] text-primary leading-none">{formattedNumber(player?.status)}</Text>
                        </View>
                    </View>

                    <View className="w-full flex flex-row">
                        <TouchableOpacity 
                            activeOpacity={1} 
                            onPress={() => {
                                setAction({minus: true, plus: false});
                            }}
                            className="w-[48%] aspect-square flex justify-center items-center bg-lightshade rounded-xl mr-[4%]"
                            style={{backgroundColor: action.minus ? '#dc3f1cbb' : '#dcdcdc'}}
                        >
                            <Feather name="minus" size={40} color={action.minus ? 'white' : '#2e2e2e'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={1} 
                            onPress={() => {
                                setAction({minus: false, plus: true});
                            }}
                            className="w-[48%] aspect-square flex justify-center items-center bg-lightshade rounded-xl"
                            style={{backgroundColor: action.plus ? '#dc3f1cbb' : '#dcdcdc'}}
                        >
                            <AntDesign name="plus" size={40} color={action.plus ? 'white' : '#2e2e2e'} />
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
                    <CustomButton title="Input Data" onPress={inputData} contClassName="w-full mt-4" />
                </View>
            </ScrollView>
            {playerAlert && <CustomAlert visible={true} onClose={()=>router.push('(tabs)/home')} title="Player not Found" message="There's something wrong." />}
            {amountAlert && <CustomAlert visible={true} onClose={()=>setAmountAlert(false)} title="Number of Units" message="An error occurred. Unable to record the input, possibly due to a zero value. Please try again." />}
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Record;

