# Run locally

First, from the root:

```bash
npm i
turbo build
```

`npm i` organizes all your packages and link the local packages

`turbo build` creates the builds for our backend / next / packages in the order that they depend on each other.

## To run the mobile app:

``` bash
cd apps/mobile_client
npm i
```

1. if you want to run in the android simulator

```
npx expo prebuild
npx expo run:android
```

2. if you want to run on the web

```
npx expo start
w
```

## To run the backend

```bash
cd apps/backend
npm run dev
```

## To run the admin client:

``` bash
cd apps/admin_client
npm i
npm run dev
```

# Troubleshooting:

if the mobile app isn't working, here are some things you can try:

`npx expo-doctor` is a suite of tests that will help you diagnose potential issues with your expo app

`npx expo install --check` will make sure your packages are up to date and are the right versions to work with each other

If you make major changes or add new packages, it is best to prebuild again

We are using native packages such as react native mmkv. This means that you cannot use expo go on the emulator. If you want to run without creating a development build with `run:android`, you can only view the app on the web.