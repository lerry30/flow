import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
//import { useColorScheme } from '@/hooks/useColorScheme';

import Feather from '@expo/vector-icons/Feather';

const FormField = ({ title, value, placeholder, onChange, contClassName, keyboardType='default' }) => {
    const [ showPassword, setShowPassword ] = useState(false);
    //const colorScheme = useColorScheme();
    //const iconColor = colorScheme === 'dark' ? 'white' : 'black';
    const iconColor = '#2e2e2e';

    return (
        <View className={`space-y-2 ${contClassName}`}>
            <Text className="text-base text-primary font-pmedium">{title}</Text>
            <View className="w-full h-16 px-6 rounded-full border-2 border-primary focus:border-secondary flex flex-row items-center">
                <TextInput
                    className="flex-1 text-primary font-psemibold text-base"
                    selectionColor="#dc3f1c"
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7B7B8B"
                    onChangeText={onChange}
                    keyboardType={keyboardType}
                    secureTextEntry={String(title).toLowerCase() === 'password' && !showPassword}
                />
                {
                    String(title).toLowerCase() === 'password' && (
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            { showPassword ?
                                    <Feather name="eye" size={24} color={iconColor} />
                                :
                                    <Feather name="eye-off" size={24} color={iconColor} />
                            }
                        </TouchableOpacity>
                    )
                }
            </View>
        </View>
    )
}

export default FormField;

// keyboard types
// default
// number-pad
// decimal-pad
// numeric
// email-address
// phone-pad
// url
