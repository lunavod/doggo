const fs = require('fs/promises')
const path = require('path')
import { load as parseYaml } from 'js-yaml'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { Command } from 'commander'
const chalk = require('chalk')
import CommonDoggo from './commonDoggo'
import Config from './config'
const glob = require('glob')

export default class DoggoRunner {
  doggos: CommonDoggo[] = []
  homeDir: string = ''
  config: Config
  command: Command
  debugMode: boolean = false

  async run() {
    await this.initCommand()

    if (!(await this.findHomeDir())) return false
    if (!(await this.loadConfig())) return false
    if (!(await this.loadDoggos())) return false

    await this.registerDoggos()

    this.command.parse()
  }

  debug(...args: any[]) {
    if (!this.debugMode) return
    console.log(chalk.grey('[debug]'), ...args)
  }

  error(...args: any[]) {
    console.log(chalk.red('[ERROR]'), ...args)
  }

  async initCommand() {
    this.command = new Command('doggo')
    this.command.option('-d, --debug', 'Verbose output')
    this.command.parseOptions(process.argv)
    const opts = this.command.opts()
    if (opts.debug) this.debugMode = true
  }

  async registerDoggos() {
    this.doggos.forEach((d) => {
      d.config.debug = this.debugMode
      d.config.root = this.homeDir
      d.register(this.command)
      d.config.registered = true
    })
  }

  async loadDoggos(): Promise<boolean> {
    const doggosDir = path.resolve(this.homeDir, this.config.doggosDir)
    let files: string[]
    try {
      files = glob.sync('**/*.doggo.*', { cwd: doggosDir })
    } catch (err) {
      console.error('Doggos dir not found')
      return false
    }

    this.debug('Files:', files)

    files.forEach((name) => {
      const customClass = require(path.resolve(doggosDir, name))
      if (typeof customClass !== 'function') {
        this.error(name, '- NOT A CLASS')
        return false
      }

      const newDoggo = new customClass()

      if (!(newDoggo instanceof CommonDoggo)) {
        this.error(name, '- NOT A DOGGO')
        return false
      }
      this.debug(chalk.blue(name), 'registered')

      this.doggos.push(newDoggo)
    })

    return true
  }

  async loadConfig() {
    const plain = parseYaml(
      await fs.readFile(path.join(this.homeDir, '.doggo.yml'), 'utf-8'),
    )
    const config = plainToClass(Config, plain)
    const errors = await validate(config)
    if (errors.length) {
      this.error('Config errors:')
      errors.forEach((err) => {
        Object.values(err.constraints).forEach((c) => this.error(c))
      })
      return false
    }

    this.debug('Config loaded:', config)

    this.config = config
    return true
  }

  async findHomeDir() {
    const checkIsHomeDir = async (p: string) => {
      const files = await fs.readdir(p)

      if (files.includes('.doggo.yml')) {
        this.homeDir = p
        return true
      }

      return false
    }

    let p = process.cwd()
    while (p !== path.resolve(p, '../') && !this.homeDir) {
      await checkIsHomeDir(p)
      p = path.resolve(p, '../')
    }
    checkIsHomeDir(p)

    if (!this.homeDir) this.error('HOME DIR NOT FOUND')
    this.debug('Home dir found:', chalk.blue(this.homeDir))

    return !!this.homeDir
  }
}
