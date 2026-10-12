import type {
  NavigatorScreenParams,
  ParamListBase,
} from '@react-navigation/native';

export type RootStackParamList = {
  // Tab route names are config ids, so they cannot be listed here.
  Tabs: NavigatorScreenParams<ParamListBase> | undefined;
  // Opened from a doctor (id known) or from a service / quick action (user picks the doctor).
  Booking: { doctorId?: string } | undefined;
};
