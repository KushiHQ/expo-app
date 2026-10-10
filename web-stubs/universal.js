/**
 * Web-only stand-in for native modules (used by the CI web preview build —
 * see metro.config.js). Every property is another stub, every call returns a
 * stub, and when React renders it as a component (called with a props object)
 * it renders nothing. Never shipped in iOS/Android builds.
 */
function make() {
	const fn = function () {};
	return new Proxy(fn, {
		get(_t, prop) {
			if (prop === '__esModule') return true;
			if (prop === 'then') return undefined; // not a thenable
			if (prop === 'prototype') return undefined; // render as a function component
			if (prop === Symbol.toPrimitive) return () => '';
			if (prop === 'toString' || prop === 'valueOf') return () => '';
			if (prop === 'displayName' || prop === 'name') return 'WebStub';
			if (prop === '$$typeof') return undefined;
			return stub;
		},
		apply(_t, _this, args) {
			const a = args[0];
			// Rendered as a component (props object) or called with an options object.
			if (a && typeof a === 'object' && !Array.isArray(a)) return null;
			return stub;
		},
		construct() {
			return stub;
		}
	});
}
const stub = make();
module.exports = stub;
