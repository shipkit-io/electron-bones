// Mock for `react-is-online-context`.
//
// The real package is CJS but requires `is-online`, which is ESM-only
// ("type": "module") and performs live DNS and TCP probes. Under jest that
// fails with `SyntaxError: Cannot use import statement outside a module`, and
// transforming it would mean pulling its whole ESM dependency chain through
// ts-jest. A unit test should not be making network calls either way, so the
// module is mapped to this mock in the `jest.moduleNameMapper` config
// (LAC-7227).
const React = require('react');

const value = { isOnline: true, isLoading: false, error: null };

module.exports = {
	useIsOnline: () => value,
	IsOnlineContext: React.createContext(value),
	IsOnlineContextProvider: ({ children }) => children,
};
