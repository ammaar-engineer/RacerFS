import { select } from '@clack/prompts';
import chalk from 'chalk';
import { accessTokenService } from '../services/access-token.service.js';
export async function deleteAccessTokenComponent() {
    // Fetch-first: sync dari backend dulu
    console.log(chalk.dim('→ Fetching tokens...'));
    const tokens = await accessTokenService.list();
    if (tokens.length === 0) {
        console.log(chalk.yellow('No access tokens available'));
        return;
    }
    const selected = await select({
        message: 'Select token to delete',
        options: tokens.map((token, idx) => ({
            value: token,
            label: `Token ${idx + 1}`,
            hint: token.substring(0, 30) + '...'
        }))
    });
    if (typeof selected !== 'string')
        return;
    console.log(chalk.dim('→ Deleting access token...'));
    await accessTokenService.delete(selected);
    console.log(chalk.green('✓ Access token deleted successfully'));
}
//# sourceMappingURL=delete.component.js.map