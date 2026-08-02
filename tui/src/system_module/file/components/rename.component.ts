import { box, select, text } from '@clack/prompts'
import { fileService } from '../services/file.service.js'

export async function renameFileComponent(): Promise<void> {
  // Fetch-first
  const files = await fileService.getList()

  if (files.length === 0) {
    box('No files to rename', 'Rename', {
      rounded: true,
      width: 'auto',
      contentAlign: 'center',
      contentPadding: 4
    })
    return
  }

  const selected = await select({
    message: 'Select file to rename',
    options: files.map((f) => ({
      value: f.name,
      label: f.name,
      hint: f.file_type
    }))
  })
  if (typeof selected !== 'string') return

  const newName = await text({
    message: 'New name',
    placeholder: selected,
    validate: (value) => {
      if (!value) return 'Name is required'
      if (value === selected) return 'New name must be different'
    }
  })
  if (typeof newName !== 'string') return

  await fileService.rename(selected, newName)
  box(`'${selected}' renamed to '${newName}'`, 'Rename', {
    rounded: true,
    width: 'auto',
    contentAlign: 'center',
    contentPadding: 4
  })
}
