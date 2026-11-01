import BinaryToggle, { type BinaryToggleValue } from "./BinaryToggle"

export default function ChartsToggle({
  showCharts,
  onToggle,
}: {
  showCharts: boolean
  onToggle: (show: boolean) => void
}) {
  const handleChange = (value: BinaryToggleValue) => {
    onToggle(value === "left")
  }

  return (
    <BinaryToggle
      value={showCharts ? "left" : "right"}
      leftLabel="Mostrar"
      rightLabel="Ocultar"
      ariaLabel="Mostrar u ocultar gráficos"
      onChange={handleChange}
      leading="📊"
    />
  )
}
