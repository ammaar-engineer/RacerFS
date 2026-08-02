import { box } from '@clack/prompts';
import chalk from 'chalk';
import { accessTokenService } from '../services/access-token.service.js';
export async function listAccessTokenComponent() {
    console.log(chalk.dim('→ Fetching access tokens...'));
    const tokens = await accessTokenService.list();
    if (tokens.length === 0) {
        box('No access tokens found', 'Access Tokens', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    const content = tokens.map((token, idx) => `${idx + 1}. ${token.substring(0, 50)}...`).join('\n');
    box(content, `Access Tokens (${tokens.length})`, {
        rounded: true,
        width: 'auto',
        contentAlign: 'left',
        contentPadding: 2
    });
}
//# sourceMappingURL=list.component.js.map