export const PRIZE_MONEY: Record<number, number> = {
  1: 140000000,
  2: 131000000,
  3: 122000000,
  4: 113000000,
  5: 104000000,
  6: 95000000,
  7: 86000000,
  8: 77000000,
  9: 68000000,
  10: 59000000,
  11: 60000000,
}

export function getPrizeMoney(rank: number): number {
  return PRIZE_MONEY[rank] || 50000000
}

export const POINTS_TABLE: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
}

export const SPRINT_POINTS_TABLE: Record<number, number> = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
}

export function getPoints(position: number, isSprint = false): number {
  const table = isSprint ? SPRINT_POINTS_TABLE : POINTS_TABLE
  return table[position] || 0
}