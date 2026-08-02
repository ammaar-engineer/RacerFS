import { box, select } from '@clack/prompts';
import { fsService } from '../../../system_services/fs.service.js';
/**
 * Clear saved token (manual logout)
 */
export async function clearTokenComponent() {
    if (!fsService.userFileExists()) {
        box('No token to clear', 'Clear Token', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
        return;
    }
    const confirm = await select({
        message: 'Clear saved token?',
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
        ]
    });
    if (confirm === 'yes') {
        fsService.deleteUserData();
        box('Token cleared', 'Clear Token', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
    }
}
//# sourceMappingURL=clear.token.component.js.map