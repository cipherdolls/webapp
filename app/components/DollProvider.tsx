import { useDoll } from '~/hooks/useDoll';
import type { Doll } from '~/types';

interface DollProviderProps {
  dollId: string;
  children: (doll: Doll) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error) => React.ReactNode;
}

export function DollProvider({ 
  dollId, 
  children, 
  loadingComponent = <div>Loading...</div>,
  errorComponent = (error: Error) => <div>Error: {error.message}</div>
}: DollProviderProps) {
  const { data: doll, isLoading, error } = useDoll(dollId);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent(error)}</>;
  }

  if (!doll) {
    return <div>Doll not found</div>;
  }

  return <>{children(doll)}</>;
} 