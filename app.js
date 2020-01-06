const fs = require('fs');
const yargs = require('yargs');
const plugin = require ('./powerQuery');
const Plugin = plugin.Plugin;



yargs
  .command({
    command: 'new',
    describe: 'Create a new Plugin Object',
    builder: {
      name: {
          describe: 'Plugin Name',
          demandOption: true,
          type: 'string'
      }
  },
  handler(argv) {
    var newPlugin = new Plugin(argv.name);
    console.log(`Creating plugin named ${newPlugin.getPluginName()}`)

  }

})
//console.log(yargs.argv);


