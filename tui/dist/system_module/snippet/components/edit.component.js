import { box, select, text } from '@clack/prompts';
import { snippetService } from '../services/snippet.service.js';
export async function editSnippetComponent() {
    // Fetch-first: ambil list dulu
    const snippets = await snippetService.getList();
    if (snippets.length === 0) {
        box('No snippets to edit', 'Edit Snippet', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    // Pilih snippet yang akan diedit
    const selected = await select({
        message: 'Select snippet to edit',
        options: snippets.map((s) => ({
            value: s.alias,
            label: s.alias,
            hint: s.command
        }))
    });
    if (typeof selected !== 'string')
        return;
    // Input command baru
    const current = snippets.find((s) => s.alias === selected);
    const command = await text({
        message: 'New command',
        placeholder: current?.command || '',
        validate: (value) => {
            if (!value)
                return 'Command is required';
        }
    });
    if (typeof command !== 'string')
        return;
    await snippetService.edit(selected, command);
    box(`Snippet '${selected}' updated`, 'Edit Snippet', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
    });
}
//# sourceMappingURL=edit.component.js.map