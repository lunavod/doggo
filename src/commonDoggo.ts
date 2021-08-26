const chalk = require('chalk')
import { Command } from 'commander'

type CommonDoggoConfig = {
  debug: boolean
  registered: boolean
  color: any
  root: string
}

export default abstract class CommonDoggo {
  name = 'noNameDoggo'
  config: CommonDoggoConfig = {
    registered: false,
    debug: false,
    color: chalk.yellow,
    root: process.cwd(),
  }

  abstract register(command: Command): void

  debug(...args: any[]) {
    if (!this.config.debug) return
    console.log(
      chalk.grey('[debug]'),
      this.config.color(`[${this.name}]`),
      ...args,
    )
  }

  error(...args: any[]) {
    console.log(
      chalk.red('[ERROR]'),
      this.config.color(`[${this.name}]`),
      ...args,
    )
  }
}
