import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useLayoutEffect } from 'react';
import { useRouter, Link } from 'expo-router';
import { authUser } from '@/utils/auth';
import { urls } from '@/constants/urls';
//import { saveToLocal } from '@/utils/localStorage';
import { zUser } from '@/store/user';

import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import ErrorField from '@/components/ErrorField';
import TitleFormat from '@/utils/titleFormat';
import AppLogo from '@/components/AppLogo';

const SignUp = () => {
    const [userData, setUserData] = useState({ firstname: '', lastname: '', username: '', password: '' });
    const [error, setError] = useState({ firstname: '', lastname: '', username: '', password: '', server: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const saveUser = zUser(state => state.setUser);

    const createUser = async () => {
        setLoading(true);
        setError({ firstname: '', lastname: '', username: '', password: '' });

        const success = async (response) => {
            try {
                const nUser = {
                    id: response?.id,
                    firstname: response?.firstname || '',
                    lastname: response?.lastname || '',
                    username: response?.username,
                }

                if(!nUser?.id || !nUser?.username) throw new Error('User Credentials Undefined');
                //await saveToLocal('user', nUser);
                saveUser(nUser);

                setUserData({ firstname: '', lastname: '', username: '', password: '' });
                router.push('/(tabs)/players');
            } catch(error) {
                console.log(error?.message);
                setError(state =>({...state, server: error?.message}));
            }
        }

        await authUser({
            userData: {
                ...userData,
                firstname: TitleFormat(userData?.firstname),
                lastname: TitleFormat(userData?.lastname),
            },
            setError,
            url: urls?.signup || '',
            callback: success,
        });

        setUserData({ ...userData, password: '' });
        setLoading(false);
    }

    useLayoutEffect(() => {
        if(zUser.getState()?.username) router.push('(tabs)/players');
    }, []);

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
                    <Text className="text-secondary font-pbold text-3xl pb-4">Signup</Text>
                    <FormField
                        title="First Name"
                        value={userData?.firstname}
                        placeholder="First Name"
                        onChange={value => setUserData(data => ({...data, firstname: value }))}
                        contClassName="pt-2"
                    />
                    <ErrorField error={error?.firstname || ''} />
                    <FormField
                        title="Last Name"
                        value={userData?.lastname}
                        placeholder="Last Name"
                        onChange={value => setUserData(data => ({...data, lastname: value }))}
                        contClassName="pt-2"
                    />
                    <ErrorField error={error?.lastname || ''} />
                    <FormField
                        title="Username"
                        value={userData?.username}
                        placeholder="example123"
                        onChange={value => setUserData(data => ({...data, username: value }))}
                        contClassName="pt-2"
                    />
                    <ErrorField error={error?.username || ''} />
                    <FormField
                        title="Password"
                        value={userData?.password}
                        placeholder="Password"
                        onChange={value => setUserData(data => ({...data, password: value }))}
                        contClassName="pt-2"
                    />
                    <ErrorField error={error?.password || ''} />
                    <CustomButton title="Sign Up" onPress={() => createUser()} contClassName="w-full mt-4" />
                    <ErrorField error={error?.server || ''} />
                    
                    <View className="flex justify-center pt-2 flex-row gap-2">
                        <Text className="text-lg text-primary font-pregular">
                            Already have an account?
                        </Text>
                        <Link
                            href="/login"
                            className="text-lg font-psemibold text-secondary"
                        >
                            Log In
                        </Link>
                    </View>
                </View>
           </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp;
