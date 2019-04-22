# node-vm-process-spawn
Proof of concept for capturing errors from a node vm with multiple spawned processes

## How to test drive this:
`cd` into project root and kick off a:
`yarn && yarn start`
`processSpawnCount` defines the amount of processes to spin up. If you want to see the affect of more running processes, increase the value of this constant.
`logFromTheMainApp` toggles between a single `process.on()` at the app level, vs multiple `process.on()` handlers in each instance.

## What is this demonstrating?
- `index.js` creates `X` `vm.Script()` instances (where `X` is the numeric value of `processSpawnCount`).
- `process` is passed into each `vm` instance.
- Each `vm` instances registers a `process.on('uncaughtException')` listener that outputs `debugger` logs with information on the listeners instance emission source.
- Only the _last_ `vm` instance will emit a single error.

### What does this show?
While only one error is emitted from the last vm instance, all registrations to `process.on('uncaughtException')` will fire.
This means that if there are 5 instances running with `process.on('uncaughtException')` registrations and one error is thrown in one of the processes, 5 errors will be caught and emitted instead of the desired one catch for the single emission.

When toggling `logFromTheMainApp = true` and only turning on a single `process.on('uncaughtException')` at the main-app level, only 1 error is caught as desired, but knowing which process instance emitted that error is difficult to ascertain.

## Demo
![Demo](https://i.ibb.co/YPMpj0d/demo.gif)
