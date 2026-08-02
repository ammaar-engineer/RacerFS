import { box } from '@clack/prompts';
import { validation } from '../../../system_validations/fs.validation.js';
import { fsService } from '../../../system_services/fs.service.js';
/**
 * Check if user is authenticated
 */
export async function checkAuthComponent() {
    const isAuth = validation.isUserAuthenticated();
    if (isAuth) {
        const userData = fsService.readUserData();
        box(`Authenticated\nToken: ${userData?.account_token.substring(0, 20)}...`, 'Auth Status', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
    }
    else {
        box('Not authenticated\nNo token found in ~/.racerfs/user.rcfs', 'Auth Status', {
            rounded: true,
            width: 'auto',
            contentAlign: 'center',
            contentPadding: 4
        });
    }
}
//# sourceMappingURL=check.auth.component.js.map