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


## Compatability Notes
for apple:
had to install rbenv (openssl is deprecated) to install ruby >3.1.0 (3.2.2 for apple silicon) to install a newer version of cocoapods
But it also requires xcode to be installed and I don't have enough space on my mac personally for that, so I skipped the IOS and just ran android
But that's an issue for react-native-mmkv so I downgraded that to 2.10.1 so I could showcase local storage. But it is possible that we go back and upgrade in order to have ios demo available as well
had to upgrade a couple react native packages for compatability (probably not necessary)
had to add some lines to android gradle files in android/app/build.gradle and android/settings.gradle
then you have to 
```
npx prebuild cd 
android && ./gradlew clean && cd ..
then npx expo run:android
```

warning: this process takes an apple silicon chip around 4-9 minutes so... yikes.

to be able to refresh the app using Refresh button you must not use a production release, so start the app with this command
```npx expo run:android --variant Release```

coding in this repository is like trying to catch a lubed up hog in the dark wearing roller blades, we should probably dockerize it sometime soon