import { House } from 'lucide-react-native';
import { StateView } from '../components/StateView';

// Placeholder until the config-driven home lands on feature/home.
export function HomeScreen() {
  return (
    <StateView
      icon={House}
      title="Home"
      message="Your clinic services will appear here."
    />
  );
}
