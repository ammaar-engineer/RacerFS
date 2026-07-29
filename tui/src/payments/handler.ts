import chalk from "chalk"
import { createSelectOption } from "../main_components/select.option.js"
import { paymentServices } from "../services/payment.services.js"

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`
}

export async function paymentsHandler() {
  const info = await paymentServices.getStorageInfo()
  console.log(info)
  const used = formatBytes(Number(info.used_storage))
  const total = formatBytes(Number(info.total_storage))
  const available = formatBytes(Number(info.available_storage))
    
  console.log(chalk.dim(`  Used      : ${used}`))
  console.log(chalk.dim(`  Available : ${available}`))
  console.log(chalk.dim(`  Total     : ${total}\n`))

  await createSelectOption("Storage Management", [
    {
      label: 'Buy Storage (+100MB)',
      action: async () => {
        await paymentServices.buyStorage()
        console.log(chalk.green("\n✓ Storage +100MB added successfully!\n"))
      }
    },
    {
      label: 'Back to main menu',
      action: async () => {} // Do nothing, returns to main
    }
  ])
}
