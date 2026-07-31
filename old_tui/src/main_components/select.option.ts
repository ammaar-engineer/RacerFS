import { isCancel, select } from "@clack/prompts"

interface paramObject {
    label: string,
    action: () => any | Promise<any>
}

export async function createSelectOption(title: string, obj: paramObject[]) {
    const selectOption = await select({
        message: title,
        options: obj.map((data, i) => ({
            value: `${data.label}:${i}`,
            label: data.label
        }))
    })
    if (isCancel(selectOption)) {
        console.log("Exist forcefully")
        process.exit(0)
    }
    const selectedOptionIndex = selectOption.toString().split(":")[1]
    await obj[Number(selectedOptionIndex)]?.action()
}