#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runner_1 = require("./runner");
require('ts-node').register();
const d = new runner_1.default();
d.run();
//# sourceMappingURL=cli.js.map