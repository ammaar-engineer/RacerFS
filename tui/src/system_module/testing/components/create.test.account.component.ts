import { text } from '@clack/prompts'
import chalk from 'chalk'
import { testingService } from '../services/testing.service.js'

/**
 * Create test account via backend API (development only)
 */
export async function createTestAccountComponent(): Promise<void> {
  const email = await text({
    message: 'Test Account Email',
    placeholder: 'test@example.com',
    validate: (value) => {
      if (!value) return 'Email is required'
      if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format'
    }
  })

  if (typeof email !== 'string') return

  const token = await testingService.createTestAccount(email)
  testingService.saveToken(token)

  console.log(chalk.green('✓ Test account created and token saved'))
  console.log(chalk.dim(`  Email: ${email}`))
}
