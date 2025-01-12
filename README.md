# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



```ts

// apps/client/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMinimalUser } from '@middle/types';

interface AuthContextProps {
  user: IMinimalUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IMinimalUser | null>(null);

  useEffect(() => {
    // Attempt to load user from storage
    (async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    // userService.login() => returns { token, user: IMinimalUser }
    const { user: userData, token } = await userService.login({ email, password });

    // Store user & token in local storage
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
  }

  async function logout() {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Helper hook to use the AuthContext values */
export function useAuth() {
  return useContext(AuthContext);
}
// apps/client/app/_layout.tsx
import React from 'react';
import { Slot, Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';

/**
 * Root layout. 
 * We wrap the entire app in an AuthProvider context so we can handle user authentication across screens.
 */
export default function Layout() {
  return (
    <AuthProvider>
      {/* 
        Slot is where nested routes will be rendered.
        By default, everything in app/(tabs) or app/auth 
        will appear in this <Slot /> if their layout doesn’t override it.
      */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
        <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
      </Stack>
    </AuthProvider>
  );
}

```