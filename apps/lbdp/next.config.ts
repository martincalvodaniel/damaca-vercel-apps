import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  logging: {
    incomingRequests: {
      // Redsys includes signed payment fields in the browser return query.
      ignore: [/^\/pruebas\/pago\/retorno\/?(?:\?|$)/],
    },
  },
}

export default nextConfig
