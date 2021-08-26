const chalk = require('chalk')
import CommonDoggo from './commonDoggo'
const inquirer = require('inquirer')
import { toCamelCase, toPascalCase } from 'js-convert-case'
const pluralize = require('pluralize')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

export default abstract class RendererDoggo extends CommonDoggo {
  templates: Record<
    string,
    [string, string] | [string, string, Record<string, any>]
  >
  data: Record<string, any>
  base: string
  templatesDir: string
  twigExtensions: Record<string, (value: string) => string> = {}

  async prepareTwig() {
    const Twig = require('twig')
    Twig.extendFilter('plural', (s) => pluralize(s))
    Twig.extendFilter('camel', (s) => toCamelCase(s))
    Twig.extendFilter('pascal', (s) => toPascalCase(s))
    return Twig
  }

  async writeFile(p: string, content: string) {
    const finalPath = path.join(this.base, p)
    console.log('Writing file', chalk.green(finalPath))
    if (fs.existsSync(finalPath)) {
      this.error('File exists!')
      process.exit()
    }
    fs.writeFileSync(finalPath, content)
  }

  async createDir(p?: string) {
    const finalPath = path.join(this.base, p ?? '')
    console.log('Creating directory', chalk.green(finalPath))
    if (fs.existsSync(finalPath)) {
      this.error('Directory exists')
      process.exit()
    }
    fs.mkdirSync(finalPath)
  }

  async renderFile(from: string, data: Record<string, any>): Promise<string> {
    const twig = await this.prepareTwig()
    const content = await new Promise<string>((resolve, reject) => {
      twig.renderFile(
        path.join(this.templatesDir, from),
        data,
        (err: any, result: string) => {
          if (err) {
            console.error(err)
            return reject(err)
          }
          resolve(result)
        },
      )
    })
    return content
  }

  async renderTemplate(code: string) {
    if (!(code in this.templates)) {
      this.error(`Code ${code} not found in templates!`)
      process.exit()
    }

    const [from, to, data] = this.templates[code]
    await this.writeFile(to, await this.renderFile(from, data ?? this.data))
  }

  async ask(message: string, defaultValue?: string): Promise<string> {
    const config = {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue ?? undefined,
    }
    const answer = await inquirer.prompt([config])
    return answer.value
  }

  execute(command: string) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout) => {
        if (error) return reject(error)
        resolve(stdout)
      })
    })
  }
}
