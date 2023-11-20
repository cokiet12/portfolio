<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Tabs from '$lib/nested/tabs.svelte';
	import Origin from './origin.svelte';
	import Static from './static.svelte';

	let tabValue;

	export let params;
	export let winMode = true;
	export const onSize = function (width, height) {
		if (width <= 960) {
			stats.responsive = 1;
		} else {
			stats.responsive = 0;
		}

		let ctx = items[tabValue - 1].tables.$$.ctx;
		let tables = ctx.filter((v) => typeof v == 'object' && v.hasOwnProperty('table1') == true);
		if (tables.length) {
			setTimeout(function () {
				Object.keys(tables[0]).forEach(function (k) {
					if (tables[0][k]) {
						if (tables[0][k].table) {
							tables[0][k].table.render();
							tables[0][k].table.refreshDimensions();
						}
					}
				});
			}, 100);
		}
	};

	const consts = {};
	let stats = {
		responsive: 0
	};
	let elems = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	let items = [
		{ label: '원시 데이터', value: 1, component: Origin, tables: null, render: 0 },
		{ label: '통계 데이터', value: 2, component: Static, tables: null, render: 0 }
	];

	onMount(() => {});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div>
		<div class="search">
			<Searcher
				width="200px"
				onChoose={(no) => {
					elems = no;
				}}
			/>
		</div>

		<Tabs
			{items}
			on:tabChange={(e) => {
				tabValue = e.detail.tabValue;
			}}
			bind:param={elems}
			bind:params
		/>
	</div>
</div>

<style>
	/* 메인 */
	#main > div {
		display: grid;
		grid-template-columns: 4fr 2fr;
		grid-template-rows: auto;
		font-size: 1.2rem;
		background-color: #181d22;
		padding: 15px;
		grid-column-gap: 10px;
		grid-row-gap: 5px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 1200px;

		/* 높이(가변) */
		max-height: 1400px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;

		/* 높이(가변) */
		max-height: 1400px;
	}

	/* main grid */
	#main > div .search {
		grid-area: 1 / 1 / 2 / 2;
	}

	#main > div :global(.tabList) {
		grid-area: 1 / 2 / 2 / 3;
	}

	#main > div :global(.tabPanel) {
		grid-area: 2 / 1 / 3 / 3;
	}

	/* Handsontable Holder, Hider */
	#main > div :global(.tableWrapper > .ht_master > .wtHolder),
	#main > div :global(.tableWrapper) {
		overflow-y: auto;
		overflow-x: hidden;
	}

	#main > div :global(.tableWrapper > .ht_master .wtHider) {
		width: 100% !important;
	}
</style>
