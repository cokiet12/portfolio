<script>
	// @ts-nocheck

	//전역CSS
	import '../app.css';
	import Uidev from './layout/uidev.svelte';
	import PageLayer from './layout/pageLayer.svelte';
	import MapLayer from './layout/mapLayer.svelte';
	import TopLayer from './layout/topLayer.svelte';
	import LoginLayer from './layout/loginLayer.svelte';
	import root from 'window-or-global';
	import { writable } from 'svelte/store';

	const consts = {
		uimodes: ['none', 'ui', 'single', 'dual']
	};
	let elems = {
		modal: null
	};
</script>

<svelte:head>
	<script src="/src/lib/js/handsontable.full.min.js"></script>
	<link href="/src/lib/css/handsontable.full.min.css" rel="stylesheet" />
	<!-- Latest compiled and minified JavaScript -->
	<script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css" />
	<link rel="stylesheet" href="/src/lib/css/noto-sans-kr/style.css" />
	<link rel="stylesheet" href="/src/lib/css/nanum-barun-gothic/style.css" />
	<!-- <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" /> -->
</svelte:head>

<MapLayer />
<PageLayer>
	<slot />
</PageLayer>
<!-- <Uidev>
    <slot></slot>
</Uidev> -->
<LoginLayer />
<TopLayer />

<style>
</style>
