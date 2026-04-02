import { Offset, Tier } from "./rule-types";
import { PerformancePattern } from "./template-types";

export type SessionFeedback = {
    headline: string;
    summaryLines: string[];
    highlights: string[]; // strengths + weaknesses
    tip: string;
    debug: {
        overallTier: Tier;
        avgRtMs: number | null;
        bestOffset?: Offset;
        weakOffset?: Offset;
        pattern?: PerformancePattern;
    };
};
