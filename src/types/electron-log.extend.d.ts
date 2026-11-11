import 'electron-log';

// `Logger.addLevel('status', 0)` in src/main/logger.ts adds this level at runtime,
// so the type has to be declared here.
//
// Only the root module is augmented. `electron-log/main` resolves to
// `export = Logger` over a bare `declare const`, which is a non-module entity and
// cannot be interface-augmented -- attempting it is TS2671. The root
// (electron-log/src/index.d.ts) declares `namespace Logger` and `const Logger`,
// which merge, so an augmentation there does land. main.d.ts imports the same
// `MainLogger` from `./src`, and MainLogger extends NodeLogger extends
// LogFunctions, so augmenting the root reaches `electron-log/main` as well
// (LAC-7227).
declare module 'electron-log' {
	interface LogFunctions {
		status(...params: any[]): void;
	}
}
