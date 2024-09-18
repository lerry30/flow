import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

const CustomAlert = ({ visible, onClose, title, message }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/75">
                <View className="w-80 p-6 bg-gray-800 rounded-lg">
                    <Text className="text-white text-lg font-bold">{title}</Text>
                    <Text className="text-white mt-4">{message}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="mt-6 bg-red-600 p-2 rounded-full"
                    >
                        <Text className="text-white text-center">OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;

