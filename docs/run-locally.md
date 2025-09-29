# Run locally

1. Install Packages:

- you can copy this script or you can install the packages in each of the apps

```
(cd apps/mobile_client && npm i) && (cd apps/admin_client && npm i) && (cd apps/backend && npm i)
```

2. Update .env

- If you were on the team as of Spring 2025 semester you should have gotten the mongodb connection string sent to your school email. Copy it to .env.example and rename the file to just .env

- If you need the connection string you can contact Roman or club leadership.

## To run the backend

```bash
cd apps/backend
npm run start
```

## To run the mobile app:

``` bash
cd apps/mobile_client
```

1. if you want to run in the android simulator

```
npx expo prebuild
npx expo run:android
```
If you want to run it in an ios simulator with Xcode

> This option is no longer valid, always run it in either android/ios emulator

2. if you want to run on the web

```
npx expo start
w
```


## To run the admin client:

``` bash
cd apps/admin_client
npm run dev
```

# Troubleshooting:

if the mobile app isn't working, here are some things you can try:

`npx expo-doctor` is a suite of tests that will help you diagnose potential issues with your expo app

`npx expo install --check` will make sure your packages are up to date and are the right versions to work with each other

If you make major changes or add new packages, it is best to prebuild again

We are using native packages such as react native mmkv. This means that you cannot use expo go on the emulator. If you want to run without creating a development build with `run:android`, you can only view the app on the web.
