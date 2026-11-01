import NavButton from "./NavButton"

export default function NextMonthButton({ onClick }: { onClick: () => void }) {
  return (
    <NavButton onClick={onClick} aria-label="Ver mes siguiente">
      →
    </NavButton>
  )
}
