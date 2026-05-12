import { getGuardianStage, getStageLevel } from "@/lib/guardianStages";

export interface CharacterProgress {
  level: number;
  title: string;
  currentXp: number;
  requiredXp: number;
  claimedRewardIds: string[];
}

export interface XpGrantResult {
  previous: CharacterProgress;
  progress: CharacterProgress;
  xpAdded: number;
  didLevelUp: boolean;
  duplicated: boolean;
}

const KEY = "spotlight_character_progress";

export const DEFAULT_CHARACTER_PROGRESS: CharacterProgress = {
  level: 7,
  title: "공연 탐험가",
  currentXp: 350,
  requiredXp: 500,
  claimedRewardIds: [],
};

function titleForLevel(level: number): string {
  return getGuardianStage(getStageLevel(level)).name;
}

function normalizeProgress(value: Partial<CharacterProgress> | null): CharacterProgress {
  const level = Math.max(1, Math.floor(Number(value?.level) || DEFAULT_CHARACTER_PROGRESS.level));
  const requiredXp = Math.max(1, Math.floor(Number(value?.requiredXp) || DEFAULT_CHARACTER_PROGRESS.requiredXp));
  const currentXp = Math.max(0, Math.floor(Number(value?.currentXp) || 0));
  const claimedRewardIds = Array.isArray(value?.claimedRewardIds)
    ? value.claimedRewardIds.filter((id): id is string => typeof id === "string")
    : [];

  return {
    level,
    title: typeof value?.title === "string" && value.title
      ? value.title
      : titleForLevel(level),
    currentXp: Math.min(currentXp, requiredXp - 1),
    requiredXp,
    claimedRewardIds: Array.from(new Set(claimedRewardIds)),
  };
}

export function getCharacterProgress(): CharacterProgress {
  if (typeof window === "undefined") {
    return { ...DEFAULT_CHARACTER_PROGRESS, claimedRewardIds: [] };
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    return raw
      ? normalizeProgress(JSON.parse(raw) as Partial<CharacterProgress>)
      : { ...DEFAULT_CHARACTER_PROGRESS, claimedRewardIds: [] };
  } catch {
    return { ...DEFAULT_CHARACTER_PROGRESS, claimedRewardIds: [] };
  }
}

export function saveCharacterProgress(progress: CharacterProgress): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeProgress(progress);
  window.localStorage.setItem(KEY, JSON.stringify(normalized));
  window.dispatchEvent(
    new CustomEvent<CharacterProgress>("spotlight-character-progress", {
      detail: normalized,
    })
  );
}

export function getCharacterImageSrc(level: number): string {
  return `/characters/level-${getStageLevel(level)}.png`;
}

export function grantCharacterXp(xp: number, rewardId: string): XpGrantResult {
  const previous = getCharacterProgress();
  if (previous.claimedRewardIds.includes(rewardId)) {
    return {
      previous,
      progress: previous,
      xpAdded: 0,
      didLevelUp: false,
      duplicated: true,
    };
  }

  let level = previous.level;
  let currentXp = previous.currentXp + Math.max(0, Math.floor(xp));
  let requiredXp = previous.requiredXp;
  let didLevelUp = false;

  while (currentXp >= requiredXp) {
    currentXp -= requiredXp;
    level += 1;
    requiredXp = Math.max(requiredXp + 1, Math.floor(requiredXp * 1.2));
    didLevelUp = true;
  }

  const progress = normalizeProgress({
    ...previous,
    level,
    title: titleForLevel(level),
    currentXp,
    requiredXp,
    claimedRewardIds: [...previous.claimedRewardIds, rewardId],
  });

  saveCharacterProgress(progress);

  return {
    previous,
    progress,
    xpAdded: Math.max(0, Math.floor(xp)),
    didLevelUp,
    duplicated: false,
  };
}
