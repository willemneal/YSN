#!/usr/bin/env node

const program = require('commander')
const deploy = require('./deploy')

program
    .command('deploy') // sub-command name
    .alias('dpl')
    .description('Deploy all contracts if no option passed')
    .option('--clean', 'delete contracts')
    .option('--init', 'create contracts')
    .option('--build', 'build contracts')
    .action(function (options) {
        deploy(options.clean, options.init, options.build)
    })

// allow commander to parse `process.argv`
program.parse(process.argv)
