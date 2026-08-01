import { select } from '@clack/prompts';
import chalk from 'chalk';
import { fileService } from '../services/file.service.js';
export async function deleteFileComponent() {
    // Fetch-first
    const files = await fileService.getList();
    if (files.length === 0) {
        console.log(chalk.yellow('No files to delete'));
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
    console.log(chalk.green(`✓ File '${selected}' deleted`));
}
//# sourceMappingURL=delete.component.js.map