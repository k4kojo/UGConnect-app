declare module "firebase/auth/react-native" {
  export * from "firebase/auth";
  // Minimal type shim for React Native Auth persistence helper.
  export function getReactNativePersistence(storage: any): any;
}
