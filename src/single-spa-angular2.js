const defaultOpts = {
	// required opts
	domElementGetter: null,
	angularPlatform: null,
	mainModule: null,
	template: null,
};

export default function singleSpaAngular1(userOpts) {
	if (typeof userOpts !== 'object') {
		throw new Error(`single-spa-angular1 requires a configuration object`);
	}

	const opts = {
		...defaultOpts,
		...userOpts,
	};

	if (typeof opts.domElementGetter !== 'function') {
		throw new Error(`single-spa-angular2 must be passed opts.domElementGetter function`);
	}

	if (!opts.angularPlatform) {
		throw new Error(`single-spa-angular2 must be passed opts.angularPlatform. Usually this should be the return value of platformBrowserDynamic()`);
	}

	if (!mainModule) {
		throw new Error(`single-spa-angular2 must be passed opts.mainModule, which is the Angular module to bootstrap`);
	}

	if (typeof opts.template !== 'string') {
		throw new Error(`single-spa-angular2 must be passed opts.template string`);
	}

	return {
		bootstrap: bootstrap.bind(null, opts),
		mount: mount.bind(null, opts),
		unmount: unmount.bind(null, opts),
	};
}

function bootstrap(opts) {
	return Promise.resolve();
}

function mount(opts) {
	return new Promise((resolve, reject) => {
		const containerEl = getContainerEl(opts);
		containerEl.innerHTML = template;
		opts.bootstrappedModule = opts.platform.bootstrapModule(opts.mainModule);
		resolve();
	});
}

function unmount(opts) {
	return new Promise((resolve, reject) => {
		opts.bootstrappedModule.destroy();
		delete opts.bootstrappedModule;
		resolve();
	});
}

function getContainerEl(opts) {
	const element = opts.domElementGetter();
	if (!element) {
		throw new Error(`domElementGetter did not return a valid dom element`);
	}

	return element;
}
