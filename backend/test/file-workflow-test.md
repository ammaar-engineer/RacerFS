# File test end to end dengan gaya user workflow
1. Cek file list terlebih dulu dan harus nya mereturn empty array karena file belum dibuat
2. Lalu menembak endpoint upload url untuk mendapat url presigned put object dari MinIO.
3. Setelah url didapat maka langsung buat mock file untuk upload dengan url tersebut
4. Setelah nya tembak endpoint confirm status upload untuk verifikasi status upload dan tersimpan nya file
5. setelah itu tembak endpoint list lagi untuk memastikan
6. setelah nya langsung coba set file ke public
7. Lalu setelah nya langsung coba delete file