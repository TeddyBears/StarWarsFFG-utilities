Hooks.on('init', () => {
	if (typeof Babele !== 'undefined') {

		Babele.get().register({
			module: 'ffg-star-wars-utilities',
			lang: 'fr',
			dir: 'lang/compendium'
		});
	}
});