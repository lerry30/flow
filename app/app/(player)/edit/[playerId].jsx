import { View, Text, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLayoutEffect, useState, useRef } from 'react';
import { toNumber, formattedNumber } from '@/utils/number';
import { formattedDateAndTime } from '@/utils/datetime'; 
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { appInactivityLogout } from '@/utils/loggedOut';

import Header from '@/components/Header';
import FormField from '@/components/FormField';
import ErrorField from '@/components/ErrorField';
import CustomButton from '@/components/CustomButton';
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomAlert from '@/components/CustomAlert';

const EditPlayer = () => {
    const [playerData, setPlayerData] = useState({firstname: '', lastname: '', maxLimit: 0, note: '', status: 0}); // status to display player's current balance
    const [error, setError] = useState({firstname: '', lastname: '', maxLimit: '', default: ''});
    const [loading, setLoading] = useState(false);
    const [playerAlert, setPlayerAlert] = useState(false);

    const router = useRouter();
    const isClicked = useRef(false); // button is clicked

    const playerId = useLocalSearchParams()?.playerId;
    
    const editPlayer = async () => {
        try {
            if(isClicked.current) return;
            setLoading(true);
            setError({firstname: '', lastname: '', maxLimit: '', default: ''});

            playerData.firstname = String(playerData?.firstname).trim();
            playerData.lastname = String(playerData?.lastname).trim();
            playerData.note = String(playerData?.note).trim();
            if(!playerData?.firstname) {
                setError(data => ({...data, firstname: 'First name is empty.'}));
                throw new Error('Error: Input fields are required.');
            }

            const data = {
                playerId,
                firstname: playerData.firstname,
                lastname: playerData.lastname,
                maxLimit: toNumber(playerData?.maxLimit),
                note: playerData.note,
            };

            isClicked.current = true;
            const result = await sendJSON(urls['updateplayer'], data, 'PUT');
            if(result) {
                setPlayerData({firstname: '', lastname: ''});
                router.push('(tabs)/players');
            }
        } catch(error) {
            console.log(error?.message);
            setError(state => ({...state, default: error?.message}));
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
                const {firstname, lastname, max_limit, note, status} = response.player;
                setPlayerData({firstname, lastname, maxLimit: max_limit, note, status});
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
                <View className="flex-1 w-full min-h-screen flex flex-col px-4 bg-white">
                    <Header />
                    <Text className="font-pbold text-lg py-2">Edit Player</Text>
                    <FormField
                        title="First Name (Restricted Access)"
                        value={playerData?.firstname}
                        placeholder="First Name"
                        onChange={value => setPlayerData(data => ({...data, firstname: value }))}
                        contClassName=""
                    />
                    <ErrorField error={error?.firstname || ''} />
                    <FormField
                        title="Last Name (Restricted Access)"
                        value={playerData?.lastname}
                        placeholder="Last Name"
                        onChange={value => setPlayerData(data => ({...data, lastname: value }))}
                        contClassName="pt-2"
                    />
                    <ErrorField error={error?.lastname || ''} />
                    {playerData?.status<0 && <Text className="mt-2">Player's current balance {formattedNumber(playerData?.status)}</Text>}
                    <FormField
                        title="Limit (Restricted Access)"
                        value={formattedNumber(playerData?.maxLimit)}
                        placeholder="Limit"
                        onChange={value => {
                            const input = toNumber(value);
                            setPlayerData(data => ({...data, maxLimit: input }))
                        }}
                        keyboardType="numeric"
                        contClassName="pt-2"
                    />
                    <ErrorField error={error?.maxLimit || ''} />
                    <FormField
                        title="Note"
                        value={playerData?.note}
                        placeholder="Note"
                        onChange={value => setPlayerData(data => ({...data, note: value }))}
                        contClassName="pt-2"
                    />
                    <CustomButton title="Edit Player" onPress={editPlayer} contClassName="w-full mt-8" />
                    <ErrorField error={error?.default || ''} />
                </View>
            </ScrollView>
            {playerAlert && <CustomAlert visible={true} onClose={()=>router.push('(tabs)/players')} title="Player not Found" message="There's something wrong." />}
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default EditPlayer;
