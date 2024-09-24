import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getFromLocal, removeFromLocal } from '@/utils/localStorage';
import { useLayoutEffect } from 'react';
import { zUser } from '@/store/user';

import BackgroundImage from '@/assets/background.png';
import CustomButton from '@/components/CustomButton';
import AntDesign from '@expo/vector-icons/AntDesign';

const HomePage = () => {
    const router = useRouter();
    const saveUser = zUser(state => state?.setUser);

    // save user and posts data to store
    useLayoutEffect(() => {
        (async () => {
            try {
                //await removeFromLocal('user');
                //return;
                const user = await getFromLocal('user');
                const userStatus = saveUser(user);

                console.log(userStatus.message);
                if(!userStatus?.ok) throw new Error(userStatus?.message);
                router.push('(tabs)/players');
            } catch(error) {
                console.log('Init landing page: ', error?.message);
            }
        })();
    }, []);

    return (
        <View className="relative flex-1 size-screen min-h-screen px-4 pb-10 flex justify-end">
            <Image className="absolute h-[100%] aspect-square -top-[14vh] -left-[40vh]" source={BackgroundImage} resizeMode="contain"/>
            <CustomButton title="Get Started" onPress={() => router.push('/(tabs)/players')} contClassName="w-full mt-[40px]">
                <AntDesign name="arrowright" size={30} color="white" />
            </CustomButton>
        </View>
    )
}

export default HomePage;
