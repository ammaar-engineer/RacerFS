import chalk from 'chalk';
import { validation } from '../../../system_validations/fs.validation.js';
import { fsService } from '../../../system_services/fs.service.js';
/**
 * Check if user is authenticated
 */
export async function checkAuthComponent() {
    const isAuth = validation.isUserAuthenticated();
    if (isAuth) {
        const userData = fsService.readUserData();
        console.log(chalk.green('✓ User is authenticated'));
        console.log(chalk.dim(`  Token: ${userData?.account_token.substring(0, 20)}...`));
    }
    else {
        console.log(chalk.red('✗ User is NOT authenticated'));
        console.log(chalk.dim('  No token found in ~/.racerfs/user.rcfs'));
    }
}
//# sourceMappingURL=check.auth.component.js.map