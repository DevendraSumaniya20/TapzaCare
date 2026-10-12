import { House } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StateView } from '../components/StateView';

// Placeholder until the config-driven home lands on feature/home.
export function HomeScreen() {
  const { t } = useTranslation();
  return (
    <StateView
      icon={House}
      title={t('home.emptyTitle')}
      message={t('home.emptyMessage')}
    />
  );
}
