import { box, select } from '@clack/prompts';
import { fileService } from '../services/file.service.js';
export async function deleteFileComponent() {
    // Fetch-first
    const files = await fileService.getList();
    if (files.length === 0) {
        box('No files to delete', 'Delete', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    const selected = await select({
        message: 'Select file to delete',
        options: files.map((f) => ({
            value: f.name,
            label: f.name,
            hint: f.file_type
        }))
    });
    if (typeof selected !== 'string')
        return;
    // Confirm
    const confirm = await select({
        message: `Delete '${selected}'?`,
        options: [
            { value: 'yes', label: 'Yes, delete it' },
            { value: 'no', label: 'No, cancel' }
        ]
    });
    if (confirm !== 'yes')
        return;
    await fileService.delete(selected);
    box(`File '${selected}' deleted`, 'Delete', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
    });
}
//# sourceMappingURL=delete.component.js.map