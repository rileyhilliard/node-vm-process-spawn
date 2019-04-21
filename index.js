const vm = require('vm');
const fs = require('fs');
const debug = require('debug')('main-app')

const processSpawnCount = 10;

debug('|===== Start of Main =====|');
const sandbox = vm.createContext({ require, process, console, setTimeout, clearTimeout });

// catch errors at global app level
// process.on('uncaughtException', (...args) =>
//   debug('main-app - uncaughtException args %O:', args)
// );

const executable = index => `
  var debug = require('debug')('logged from process-${index} spawn:');
  var count = 0;
  process.on('uncaughtException', ({ message }) => {
    debug('caught/emitted from process-${index}👇');
    debug('error.message:', message);
    debug('emission count:', ++count);
    debug('---------------------------------------');
  });
  debug('process-${index} setup process.on() listener');

  if (${index} > 9) {
    debug('will throw exception from process-${index}');
    throw new Error('Error emitted from process-${index}');
  }
`;

for (let i = 1; i <= processSpawnCount; ++i) {
  const code = executable(i);
  setTimeout(() => new vm.Script(code).runInContext(sandbox));
}

debug('|===== End of Main =====|');