#!/usr/bin/env node

import DoggoRunner from './runner'

require('ts-node').register()
const d = new DoggoRunner()

d.run()
