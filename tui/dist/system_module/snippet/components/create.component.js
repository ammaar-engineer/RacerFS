import { box, text } from '@clack/prompts';
import { snippetService } from '../services/snippet.service.js';
export async function createSnippetComponent() {
    const alias = await text({
        message: 'Alias',
        placeholder: 'gs',
        validate: (value) => {
            if (!value)
                return 'Alias is required';
            if (/\s/.test(value))
                return 'Alias cannot contain spaces';
        }
    });
    if (typeof alias !== 'string')
        return;
    const command = await text({
        message: 'Command',
        placeholder: 'git status',
        validate: (value) => {
            if (!value)
                return 'Command is required';
        }
    });
    if (typeof command !== 'string')
        return;
    const description = await text({
        message: 'Description (optional)',
        placeholder: 'Shows git status'
    });
    if (typeof description !== 'string')
        return;
    await snippetService.create(alias, command, description || undefined);
    box(`Snippet '${alias}' created`, 'Snippet', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
    });
}
//# sourceMappingURL=create.component.js.map