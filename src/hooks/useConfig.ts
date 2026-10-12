import { FALLBACK_CONFIG } from '../constants/theme';
import { useGetConfigQuery } from '../services/api';
import { useAppSelector } from '../store';

/** The remote layout config for the day the mock is set to, plus where it came from. */
export function useConfig() {
  const variant = useAppSelector(state => state.settings.variant);
  const { data, isLoading, isFetching, refetch } = useGetConfigQuery(variant);

  return {
    config: data?.config ?? FALLBACK_CONFIG,
    source: data?.source,
    // True only before the first config ever arrives; later switches keep showing the old one.
    isLoading,
    isFetching,
    refetch,
  };
}
