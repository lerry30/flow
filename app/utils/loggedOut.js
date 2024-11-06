import { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';

import { zUser } from '@/store/user';
import { removeFromLocal } from '@/utils/localStorage';
import { useRouter } from 'expo-router';

// unable to use useRouter due to hooks can only works inside body component and logout is a function
export const logout = async () => {
    await removeFromLocal('user');
    await removeFromLocal('token');
    zUser.getState()?.removeAllData();
}

export const appInactivityLogout = () => {
    const [appState, setAppState] = useState(AppState.currentState);
    const router = useRouter();
    const lastActionTimestamp = useRef(Date.now());
    const isLoggingOut = useRef(false);

    const handleAppStateChange = async (nextAppState) => {
        // Debounce logic: Ignore state changes that happen too quickly
        const now = Date.now();
        if (now - lastActionTimestamp.current < 1000) return;
        lastActionTimestamp.current = now;

        // Only handle meaningful state transitions
        if (appState === 'active' && (nextAppState === 'background' || nextAppState === 'inactive')) {
            if (!isLoggingOut.current) {
                isLoggingOut.current = true;
                try {
                    await logout();
                    router.replace('(user)/login');
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            } else {
                isLoggingOut.current = false;
            }
        }

        setAppState(nextAppState);
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        // Cleanup
        return () => subscription.remove();
    }, [appState]);
};
