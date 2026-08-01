import { createSelectOption } from '../../system_services/selector.service.js'
import { validation } from '../../system_validations/fs.validation.js'
import { deleteFileComponent } from './components/delete.component.js'
import { downloadFileComponent } from './components/download.component.js'
import { listFileComponent } from './components/list.component.js'
import { renameFileComponent } from './components/rename.component.js'
import { storageInfoComponent } from './components/storage.component.js'
import { uploadFileComponent } from './components/upload.component.js'
import { visibilityFileComponent } from './components/visibility.component.js'

export async function FilesHandler(): Promise<void> {
  if (!validation.isUserAuthenticated()) {
    console.log('Please login first')
    return
  }

  await createSelectOption('Manage Files', [
    { label: 'List Files', action: listFileComponent },
    { label: 'Upload File', action: uploadFileComponent },
    { label: 'Download File', action: downloadFileComponent },
    { label: 'Rename File', action: renameFileComponent },
    { label: 'Delete File', action: deleteFileComponent },
    { label: 'Set Visibility', action: visibilityFileComponent },
    { label: 'Storage Info', action: storageInfoComponent },
    { label: 'Back', action: async () => {} }
  ])
}
