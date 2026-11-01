import { createCommissionRoutes } from "@/features/commissions/server/routes"
export const {
  GET,
  POST,
  PUT,
  DELETE,
  getCommission,
  generatePayment,
  getByPayment,
} = createCommissionRoutes("firings")
