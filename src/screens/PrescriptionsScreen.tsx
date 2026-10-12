import { Pill } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StateView } from '../components/StateView';

// Placeholder until prescriptions land on feature/prescriptions.
export function PrescriptionsScreen() {
  const { t } = useTranslation();
  return (
    <StateView
      icon={Pill}
      title={t('prescriptions.emptyTitle')}
      message={t('prescriptions.emptyMessage')}
    />
  );
}
