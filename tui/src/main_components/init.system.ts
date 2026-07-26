import { serviceSystem } from "../services/fs.services";
import { RACERFS_FOLDER_PATH } from "../SYSTEM-PATH";
import { validationSystem } from "../validations/fs.validation";

export function InitRacerFS() {
    if (validationSystem.FolderShouldBe('notexist', RACERFS_FOLDER_PATH, {autoexit: false})) {
        serviceSystem.createFolder(RACERFS_FOLDER_PATH)
        serviceSystem.createFile(
            serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs'),
            {},
            {isJson: true}
        )
    }
}