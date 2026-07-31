import { createSelectOption } from '../../system_services/selector.service.js'
import { checkAuthComponent } from './components/check.auth.component.js'
import { createTestAccountComponent } from './components/create.test.account.component.js'
import { viewTokenComponent } from './components/view.token.component.js'
import { clearTokenComponent } from './components/clear.token.component.js'

/**
 * Testing Handler - Development utilities
 * No auth gate - karena ini untuk testing auth sendiri
 */
export async function testingHandler(): Promise<void> {
  await createSelectOption('Testing Menu', [
    { label: 'Create Test Account', action: createTestAccountComponent },
    { label: 'Check Auth Status', action: checkAuthComponent },
    { label: 'View Saved Token', action: viewTokenComponent },
    { label: 'Clear Token (Logout)', action: clearTokenComponent },
    { label: 'Back', action: async () => {} }
  ])
}
