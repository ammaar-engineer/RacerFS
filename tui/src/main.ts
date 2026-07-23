
const selected_option = process.argv[2] as string
const selected_sub_option = process.argv[3] as string
export const option_list = {
    "auth": {
        "--register": "register operation",
        "--login": ""
    },
}
console.log((option_list as any)[selected_option][selected_sub_option])