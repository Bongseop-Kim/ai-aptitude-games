export const getAbandonedTrialIndex = ({
  hasStarted,
  latestQuestionIndex,
}: {
  hasStarted: boolean;
  latestQuestionIndex: number | null;
}) => {
  if (!hasStarted || latestQuestionIndex == null || latestQuestionIndex <= 0) {
    return null;
  }

  return latestQuestionIndex;
};
