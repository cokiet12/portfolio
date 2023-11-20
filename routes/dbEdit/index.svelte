<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode, pageWidth } from '$lib/store.mjs';
	import Searcher from '$lib/nested/searcher.svelte';
	import Tabs from '$lib/nested/tabs.svelte';
	import StartUp from './startUp.svelte';
	import SignalMap from './signalMap.svelte';
	import Detector from './detector.svelte';
	import LcTod from './lcTod.svelte';
	import Split from './split.svelte';
	import FlashRsrv from './flashRsrv.svelte';
	import OutPed from './outPed.svelte';
	import Conflict from './conflict.svelte';

	let tabValue;
	export let params;

	export let winMode = false;
	export const onSize = function (width, height) {
		if (width <= 800) {
			stats.responsive = 1;
		} else {
			stats.responsive = 0;
		}

		let ctx = items[tabValue - 1].tables.$$.ctx;
		let tables = [ctx.find((v) => v.table1)];

		setTimeout(function () {
			Object.keys(tables[0]).forEach(function (k) {
				tables[0][k].table.render();
				tables[0][k].table.refreshDimensions();
			});
		}, 100);
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
		{
			label: '제어변수',
			class: 'startUp',
			value: 1,
			component: StartUp,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: '시그널맵',
			class: 'signalMap',
			value: 2,
			component: SignalMap,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: '검지기구성',
			class: 'detector',
			value: 3,
			component: Detector,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: 'TOD편집',
			class: 'lcTod',
			value: 4,
			component: LcTod,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: 'SPLIT편집',
			class: 'split',
			value: 5,
			component: Split,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: '예약/점멸',
			class: 'flashRsrv',
			value: 6,
			component: FlashRsrv,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: '방향별출력맵',
			class: 'outPed',
			value: 7,
			component: OutPed,
			tables: null,
			render: 0,
			year: true
		},
		{
			label: '모순맵',
			class: 'conflict',
			value: 8,
			component: Conflict,
			tables: null,
			render: 0,
			year: true
		}
	];
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
		grid-template-columns: 1fr 3fr;
		grid-template-rows: auto;
		font-size: 1.2rem;
		background-color: #f9fafb;
		padding: 15px;
		grid-column-gap: 10px;
		grid-row-gap: 5px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 800px;

		/* 높이(가변) */
		max-height: 850px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;

		/* 높이(가변) */
		max-height: 850px;
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
