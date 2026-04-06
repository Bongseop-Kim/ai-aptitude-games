export type StepFinalizationLock = {
  current: boolean;
};

export const tryLockStepFinalization = (lock: StepFinalizationLock) => {
  if (lock.current) {
    return false;
  }

  lock.current = true;
  return true;
};

export const resetStepFinalizationLock = (lock: StepFinalizationLock) => {
  lock.current = false;
};
