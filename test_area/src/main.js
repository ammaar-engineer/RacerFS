import 'dotenv/config'
import {Resend} from 'resend'


(async function () {
    const resend_instance = new Resend(process.env.RESEND_API_KEY)
    const {data, error} = await resend_instance.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject: "Test resend",
        html: "<strong>Your OTP code: 234-90-12</strong>"
    })

    console.log({data})
})()