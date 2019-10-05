const flowgen = require('flowgen');
const { format } = require('prettier');

module.exports = typeScriptDefinitions =>
  format(flowgen.compiler.compileDefinitionString(typeScriptDefinitions), { parser: 'flow' });
