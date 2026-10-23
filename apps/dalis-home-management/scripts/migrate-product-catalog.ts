import { migrateProductCatalogReferences } from "@/lib/catalog/product-catalog-migration"
import { closeDatabaseConnection } from "@/lib/db/client"
import { createMongoProductCatalogMigrationStore } from "@/lib/db/product-catalog-migration"

async function main(): Promise<void> {
  const report = await migrateProductCatalogReferences(
    createMongoProductCatalogMigrationStore()
  )

  console.log(JSON.stringify(report, null, 2))
  if (report.issues.length > 0) {
    process.exitCode = 2
  }
}

main()
  .finally(closeDatabaseConnection)
  .catch((error: unknown) => {
    console.error(`Product catalog migration failed: ${String(error)}`)
    process.exitCode = 1
  })
