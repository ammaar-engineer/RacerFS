import { validation } from '../../system_validations/fs.validation.js'
import { createSelectOption } from '../../system_services/selector.service.js'
import { createAccessTokenComponent } from './components/create.component.js'
import { listAccessTokenComponent } from './components/list.component.js'
import { deleteAccessTokenComponent } from './components/delete.component.js'
import { viewPublicFilesComponent } from './components/view-public-files.component.js'
import { downloadPublicComponent } from './components/download-public.component.js'

export async function AccessTokenHandler(): Promise<void> {
  if (!validation.isUserAuthenticated()) {
    console.log('Please login first')
    return
  }

  await createSelectOption('Manage Access Tokens', [
    { label: 'Create Access Token', action: createAccessTokenComponent },
    { label: 'List My Tokens', action: listAccessTokenComponent },
    { label: 'Delete Access Token', action: deleteAccessTokenComponent },
    { label: 'View Public Files', action: viewPublicFilesComponent },
    { label: 'Download Public File', action: downloadPublicComponent },
    { label: 'Back', action: async () => {} }
  ])
}
