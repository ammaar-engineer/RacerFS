import { select } from '@clack/prompts';
import chalk from 'chalk';
import { fileService } from '../services/file.service.js';
export async function visibilityFileComponent() {
    // Fetch-first
    const files = await fileService.getList();
    if (files.length === 0) {
        console.log(chalk.yellow('No files found'));
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
    console.log(chalk.green(`✓ '${selected}' is now ${newVisibility ? 'public' : 'private'}`));
}
//# sourceMappingURL=visibility.component.js.map