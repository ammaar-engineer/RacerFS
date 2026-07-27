import { fileServices } from "../services/file.services"
import { select, text } from "@clack/prompts"
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

export async function renameFile() {
  const files = await fileServices.getFileList()

  if (files.length === 0) {
    console.log(chalk.yellow("\nNo files to rename\n"))
    return
  }

  const selectedName = await select({
    message: "Select file to rename",
    options: files.map(f => ({
      value: f.name,
      label: f.name,
      hint: formatBytes(f.size)
    }))
  }) as string

  if (!selectedName) {
    console.log(chalk.dim("\nRename cancelled\n"))
    return
  }

  const newName = await text({
    message: "Enter new file name",
    placeholder: selectedName
  }) as string

  if (!newName || newName.trim().length === 0) {
    console.log(chalk.red("\nFile name cannot be empty\n"))
    return
  }

  try {
    await fileServices.renameFile(selectedName, newName.trim())
    console.log(chalk.green(`\n✓ File renamed from '${selectedName}' to '${newName.trim()}'\n`))
  } catch (error) {
    console.log(chalk.red("\n✗ Rename failed\n"))
  }
}
