import { box, text } from '@clack/prompts'
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

  box(`Email: ${email}`, "Test account", {
    rounded: true,
    width: 'auto',
    contentAlign: 'center',
    contentPadding: 4
  })
}
