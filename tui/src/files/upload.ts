import { select, text } from "@clack/prompts"
import chalk from "chalk"
import * as fs from "fs"
import * as path from "path"
import { fileServices } from "../services/file.services"

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

export async function uploadFile() {
  // List files in current directory
  const cwd = process.cwd()
  let localFiles: string[] = []
  
  try {
    localFiles = fs.readdirSync(cwd).filter(f => {
      try {
        return fs.statSync(path.join(cwd, f)).isFile()
      } catch {
        return false
      }
    })
  } catch (error) {
    console.log(chalk.red("\nError reading current directory"))
    return
  }
  
  if (localFiles.length === 0) {
    console.log(chalk.yellow("\nNo files found in current directory"))
    return
  }

  const selectedFile = await select({
    message: "Select file to upload",
    options: localFiles.map(f => {
      const stats = fs.statSync(path.join(cwd, f))
      return {
        value: f,
        label: f,
        hint: `${formatBytes(stats.size)}`
      }
    })
  }) as string

  if (!selectedFile) {
    console.log(chalk.dim("\nUpload cancelled\n"))
    return
  }

  const localFilePath = path.join(cwd, selectedFile)
  
  // Optional: rename on server
  const serverFileName = await text({
    message: "Server file name (press Enter to keep original)",
    placeholder: selectedFile
  }) as string

  const finalName = (serverFileName && serverFileName.trim()) ? serverFileName.trim() : selectedFile

  console.log(chalk.dim("\nUploading..."))
  
  try {
    await fileServices.uploadFile(localFilePath, finalName)
    console.log(chalk.green(`\n✓ File '${finalName}' uploaded successfully\n`))
  } catch (error) {
    console.log(chalk.red("\n✗ Upload failed\n"))
  }
}
