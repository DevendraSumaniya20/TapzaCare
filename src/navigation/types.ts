import type {
  NavigatorScreenParams,
  ParamListBase,
} from '@react-navigation/native';

/** A rectangle in window coordinates. */
export type Rect = { x: number; y: number; width: number; height: number };

export type RootStackParamList = {
  // Tab route names are config ids, so they cannot be listed here.
  Tabs: NavigatorScreenParams<ParamListBase> | undefined;
  // Opened from a doctor (id known) or from a service / quick action (user picks the doctor).
  // `photoOrigin` is where the doctor's photo was on the previous screen, so it can fly into place.
  Booking: { doctorId?: string; photoOrigin?: Rect } | undefined;
  PrescriptionDetail: { prescriptionId: string };
  ConfigAdmin: undefined;
};
