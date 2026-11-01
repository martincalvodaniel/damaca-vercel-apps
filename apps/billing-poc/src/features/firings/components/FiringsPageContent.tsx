"use client"
import { CommissionScope } from "@/features/commissions/components/CommissionScope"
import CommissionsPageContent from "@/features/commissions/components/CommissionsPageContent"
export default function FiringsPageContent() {
  return (
    <CommissionScope value="firings">
      <CommissionsPageContent />
    </CommissionScope>
  )
}
