import { View, Text, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { toNumber } from '@/utils/number';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';
import { useRouter } from 'expo-router';

import AppLogo from '@/components/AppLogo';
import FormField from '@/components/FormField';
import ErrorField from '@/components/ErrorField';
import CustomButton from '@/components/CustomButton';
import AntDesign from '@expo/vector-icons/AntDesign';

const Create = () => {
    const [playerData, setPlayerData] = useState({firstname: '', lastname: ''});
    const [error, setError] = useState({firstname: '', lastname: ''});
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    
    const newPlayer = async () => {
        try {
            setLoading(true);
            let br = false;
            if(!playerData?.firstname) {
                setError(data => ({...data, firstname: 'First name is empty.'}));
                br = true;
            }

            if(!playerData?.lastname) {
                setError(data => ({...data, lastname: 'Last name is empty.'}));
                br = true;
            }

            if(br) throw new Error('Error: Input fields are required.');

            const data = {
                firstname: playerData.firstname, 
                lastname: playerData.lastname, 
                amount: amount,
            };
            const result = await sendJSON(urls['newplayer'], data);
            if(result) {
                setPlayerData({firstname: '', lastname: ''});
                setAmount(0);
                router.push('(tabs)/home');
            }
        } catch(error) {
            console.log(error?.message);
        }

        setLoading(false);
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
                <View className="flex-1 w-full min-h-screen flex flex-col p-4 bg-white">
                    <View className="w-[90px]">
                        <AppLogo style={{width: 'fit-content'}}/>
                    </View>
                    <Text className="font-pbold text-lg py-2">Add New Player</Text>
                    <FormField
                        title="First Name"
                        value={playerData?.firstname}
                        placeholder="First Name"
                        onChange={value => setPlayerData(data => ({...data, firstname: value }))}
                        contClassName=""
                    />
                    <ErrorField error={error?.firstname || ''} />
                    <FormField
                        title="Last Name"
                        value={playerData?.lastname}
                        placeholder="Last Name"
                        onChange={value => setPlayerData(data => ({...data, lastname: value }))}
                        contClassName=""
                    />
                    <ErrorField error={error?.lastname || ''} />

                    <Text className="text-base text-primary font-pmedium">Input</Text>
                    <View className="w-full h-16 px-6 rounded-full border-2 border-primary focus:border-secondary flex flex-row items-center">
                        <AntDesign name="plus" size={24} color="#2e2e2e" />
                        <TextInput
                            className="flex-1 text-primary font-psemibold text-base pl-4"
                            selectionColor="#dc3f1c"
                            value={amount}
                            placeholder="Data"
                            placeholderTextColor="#7B7B8B"
                            onChangeText={value => {
                                const nValue = Math.floor(toNumber(value));
                                if(nValue < 900_000_000_000_000 || nValue > -900_000_000_000_000) setAmount(nValue);
                            }}
                            keyboardType="numeric"
                        />
                    </View>

                    <CustomButton title="Add New Player" onPress={newPlayer} contClassName="w-full mt-8" />
                </View>
            </ScrollView>
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

export default Create;
