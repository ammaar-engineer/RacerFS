import { select, isCancel } from '@clack/prompts'

interface SelectOption {
  label: string
  action: () => Promise<void>
}

/**
 * Create interactive select menu
 */
export async function createSelectOption(
  message: string,
  options: SelectOption[]
): Promise<void> {
  const selected = await select({
    message,
    options: options.map((opt, idx) => ({
      value: idx.toString(),
      label: opt.label
    }))
  })

  // Handle Ctrl+C (force exit)
  if (isCancel(selected)) {
    console.log('\nExited from RacerFS')
    process.exit(0)
  }

  if (typeof selected === 'string') {
    const idx = parseInt(selected, 10)
    const option = options[idx]
    if (option) await option.action()
  }
}
