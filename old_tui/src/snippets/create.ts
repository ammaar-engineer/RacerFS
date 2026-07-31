import { snippetServices } from "../services/snippet.services.js"
import { snippetValidation } from "../validations/snippet.validation.js"
import { box, text } from "@clack/prompts"
import chalk from "chalk"

export async function createSnippet() {
  box("Create New Snippet", "Create")

  const alias = await text({
    message: "Snippet alias",
    placeholder: "git-push",
    // validate: (value) => snippetValidation.validateAlias(value as string)
  }) as string

  const command = await text({
    message: "Command",
    placeholder: "git add . && git commit -m '$1' && git push"
  }) as string

  const description = await text({
    message: "Description (optional, press Enter to skip)",
    placeholder: "Quick git operations"
  }) as string

  const descValue = description && description.trim().length > 0 ? description : null

  const snippet = await snippetServices.createSnippet(alias, command, descValue)

  console.log(chalk.green(`\n✓ Snippet '${snippet.alias}' created successfully\n`))
}
