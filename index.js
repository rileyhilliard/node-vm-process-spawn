const vm = require('vm');
const debug = require('debug')('logged from the main-app:')

// count of processes to kick off
const processSpawnCount = 100;

// Toggle between one single app-level catch
// & multiple spawned process catchers
const logFromTheMainApp = false;

debug('|===== Start of Main =====|');

// catch errors at global app level
process.on('uncaughtException', (...args) =>
  logFromTheMainApp && debug('main-app - uncaughtException args %O:', args)
);

// Code generator for each VM instance
const executable = index => `
  var debug = require('debug')('logged from process-${index} spawn:');

  if (${!logFromTheMainApp}) {
    var count = 0;
    process.on('uncaughtException', ({ message }) => {
      debug('caught/emitted from process-${index}👇');
      debug('error.message:', message);
      debug('emission count:', ++count);
      debug('---------------------------------------');
    });
    debug('process-${index} setup process.on() listener');
  }

  if (${index} > ${processSpawnCount - 1}) {
    debug('will throw exception from process-${index}');
    throw new Error('Error emitted from process-${index}');
  }
`;

// Spawn X VM processes, where X = processSpawnCount
for (let i = 1; i <= processSpawnCount; ++i) {
  const sandbox = vm.createContext({ require, process, console, setTimeout, clearTimeout });
  const code = executable(i);
  setTimeout(() => new vm.Script(code).runInContext(sandbox));
}

debug('|===== End of Main =====|');
