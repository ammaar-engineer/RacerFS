import chalk from 'chalk'
import { fileService } from '../services/file.service.js'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function progressBar(used: number, total: number, width = 30): string {
  const pct = total === 0 ? 0 : Math.min(used / total, 1)
  const filled = Math.round(pct * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return `[${bar}] ${(pct * 100).toFixed(1)}%`
}

export async function storageInfoComponent(): Promise<void> {
  const info = await fileService.getStorageInfo()

  console.log('')
  console.log(chalk.bold('Storage Info'))
  console.log(`  ${progressBar(info.used_storage, info.total_storage)}`)
  console.log(`  Used      : ${chalk.yellow(formatBytes(info.used_storage))} / ${formatBytes(info.total_storage)}`)
  console.log(`  Available : ${chalk.green(formatBytes(info.available_storage))}`)
  console.log('')
}
