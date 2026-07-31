import { createSelectOption } from '../../system_services/selector.service.js'
import { loginComponent } from './components/login.component.js'
import { registerComponent } from './components/register.component.js'

export async function LoginOrRegisterHandler(): Promise<void> {
  await createSelectOption('Login or Register', [
    { label: 'Login', action: loginComponent },
    { label: 'Register', action: registerComponent },
    { label: 'Back', action: async () => {} }
  ])
}
