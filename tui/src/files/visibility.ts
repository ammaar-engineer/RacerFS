import { fileServices } from "../services/file.services"
import { select } from "@clack/prompts"
import chalk from "chalk"

export async function setVisibility() {
  const files = await fileServices.getFileList()

  if (files.length === 0) {
    console.log(chalk.yellow("\nNo files available\n"))
    return
  }

  const selectedName = await select({
    message: "Select file to change visibility",
    options: files.map(f => ({
      value: f.name,
      label: f.name,
      hint: `Currently: ${f.is_public ? 'Public' : 'Private'}`
    }))
  }) as string

  if (!selectedName) {
    console.log(chalk.dim("\nVisibility change cancelled\n"))
    return
  }

  const currentFile = files.find(f => f.name === selectedName)!

  const newVisibility = await select({
    message: `Change visibility for '${selectedName}'`,
    options: [
      { 
        value: 'public', 
        label: 'Public', 
        hint: currentFile.is_public ? '(current)' : 'Anyone can access'
      },
      { 
        value: 'private', 
        label: 'Private', 
        hint: !currentFile.is_public ? '(current)' : 'Only you can access'
      }
    ]
  }) as string

  if (!newVisibility) {
    console.log(chalk.dim("\nVisibility change cancelled\n"))
    return
  }

  const isPublic = newVisibility === 'public'

  if (isPublic === currentFile.is_public) {
    console.log(chalk.dim("\nNo change needed\n"))
    return
  }

  try {
    await fileServices.setFileVisibility(selectedName, isPublic)
    console.log(chalk.green(`\n✓ File '${selectedName}' is now ${isPublic ? 'public' : 'private'}\n`))
  } catch (error) {
    console.log(chalk.red("\n✗ Visibility change failed\n"))
  }
}
