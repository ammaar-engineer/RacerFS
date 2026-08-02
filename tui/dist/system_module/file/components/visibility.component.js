import { box, select } from '@clack/prompts';
import { fileService } from '../services/file.service.js';
export async function visibilityFileComponent() {
    // Fetch-first
    const files = await fileService.getList();
    if (files.length === 0) {
        box('No files found', 'Visibility', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    const selected = await select({
        message: 'Select file to change visibility',
        options: files.map((f) => ({
            value: f.name,
            label: f.name,
            hint: f.is_public ? 'public' : 'private'
        }))
    });
    if (typeof selected !== 'string')
        return;
    const current = files.find((f) => f.name === selected);
    const newVisibility = !current?.is_public;
    const confirm = await select({
        message: `Set '${selected}' to ${newVisibility ? 'public' : 'private'}?`,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No, cancel' }
        ]
    });
    if (confirm !== 'yes')
        return;
    await fileService.setVisibility(selected, newVisibility);
    box(`'${selected}' is now ${newVisibility ? 'public' : 'private'}`, 'Visibility', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
    });
}
//# sourceMappingURL=visibility.component.js.map