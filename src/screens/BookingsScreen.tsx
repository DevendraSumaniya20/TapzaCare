import { CalendarDays } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StateView } from '../components/StateView';

// Placeholder until the booking flow lands on feature/booking.
export function BookingsScreen() {
  const { t } = useTranslation();
  return (
    <StateView
      icon={CalendarDays}
      title={t('bookings.emptyTitle')}
      message={t('bookings.emptyMessage')}
    />
  );
}
