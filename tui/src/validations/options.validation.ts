export class OptionsValidation {
    isOptionShouldExist(option: Record<string, any>, choosed: string, {errmsg, throwErr}: {errmsg: string, throwErr: boolean}) {
        if (!Object.keys(option).includes(choosed)) {
            console.log(errmsg)
            process.exit(0)
            return !Object.keys(option).includes(choosed)
        }
    }
}