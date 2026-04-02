import {
  getNbackHistoryHeaderData,
  getNbackHistoryList,
  type NbackHistoryHeaderData,
  type NbackHistoryItem,
} from "@/entities/nback";
import { useEffect, useState } from "react";

export const useNbackHistory = () => {
  const [historyList, setHistoryList] = useState<NbackHistoryItem[]>([]);
  const [headerData, setHeaderData] = useState<NbackHistoryHeaderData | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [list, header] = await Promise.all([
          getNbackHistoryList(),
          getNbackHistoryHeaderData(),
        ]);

        if (isMounted) {
          setHistoryList(list);
          setHeaderData(header);
        }
      } catch (error) {
        console.error("Failed to fetch nback history:", error);
        if (isMounted) {
          setHistoryList([]);
          setHeaderData(null);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { historyList, headerData };
};