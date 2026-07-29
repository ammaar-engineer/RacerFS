# Auth testing
1. User register dengan alamat email delivered@resend.dev
2. Lalu setelah nya user selesai register, user langsung verifikasi kode otp nya. Jangan lupa untuk mengirim sessionId nya juga ke endpoint verifikasi otp
3. Setelah verifikasi otp selesai. User langsung login dengan alamat email tersebut
4. Lalu user akan verifikasi kode OTP nya lagi dari hasil login tersebut.