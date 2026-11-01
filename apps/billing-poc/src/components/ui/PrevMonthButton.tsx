import NavButton from "./NavButton"

export default function PrevMonthButton({ onClick }: { onClick: () => void }) {
  return (
    <NavButton onClick={onClick} aria-label="Ver mes anterior">
      ←
    </NavButton>
  )
}
