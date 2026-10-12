import { CalendarDays } from 'lucide-react-native';
import { StateView } from '../components/StateView';

// Placeholder until the booking flow lands on feature/booking.
export function BookingsScreen() {
  return (
    <StateView
      icon={CalendarDays}
      title="No bookings yet"
      message="Appointments you book will appear here."
    />
  );
}
