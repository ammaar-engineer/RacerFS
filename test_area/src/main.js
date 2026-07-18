import 'dotenv/config'
import {Resend} from 'resend'
import * as minio from 'minio'
import fs from 'fs'


// (async function () {
//     const resend_instance = new Resend(process.env.RESEND_API_KEY)
//     const {data, error} = await resend_instance.emails.send({
//         from: "Acme <onboarding@resend.dev>",
//         to: ["delivered@resend.dev"],
//         subject: "Test resend",
//         html: "<strong>Your OTP code: 234-90-12</strong>"
//     })

//     console.log({data})
// })


// Tes sizing system
(async function() {
    const MinioClient = new minio.Client({
        endPoint: 'localhost',
        port: 9000,
        useSSL: false,
        accessKey: "minioadmin",
        secretKey: "minioadmin123"
    })
    const FILETARGET = "package.json"
    const presignedPutUrl = await MinioClient.presignedPutObject(
        "racerfs-bucket",
        FILETARGET
    )
    const file = fs.readFileSync(FILETARGET)
    const filestats = fs.statSync(FILETARGET)
    console.log("CLIENT BACA SIZE FILE: ", filestats.size)
    const res_raw = await fetch(presignedPutUrl, {
        method: 'PUT',
        body: file,
    })
    console.log("MINIO SERVER RETURN: ", res_raw)
    const minioReadSizeSystem = await MinioClient.statObject("racerfs-bucket", FILETARGET)
    console.log("MINIO BACA UKURAN SIZE: ", minioReadSizeSystem.size)
})()