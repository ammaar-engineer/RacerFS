import { box, select } from '@clack/prompts';
import { snippetService } from '../services/snippet.service.js';
export async function deleteSnippetComponent() {
    // Fetch-first: ambil list dulu
    const snippets = await snippetService.getList();
    if (snippets.length === 0) {
        box('No snippets to delete', 'Delete Snippet', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
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
    box(`Snippet '${selected}' deleted`, 'Delete Snippet', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
    });
}
//# sourceMappingURL=delete.component.js.map