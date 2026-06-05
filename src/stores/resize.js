(function (win, doc){
  const docEl = doc.documentElement;
	let dpr = win.devicePixelRatio || 1;
	dpr = dpr >= 3 ? 3 : (dpr >= 2 ? 2 : 1);
	// 为css传递dpr比率
	docEl.setAttribute('data-dpr', dpr);
	const scale = 1 / dpr;
	// 调整视图比率
	const viewportMeta = doc.querySelector('meta[name="viewport"]');
	if (viewportMeta) {
		viewportMeta.content = `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}, user-scalable=no`;
	} else {
		const meta = doc.createElement('meta');
		meta.name = 'viewport';
		meta.content = `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}, user-scalable=no`;
		doc.head.appendChild(meta);
	}
	function refreshRem(){
		const width = docEl.clientWidth || doc.body.clientWidth;
		const rem = width / 10;
		docEl.style.fontSize = `${rem}px`;
	}
	refreshRem();
	win.addEventListener('resize', refreshRem);
	win.addEventListener('pageshow', function (e){
		if (e.persisted) refreshRem();
	});
})(window, document);
