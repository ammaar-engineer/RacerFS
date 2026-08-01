import { select } from '@clack/prompts';
import chalk from 'chalk';
import { snippetService } from '../services/snippet.service.js';
export async function deleteSnippetComponent() {
    // Fetch-first: ambil list dulu
    const snippets = await snippetService.getList();
    if (snippets.length === 0) {
        console.log(chalk.yellow('No snippets to delete'));
        return;
    }
    // Pilih snippet yang akan dihapus
    const selected = await select({
        message: 'Select snippet to delete',
        options: snippets.map((s) => ({
            value: s.alias,
            label: s.alias,
            hint: s.command
        }))
    });
    if (typeof selected !== 'string')
        return;
    // Confirm sebelum hapus
    const confirm = await select({
        message: `Delete snippet '${selected}'?`,
        options: [
            { value: 'yes', label: 'Yes, delete it' },
            { value: 'no', label: 'No, cancel' }
        ]
    });
    if (confirm !== 'yes')
        return;
    await snippetService.delete(selected);
    console.log(chalk.green(`✓ Snippet '${selected}' deleted`));
}
//# sourceMappingURL=delete.component.js.map