import { box, text } from '@clack/prompts';
import chalk from 'chalk';
import { authService } from '../services/auth.service.js';
export async function registerComponent() {
    // Step 1: Input email
    const email = await text({
        message: 'Email',
        placeholder: 'user@example.com',
        validate: (value) => {
            if (!value)
                return 'Email is required';
            if (!/\S+@\S+\.\S+/.test(value))
                return 'Invalid email format';
        }
    });
    if (typeof email !== 'string')
        return;
    // Step 2: Request OTP
    const sessionId = await authService.requestRegisterOTP(email);
    console.log(chalk.blue('→ OTP sent to your email'));
    // Step 3: Input OTP
    const otp = await text({
        message: 'OTP Code',
        placeholder: '123456',
        validate: (value) => {
            if (!value)
                return 'OTP is required';
            if (!/^\d{6}$/.test(value))
                return 'OTP must be 6 digits';
        }
    });
    if (typeof otp !== 'string')
        return;
    // Step 4: Verify OTP and save token
    const token = await authService.verifyOTP(sessionId, otp);
    authService.saveToken(token);
    box(`Email: ${email}`, "Registration success", {
        contentAlign: 'center',
        width: 'auto',
        rounded: true,
        contentPadding: 4
    });
}
//# sourceMappingURL=register.component.js.map