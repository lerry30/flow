import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { authUser } from '@/utils/auth';
import { urls } from '@/constants/urls';
import { saveToLocal } from '@/utils/localStorage';
import { zUser } from '@/store/user';

import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import ErrorField from '@/components/ErrorField';
import AppLogo from '@/components/AppLogo';

const LogIn = () => {
    const [userData, setUserData] = useState({ username: '', password: '' });
    const [error, setError] = useState({ username: '', password: '', server: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const saveUser = zUser(state => state.setUser);

    const login = async () => {
        setLoading(true);
        setError({ username: '', password: '' });

        const success = async (response) => {
            try {
                const nUser = {
                    id: response?.id,
                    firstname: response?.firstname,
                    lastname: response?.lastname,
                    username: response?.username,
                }

                if(!nUser?.id || !nUser?.username) throw new Error('User Credentials Undefined');

                await saveToLocal('user', nUser);
                saveUser(nUser);
                setUserData({ email: '', password: '' });
                router.push('/(tabs)/players');
            } catch(error) {
                setError(state => ({...state, server: error?.message}));
                console.log('Function: login ', error?.message);
            }
        }

        await authUser({
            userData,
            setError,
            url: urls?.signin || '',
            callback: success,
        });

        setUserData({ username: userData?.username, password: '' });
        setLoading(false);
    }

    if(loading) {
        return (
            <View className="flex-1 w-full h-screen flex justify-center items-center">
                <ActivityIndicator size="large" color="#3345ee" />
            </View>
        )
    }

    return (
        <SafeAreaView>
           <ScrollView>
                <View className="flex-1 size-screen min-h-screen flex flex-col justify-center items-center p-8">
                    <AppLogo />
                    <Text className="text-secondary font-pbold text-3xl pb-4">Log In</Text>
                    <FormField
                        title="Username"
                        value={userData?.username}
                        placeholder="example123"
                        onChange={value => setUserData(data => ({...data, username: value }))}
                        contClassName=""
                    />
                    <ErrorField error={error?.username || ''} />
                    <FormField
                        title="Password"
                        value={userData?.password}
                        placeholder="Password"
                        onChange={value => setUserData(data => ({...data, password: value }))}
                        contClassName=""
                    />
                    <ErrorField error={error?.password || ''} />
                    <CustomButton title="Log In" onPress={() => login()} contClassName="w-full mt-4" />
                    <ErrorField error={error?.server || ''} />

                    <View className="flex justify-center pt-5 flex-row gap-2">
                        <Text className="text-lg text-primary font-pregular">
                            Don't have an account?
                        </Text>
                        <Link
                            href="/signup"
                            className="text-lg font-psemibold text-secondary"
                        >
                            Sign Up
                        </Link>
                    </View>
                </View>
           </ScrollView>
        </SafeAreaView>
    )
}

export default LogIn;
