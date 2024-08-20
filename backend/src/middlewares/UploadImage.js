import multer, { memoryStorage } from 'multer'

const storage = memoryStorage()

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } 
})

export const uploadFile = upload.single('img')