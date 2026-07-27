import { fileServices } from "../services/file.services"
import { box } from "@clack/prompts"
import chalk from "chalk"

function formatBytes(bytes: number): string {
  const kb = bytes / 1024
  const mb = kb / 1024
  const gb = mb / 1024

  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`
  } else if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  } else if (kb >= 1) {
    return `${kb.toFixed(2)} KB`
  } else {
    return `${bytes} bytes`
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export async function listFiles() {
  const files = await fileServices.getFileList()

  if (files.length === 0) {
    console.log(chalk.yellow("\nNo files found. Upload one to get started!"))
    return
  }

  box(`Your Files (${files.length} total)`, "Files")

  files.forEach((file, idx) => {
    console.log(`\n${chalk.bold(`${idx + 1}. ${chalk.cyan(file.name)}`)}`)
    console.log(`   Size: ${formatBytes(file.size)}`)
    console.log(`   Visibility: ${file.is_public ? chalk.green('Public') : chalk.yellow('Private')}`)
    console.log(`   Uploaded: ${chalk.dim(formatDate(file.uploaded_at))}`)
  })

  console.log("")
}
