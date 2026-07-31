import { fileServices } from "../services/file.services.js"
import { select, text } from "@clack/prompts"
import chalk from "chalk"
import * as path from "path"

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

export async function downloadFile() {
  const files = await fileServices.getFileList()

  if (files.length === 0) {
    console.log(chalk.yellow("\nNo files to download\n"))
    return
  }

  const selectedName = await select({
    message: "Select file to download",
    options: files.map(f => ({
      value: f.name,
      label: f.name,
      hint: formatBytes(f.size)
    }))
  }) as string

  if (!selectedName) {
    console.log(chalk.dim("\nDownload cancelled\n"))
    return
  }

  // Optional: rename on save
  const localFileName = await text({
    message: "Save as (press Enter to keep original name)",
    placeholder: selectedName
  }) as string

  const finalName = (localFileName && localFileName.trim()) ? localFileName.trim() : selectedName
  const savePath = path.join(process.cwd(), finalName)

  console.log(chalk.dim("\nDownloading..."))
  
  try {
    await fileServices.downloadFile(selectedName, savePath)
    console.log(chalk.green(`\n✓ File downloaded to: ${savePath}\n`))
  } catch (error) {
    console.log(chalk.red("\n✗ Download failed\n"))
  }
}
