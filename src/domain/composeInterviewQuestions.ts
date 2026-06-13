import type { JobFamily, QuestionMaterial } from './report';
import {
  GENERIC_QUESTION_BANK,
  type InterviewPromptQuestion,
} from '../data/interview/genericQuestionBank';

export type { InterviewPromptQuestion };

const TOTAL_QUESTIONS = 8;
const MAX_POSTING_QUESTIONS = 3;
const MAX_RESUME_QUESTIONS = 3;

function materialToQuestion(
  material: QuestionMaterial,
  source: 'job_posting' | 'resume',
): InterviewPromptQuestion {
  return {
    id: material.question_id,
    category: material.category,
    text: material.text,
    limitSeconds: 90,
    hint: material.why,
    source,
  };
}

export function composeInterviewQuestions({
  jobFamily,
  postingMaterials,
  resumeMaterials,
}: {
  jobFamily: JobFamily;
  postingMaterials?: QuestionMaterial[] | null;
  resumeMaterials?: QuestionMaterial[] | null;
}): InterviewPromptQuestion[] {
  const bank = GENERIC_QUESTION_BANK[jobFamily];

  // Slot 0: always the generic opening question
  const opening = bank[0];
  const result: InterviewPromptQuestion[] = [opening];
  const usedCategories = new Set<string>([opening.category]);

  // Slots 1–3: posting-derived (up to 3)
  const postingSlice = (postingMaterials ?? []).slice(0, MAX_POSTING_QUESTIONS);
  for (const material of postingSlice) {
    result.push(materialToQuestion(material, 'job_posting'));
    usedCategories.add(material.category);
  }

  // Fill remaining slots with resume-derived (up to 3), respecting the 8-question total
  // but leaving at least 1 slot for the closing value question.
  const resumeSlice = (resumeMaterials ?? []).slice(0, MAX_RESUME_QUESTIONS);
  for (const material of resumeSlice) {
    if (result.length >= TOTAL_QUESTIONS - 1) break;
    result.push(materialToQuestion(material, 'resume'));
    usedCategories.add(material.category);
  }

  // Find the closing (가치) generic question — always the last slot
  const closingQuestion = bank[bank.length - 1]; // SHARED_VALUE

  // Fill remaining slots from generic bank, avoiding category duplicates where possible.
  // Skip index 0 (opening, already added) and the last (closing, reserved).
  const genericCandidates = bank.slice(1, bank.length - 1);

  // Two passes: first prefer non-duplicate categories, then allow duplicates
  const nonDuplicates = genericCandidates.filter((q) => !usedCategories.has(q.category));
  const duplicates = genericCandidates.filter((q) => usedCategories.has(q.category));
  const fillCandidates = [...nonDuplicates, ...duplicates];

  const usedIds = new Set(result.map((q) => q.id));
  for (const candidate of fillCandidates) {
    if (result.length >= TOTAL_QUESTIONS - 1) break;
    if (usedIds.has(candidate.id)) continue;
    result.push(candidate);
    usedIds.add(candidate.id);
    usedCategories.add(candidate.category);
  }

  // Append the closing value question (always last)
  if (!usedIds.has(closingQuestion.id)) {
    result.push(closingQuestion);
  } else {
    // closing already present from materials — find a different non-used generic for padding
    for (const candidate of fillCandidates) {
      if (result.length >= TOTAL_QUESTIONS) break;
      if (usedIds.has(candidate.id)) continue;
      result.push(candidate);
      usedIds.add(candidate.id);
    }
  }

  // Guarantee exactly 8 — if still short (edge case: bank exhausted), cycle bank from index 1
  let cycleIdx = 1;
  while (result.length < TOTAL_QUESTIONS) {
    const candidate = bank[cycleIdx % bank.length];
    result.push({ ...candidate, id: `${candidate.id}-fill-${result.length}` });
    cycleIdx++;
  }

  return result.slice(0, TOTAL_QUESTIONS);
}
