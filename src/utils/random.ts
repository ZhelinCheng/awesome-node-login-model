

export default function (Min: number, Max: number): number {
  const Range = Max - Min
  const Rand = Math.random()
  return Min + Math.round(Rand * Range)
}
