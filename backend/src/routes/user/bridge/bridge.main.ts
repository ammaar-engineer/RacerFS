import { Injectable } from "@nestjs/common";
import { UserDbModules } from "../db.main";
import { JwtService } from "src/global_bridge/jwt.module";

@Injectable()
export class UserBridgeModules {
    constructor(
        private readonly jwtService: JwtService,
        private readonly dbUser: UserDbModules
    ) {}
    async HandleLoginAction(email: string) {
        const user = await this.dbUser.findUser(email)
        return {
            token: this.jwtService.generateJwt({
                user_id: user?.id,
                type: "account_token"
            })
        }
    }
    async HandleRegisterAction(email: string) {
        const user = await this.dbUser.createNewEmail(email)
        return {
            token: this.jwtService.generateJwt({
                user_id: user.id,
                type: "account_token"
            })
        }
    }
    async OtpAction(action: 'login' | 'register', email: string) {
        return action == 'login' ? this.HandleLoginAction(email) : this.HandleRegisterAction(email)
    }
}
