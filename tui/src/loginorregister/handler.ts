import { select } from "@clack/prompts";
import { loginComponent } from "./login";
import { registerComponent } from "./register";

export async function LoginOrRegisterHandler() {
    const selected = await select({
    message: "What you will do?",
    options: [
        {value: 'login', label: 'Login to RacerFS', hint: "Login now"},
        {value: 'register', label: 'Register to RacerFS', hint: "Register now"}        
    ]
})
    const options = {
        'login': loginComponent,
        'register': registerComponent
    }
    await (options as any)[selected]()
}