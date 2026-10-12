import {
  Bell,
  CalendarDays,
  Circle,
  FileText,
  FlaskConical,
  HeartPulse,
  House,
  Pill,
  Stethoscope,
  Syringe,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';

// Icon names the config may use. Explicit imports keep the bundle to the icons we ship.
const ICONS: Record<string, LucideIcon> = {
  home: House,
  calendar: CalendarDays,
  pill: Pill,
  user: UserRound,
  family: UsersRound,
  bell: Bell,
  prescription: FileText,
  stethoscope: Stethoscope,
  lab: FlaskConical,
  vaccine: Syringe,
  heart: HeartPulse,
};

/** An icon name we do not know renders a neutral dot rather than crashing. */
export const getIcon = (name: string): LucideIcon => ICONS[name] ?? Circle;
