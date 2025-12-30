/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(caregiver)` | `/(caregiver)/alerts` | `/(caregiver)/home` | `/(caregiver)/medications` | `/(caregiver)/patients` | `/(caregiver)/schedule` | `/(caregiver)/settings` | `/(clinician)` | `/(clinician)/home` | `/(clinician)/patients` | `/(clinician)/schedule` | `/(clinician)/settings` | `/(clinician)/telemedicine` | `/(elder)` | `/(elder)/ask` | `/(elder)/home` | `/(elder)/medications` | `/(elder)/memories` | `/(elder)/settings` | `/(elder)/video-call` | `/_sitemap` | `/alerts` | `/ask` | `/auth` | `/home` | `/medications` | `/memories` | `/patients` | `/schedule` | `/settings` | `/telemedicine` | `/video-call`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
