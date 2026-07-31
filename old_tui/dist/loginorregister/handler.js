import { createSelectOption } from "../main_components/select.option.js";
import { loginComponent } from "./login.js";
import { registerComponent } from "./register.js";
export async function LoginOrRegisterHandler() {
    await createSelectOption("What you will do?", [
        {
            label: 'Login to RacerFS',
            action: async () => {
                await loginComponent();
            }
        },
        {
            label: 'Register to RacerFS',
            action: async () => {
                await registerComponent();
            }
        },
        {
            label: 'Back to main menu',
            action: async () => { } // Do nothing, returns to main
        }
    ]);
}
//# sourceMappingURL=handler.js.map