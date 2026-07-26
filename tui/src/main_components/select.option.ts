import { select } from "@clack/prompts"

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
    const selectedOptionIndex = selectOption.toString().split(":")[1]
    await obj[Number(selectedOptionIndex)]?.action()
}