import { Pill } from 'lucide-react-native';
import { StateView } from '../components/StateView';

// Placeholder until prescriptions land on feature/prescriptions.
export function PrescriptionsScreen() {
  return (
    <StateView
      icon={Pill}
      title="No prescriptions yet"
      message="Prescriptions from your doctor will appear here."
    />
  );
}
