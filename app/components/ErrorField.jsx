import { Text } from 'react-native';

const ErrorField = ({ error }) => {
    return (
        <Text className="w-full text-red-600 font-pregular">{error}</Text>
    )
}

export default ErrorField;
