import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

//import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar'; 

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const defaultTheme = {colors: {background: '#fff', border: 'rgb(216, 216, 216)', card: 'rgb(255, 255, 255)', notification: 'rgb(255, 59, 48)', primary: 'rgb(0, 122, 255)', text: 'rgb(28, 28, 30)'}, dark: false}
//    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
        "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
        "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    });

    useEffect(() => {
        if(loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if(!loaded) {
        return null;
    }

    return (
        <ThemeProvider value={defaultTheme}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(user)/signup" options={{ headerShown: false }} />
                <Stack.Screen name="(user)/login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(record)/[playerId]" options={{ headerShown: false }} />
                <Stack.Screen name="(transactions)/[playerId]" options={{ headerShown: false }} />
                <Stack.Screen name="(profitNLoss)/[date]" options={{ headerShown: false }} />
                <Stack.Screen name="(pnl)/add/revenue/[date]" options={{ headerShown: false }} />
                <Stack.Screen name="(pnl)/add/expense/[date]" options={{ headerShown: false }} />
                <Stack.Screen name="(pnl)/add/x/[date]" options={{ headerShown: false }} />
                <Stack.Screen name="(pnl)/update/[category]/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="(pnl)/history/[category]/[date]/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="(player)/edit/[playerId]" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
        </ThemeProvider>
    );
}

//<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark' } />
