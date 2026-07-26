import { createSelectOption } from "@/main_components/select.option";
import { loginComponent } from "./login";
import { registerComponent } from "./register";

export async function LoginOrRegisterHandler() {
    await createSelectOption("What you will do?", [
        { 
            label: 'Login to RacerFS', 
            action: async () => {
                await loginComponent()
                await LoginOrRegisterHandler()
            }
        },
        { 
            label: 'Register to RacerFS', 
            action: async () => {
                await registerComponent()
                await LoginOrRegisterHandler()
            }
        },
        { 
            label: 'Back to main menu', 
            action: async () => {} // Do nothing, returns to main
        }
    ])
}