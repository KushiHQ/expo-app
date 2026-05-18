import { Bank } from '@/lib/types/queries/banks';
import { useQuery } from '@tanstack/react-query';

export const useBanksQuery = () => {
  return useQuery({
    queryFn: async () => {
      const res = await fetch(
        'https://raw.githubusercontent.com/supermx1/nigerian-banks-api/main/data.json',
      );
      const json = await res.json();
      return json as Bank[];
    },
    queryKey: ['banks'],
  });
};
