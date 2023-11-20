<svelte:options accessors />

<script>
	// @ts-nocheck
	import { devuimode } from '$lib/store.mjs';
	import Tabs from '$lib/nested/tabs.svelte';
	import Grc from './grCopy.svelte';
	import Lcc from './lcCopy.svelte';

	export let winMode = false;

	const consts = {};
	let stats = {};
	let elems = {};

	let items = [
		{ label: '그룹 DB복사', value: 1, component: Grc, tables: null },
		{ label: '교차로 DB복사', value: 2, component: Lcc, tables: null }
	];
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<Tabs height="380px" {items} />
</div>

<style>
	#main {
		/* MIN */
		min-width: 380px;
		min-height: 450px;

		/* ETC */
		font-size: 1.2rem;
		background-color: #f9fafb;
		padding: 15px;
	}

	#main.win {
		width: 380px;
		height: 450px;
	}

	#main :global(.tableWrapper .wtHolder) {
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
