

export default function (Min: number, Max: number): number {
  let Range = Max - Min
  let Rand = Math.random()
  return Min + Math.round(Rand * Range)
}
