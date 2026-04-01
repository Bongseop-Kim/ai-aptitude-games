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
    const fetchData = async () => {
      const [list, header] = await Promise.all([
        getNbackHistoryList(),
        getNbackHistoryHeaderData(),
      ]);
      setHistoryList(list);
      setHeaderData(header);
    };

    void fetchData();
  }, []);

  return { historyList, headerData };
};
