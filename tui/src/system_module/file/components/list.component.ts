import { box } from '@clack/prompts'
import { fileService } from '../services/file.service.js'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export async function listFileComponent(): Promise<void> {
  const files = await fileService.getList()

  if (files.length === 0) {
    box('No files found', 'Files', {
      rounded: true,
      width: 'auto',
      contentAlign: 'center',
      contentPadding: 4
    })
    return
  }

  const content = files.map((f) => {
    const visibility = f.is_public ? 'public ' : 'private'
    const size = formatBytes(f.size).padStart(10)
    return `${visibility}  ${size}  ${f.name}`
  }).join('\n')

  box(content, `Files (${files.length})`, {
    rounded: true,
    width: 'auto',
    contentAlign: 'left',
    contentPadding: 2
  })
}
