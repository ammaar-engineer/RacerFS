import 'dotenv/config'
import os from 'os'
import path from 'path'

export const RACERFS_FOLDER_PATH = path.join(os.homedir(), '.racerfs')
export const BACKEND_URL = process.env.BACKEND_URL