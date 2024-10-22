import { View, TouchableOpacity } from 'react-native';
import { zUser } from '@/store/user';
import { useRouter } from 'expo-router';
import { removeFromLocal } from '@/utils/localStorage';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AppLogo from '@/components/AppLogo';

const Header = () => {
    const router = useRouter();
    return (
        <View className="w-full flex flex-row justify-between items-center">
            <View className="w-[90px]">
                <AppLogo style={{width: 'fit-content'}}/>
            </View>
            <TouchableOpacity
                onPress={async () => {
                    await removeFromLocal('user');
                    await removeFromLocal('token');
                    zUser.getState()?.removeAllData();
                    router.push('(user)/login');
                }}
                className="p-1 rounded-full bg-secondary">
                <FontAwesome5 name="power-off" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

export default Header;
