import { toast } from '@/lib/hooks/use-toast';
import { CombinedError } from 'urql';

export function handleError(error: CombinedError) {
  console.log('ERRROOR', error);
  toast.show({
    type: 'error',
    text1: 'Error',
    text2: error.message.replace('[GraphQL] ', ''),
  });
}
