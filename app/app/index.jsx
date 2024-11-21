import { View, Text, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { saveToLocal, getFromLocal, removeFromLocal } from '@/utils/localStorage';
import { useLayoutEffect, useState } from 'react';
//import { zUser } from '@/store/user';
import { appInactivityLogout } from '@/utils/loggedOut';

import BackgroundImage from '@/assets/background.png';
import CustomButton from '@/components/CustomButton';
import AntDesign from '@expo/vector-icons/AntDesign';

//import * as Updates from 'expo-updates';

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    //const saveUser = zUser(state => state?.setUser);

    const APP_STATUS = 'preview';
    //const APP_STATUS = 'development';
    // save user and posts data to store
    useLayoutEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // check for an update
                if(APP_STATUS==='preview') {
                    const Updates = await import('expo-updates');
                    const update = await Updates.checkForUpdateAsync();
                    if(update.isAvailable) {
                        await Updates.fetchUpdateAsync();
                        await Updates.reloadAsync(); // Restart the app to apply the update
                    }
                }

                //await removeFromLocal('user');return;
                //const user = await getFromLocal('user');
                //const userStatus = saveUser(user);
                //console.log(userStatus.message);
                //if(!userStatus?.ok) throw new Error(userStatus?.message);
                //router.push('(tabs)/players');

                const signedUser = await getFromLocal('init')?.signedUser;
                console.log(signedUser);
                if(!signedUser) {
                    await saveToLocal('init', {signedUser: true});
                } else {
                    router.push('(tabs)/players');
                }
            } catch(error) {
                console.log('Init landing page: ', error?.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    appInactivityLogout();

    if(loading) {
        return (
            <SafeAreaView className="flex-1 flex justify-center items-center">
                <ActivityIndicator size="large" color="#dc3f1c" />
                <Text>Checking for new updates...</Text>
            </SafeAreaView>
        )
    }

    return (
        <View className="relative flex-1 size-screen min-h-screen px-4 pb-10 flex justify-end">
            <Image className="h-[100%] aspect-square -top-[4%] -left-[90%]" source={BackgroundImage} resizeMode="contain"/>
            <CustomButton title="Get Started" onPress={() => router.push('/(tabs)/players')} contClassName="w-full mt-[40px]">
                <AntDesign name="arrowright" size={30} color="white" />
            </CustomButton>
        </View>
    )
}

export default HomePage;
