import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function useFunnels(user_id: string) {
  const shouldFetch = user_id ? true : false;

  const { data, error } = useSWR(shouldFetch ? `/api/funnels` : null, fetcher);

  return {
    funnels: data,
    isFunnelsLoading: !error && !data,
    isFunnelsError: error,
  };
}

export default useFunnels;