import { validation } from '../../system_validations/fs.validation.js';
import { createSelectOption } from '../../system_services/selector.service.js';
import { listSnippetComponent } from './components/list.component.js';
import { createSnippetComponent } from './components/create.component.js';
import { editSnippetComponent } from './components/edit.component.js';
import { deleteSnippetComponent } from './components/delete.component.js';
export async function SnippetsHandler() {
    if (!validation.isUserAuthenticated()) {
        console.log('Please login first');
        return;
    }
    await createSelectOption('Manage Snippets', [
        { label: 'List Snippets', action: listSnippetComponent },
        { label: 'Create Snippet', action: createSnippetComponent },
        { label: 'Edit Snippet', action: editSnippetComponent },
        { label: 'Delete Snippet', action: deleteSnippetComponent },
        { label: 'Back', action: async () => { } }
    ]);
}
//# sourceMappingURL=handler.js.map