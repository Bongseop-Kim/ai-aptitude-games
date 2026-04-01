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
    let isMounted = true;

    const fetchStages = async () => {
      try {
        const stages = await getStagesBySessionId(sessionId);
        if (isMounted) {
          setSessionFeedback(generateSessionFeedback(stages));
        }
      } catch (error) {
        console.error("Failed to fetch nback results:", error);
        if (isMounted) {
          setSessionFeedback(undefined);
        }
      }
    };

    void fetchStages();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return { sessionFeedback };
};