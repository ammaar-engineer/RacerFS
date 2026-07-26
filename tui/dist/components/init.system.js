import { serviceSystem } from "../service";
import { RACERFS_FOLDER_PATH } from "../SYSTEM-PATH";
import { validationSystem } from "../validation";
export function InitRacerFS() {
    if (validationSystem.FolderShouldBe('notexist', RACERFS_FOLDER_PATH, { autoexit: false })) {
        serviceSystem.createFolder(RACERFS_FOLDER_PATH);
        serviceSystem.createFile(serviceSystem.createPath(RACERFS_FOLDER_PATH, 'racerfs.rcfs'), { "name": "amarix" }, { isJson: true });
    }
}
//# sourceMappingURL=init.system.js.map