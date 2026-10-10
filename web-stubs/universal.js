/**
 * Web-only stand-in for native modules (used by the CI web preview build;
 * see metro.config.js). Every property is another stub. Calling it returns a
 * stub that can also be awaited (resolves to undefined). Called with an object
 * (React props, or an options object) it returns null, so as a component it
 * renders nothing. Never shipped in iOS/Android builds.
 */
function make(thenable) {
	const fn = function () {};
	return new Proxy(fn, {
		get(_t, prop) {
			if (prop === '__esModule') return true;
			if (prop === 'then') return thenable ? (resolve) => resolve(undefined) : undefined;
			if (prop === 'catch' || prop === 'finally') return thenable ? () => called : undefined;
			if (prop === 'prototype') return undefined; // render as a function component
			if (prop === Symbol.toPrimitive) return () => '';
			if (prop === 'toString' || prop === 'valueOf') return () => '';
			if (prop === 'displayName' || prop === 'name') return 'WebStub';
			if (prop === '$$typeof') return undefined;
			return stub;
		},
		apply(_t, _this, args) {
			const a = args[0];
			if (a && typeof a === 'object' && !Array.isArray(a)) return null;
			return called;
		},
		construct() {
			return stub;
		}
	});
}
const stub = make(false);
const called = make(true);
module.exports = stub;
