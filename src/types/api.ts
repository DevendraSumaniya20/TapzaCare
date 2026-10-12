// Shapes of the mock backend, as given in the assignment brief.

export type TabScreen = 'home' | 'bookings' | 'prescriptions' | 'profile';

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
};

export type Festival = {
  name: string;
  greeting: string;
  bannerImageUrl: string;
};

export type TabConfig = {
  id: string;
  label: string;
  icon: string;
  screen: TabScreen;
};

export type SectionBackground = {
  kind: 'color' | 'gradient' | 'image';
  // color: one colour. gradient: comma-separated colours, top to bottom. image: URL.
  value: string;
  // Optional replacement for `value` in dark mode. Not in the brief; added for config-driven dark mode.
  darkValue?: string;
};

export type SectionConfig = {
  id: string;
  // Kept as string on purpose: unknown types reach the renderer and are skipped there.
  type: string;
  background: SectionBackground;
  title?: string;
  items: unknown[];
};

export type LayoutConfig = {
  version: number;
  // `dark` is an extension to the brief: the palette to use in dark mode, if the admin supplies one.
  theme: ThemeColors & { festival?: Festival; dark?: ThemeColors };
  tabs: TabConfig[];
  sections: SectionConfig[];
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  feeInr: number;
  languages: string[];
};

export type Slot = {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
};

export type Booking = {
  id: string;
  doctorId: string;
  slotId: string;
  startsAt: string;
  status: 'confirmed';
};

export type DoseTiming = 'morning' | 'afternoon' | 'night';

export type Medicine = {
  id: string;
  name: string;
  dose: string;
  days: number;
  timing: DoseTiming[];
};

export type Prescription = {
  id: string;
  issuedAt: string;
  doctorName: string;
  clinicName: string;
  medicines: Medicine[];
};
