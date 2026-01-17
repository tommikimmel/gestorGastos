export function formatAmount(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return "0"

  return number.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
