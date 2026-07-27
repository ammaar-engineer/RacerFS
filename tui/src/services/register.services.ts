import { BACKEND_URL } from "../SYSTEM-PATH";
import axios from "axios";

export class registerServicesClass {
    async sendRegisterRequest(email: string) {
        try {
            const resSendActionReq = await axios.post(`${BACKEND_URL}/user/register`, {
                email
            })
            return {
                sessionId: resSendActionReq.data.data.sessionId
            }
        } catch (error) {
            console.log(error)
            console.log("Error while sending register request")
            process.exit(1)
        }
    }

    async verifyOtp(sessionId: string, otp: string) {
        try {
            const resVerifyOtp = await axios.post(`${BACKEND_URL}/user/verify-otp`, {
                sessionId,
                otp
            })
            return {
                token: resVerifyOtp.data.data.token
            }
        } catch (error) {
            console.log("Error while verifying OTP")
            process.exit(1)
        }
    }
}
