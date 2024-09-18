import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageNames = {
    user: 'user',
    token: 'token',
};

export const saveToLocal = async (name, data) => {
    try {
        const storageName = storageNames[name];
        if(!storageName) throw new Error('Undefined Local Storage Name');

        await AsyncStorage.setItem(storageName, JSON.stringify(data));
        return true;
    } catch(error) {
        const message = error?.message || error;
        console.log(message);
    }

    return false;
}

export const getFromLocal = async (name) => {
    try {
        const storageName = storageNames[name];
        if(!storageName) throw new Error('Undefined Local Storage Name');

        const data = await AsyncStorage.getItem(storageName);
        return JSON.parse(data);
    } catch(error) {
        const message = error?.message || error;
        console.log(message);
    }

    return undefined;
}

export const removeFromLocal = async (name) => {
    try {
        const storageName = storageNames[name];
        if(!storageName) throw new Error('Undefined Local Storage Name');

        await AsyncStorage.removeItem(storageName);
        return true;
    } catch(error) {
        const message = error?.message || error;
        console.log(message);
    }

    return false;
}
