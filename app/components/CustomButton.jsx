import { TouchableOpacity, Text, View } from 'react-native';

const CustomButton = ({ children, title, onPress, contClassName, textClassName }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`relative bg-secondary rounded-full min-h-[62px] flex flex-row justify-center items-center ${contClassName}`}
        >
            <Text className={`text-white font-psemibold text-lg ${textClassName}`}>{title}</Text>
            <View className="absolute right-4">
                { children }
            </View>
        </TouchableOpacity>
    )
}

export default CustomButton;
