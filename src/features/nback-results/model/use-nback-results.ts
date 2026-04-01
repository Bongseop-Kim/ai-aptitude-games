import {
  generateSessionFeedback,
  getStagesBySessionId,
  type SessionFeedback,
} from "@/entities/nback";
import { useEffect, useState } from "react";

export const useNbackResults = (sessionId: number) => {
  const [sessionFeedback, setSessionFeedback] = useState<
    SessionFeedback | undefined
  >();

  useEffect(() => {
    const fetchStages = async () => {
      const stages = await getStagesBySessionId(sessionId);
      setSessionFeedback(generateSessionFeedback(stages));
    };

    void fetchStages();
  }, [sessionId]);

  return { sessionFeedback };
};
