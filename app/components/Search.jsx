import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { sendJSON } from '@/utils/send';
import { urls } from '@/constants/urls';

import Feather from '@expo/vector-icons/Feather';

const Search = ({ callback, reset }) => {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const iconColor = '#2e2e2e';

    const find = async () => {
        try {
            setLoading(true);
            if(!search) return;
            const response = await sendJSON(urls['search'], {search});
            callback(response);
        } catch(error) {
            console.log(error?.message);
        } finally {
            setLoading(false);
        }
    }

    if(loading) {
        return (
            <View className="flex-1 w-full h-screen flex justify-center items-center">
                <ActivityIndicator size="large" color="#dc3f1c" />
            </View>
        )
    }

    return (
        <View className="w-full h-14 px-6 rounded-full border-2 border-primary focus:border-secondary flex flex-row items-center">
            <TextInput
                className="flex-1 text-primary font-psemibold text-base"
                selectionColor="#dc3f1c"
                value={search}
                placeholder="Search"
                placeholderTextColor="#7B7B8B"
                onChangeText={value => {
                    if(!value) reset();
                    setSearch(value);
                }}
            />
            <TouchableOpacity onPress={() => find()}>
                <Feather name="search" size={24} color={iconColor} />
            </TouchableOpacity>
        </View>
    )
}

export default Search;
