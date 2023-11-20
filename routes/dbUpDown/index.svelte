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
	import LcPlan from './lcPlan.svelte';
	import FlashRsrv from './flashRsrv.svelte';
	import OutPed from './outPed.svelte';
	import Conflict from './conflict.svelte';
	import System from './system.svelte';
	import { bind } from 'svelte/internal';

	let tabValue;

	export let params; //{tabValue : 1, stats : null, lcno : lcno}

	export let winMode = false;
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
			label: '운영계획',
			class: 'lcPlan',
			value: 4,
			component: LcPlan,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: '예약/점멸',
			class: 'flashRsrv',
			value: 5,
			component: FlashRsrv,
			tables: null,
			render: 0,
			year: false
		},
		{
			label: '방향별출력맵',
			class: 'outPed',
			value: 6,
			component: OutPed,
			tables: null,
			render: 0,
			year: true
		},
		{
			label: '모순맵',
			class: 'conflict',
			value: 7,
			component: Conflict,
			tables: null,
			render: 0,
			year: true
		},
		{
			label: '시스템',
			class: 'system',
			value: 8,
			component: System,
			tables: null,
			render: 0,
			year: true
		}
	];

	// onMount(()=>{
	//     elems = params ? params : elems
	// })
</script>

<div
	id="main"
	class:responsive={stats.responsive == 1}
	class:modal={winMode == false}
	class:win={winMode == true}
>
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
		grid-template-columns: 1fr 2fr;
		grid-template-rows: auto;
		font-size: 1.2rem;
		background-color: #f9fafb;
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

	#main.modal.responsive :global(.tab .tabPage) {
		display: grid;
		grid-template-columns: none;
		grid-template-rows: auto;
		grid-row-gap: 10px;
	}

	#main.modal.responsive :global(.tab.startUp .tabPage > div:nth-child(1)),
	#main.modal.responsive :global(.tab.detector .tabPage > div:nth-child(1)),
	#main.modal.responsive :global(.tab.lcPlan .tabPage > div:nth-child(1)),
	#main.modal.responsive :global(.tab.flashRsrv .tabPage > div:nth-child(1)),
	#main.modal.responsive :global(.tab.outPed .tabPage > div:nth-child(1)),
	#main.modal.responsive :global(.tab.conflict .tabPage > div:nth-child(1)),
	#main.modal.responsive :global(.tab.system .tabPage > div:nth-child(1)) {
		grid-area: 1 / 1 / 2 / 2;
	}

	#main.modal.responsive :global(.tab.startUp .tabPage > div:nth-child(2)),
	#main.modal.responsive :global(.tab.detector .tabPage > div:nth-child(2)),
	#main.modal.responsive :global(.tab.lcPlan .tabPage > div:nth-child(2)),
	#main.modal.responsive :global(.tab.flashRsrv .tabPage > div:nth-child(2)),
	#main.modal.responsive :global(.tab.outPed .tabPage > div:nth-child(2)),
	#main.modal.responsive :global(.tab.conflict .tabPage > div:nth-child(2)),
	#main.modal.responsive :global(.tab.system .tabPage > div:nth-child(2)) {
		grid-area: 3 / 1 / 4 / 2;
	}

	#main.modal.responsive :global(.tab.startUp .tabPage > div:nth-child(3)),
	#main.modal.responsive :global(.tab.detector .tabPage > div:nth-child(3)),
	#main.modal.responsive :global(.tab.lcPlan .tabPage > div:nth-child(3)),
	#main.modal.responsive :global(.tab.flashRsrv .tabPage > div:nth-child(3)),
	#main.modal.responsive :global(.tab.outPed .tabPage > div:nth-child(3)),
	#main.modal.responsive :global(.tab.conflict .tabPage > div:nth-child(3)),
	#main.modal.responsive :global(.tab.system .tabPage > div:nth-child(3)) {
		grid-area: 2 / 1 / 3 / 2;
	}

	#main.modal.responsive :global(.tab.startUp .tabPage > div:nth-child(4)),
	#main.modal.responsive :global(.tab.detector .tabPage > div:nth-child(4)),
	#main.modal.responsive :global(.tab.lcPlan .tabPage > div:nth-child(4)),
	#main.modal.responsive :global(.tab.flashRsrv .tabPage > div:nth-child(4)),
	#main.modal.responsive :global(.tab.outPed .tabPage > div:nth-child(4)),
	#main.modal.responsive :global(.tab.conflict .tabPage > div:nth-child(4)),
	#main.modal.responsive :global(.tab.system .tabPage > div:nth-child(4)) {
		grid-area: 4 / 1 / 5 / 2;
	}

	#main.modal.responsive :global(.tab.signalMap .tabPage > div:nth-child(1)) {
		grid-area: 1 / 1 / 2 / 2;
	}

	#main.modal.responsive :global(.tab.signalMap .tabPage > div:nth-child(2)) {
		grid-area: 2 / 1 / 3 / 2;
	}

	#main.modal.responsive :global(.tab.signalMap .tabPage > div:nth-child(3)) {
		grid-area: 4 / 1 / 5 / 2;
	}

	#main.modal.responsive :global(.tab.signalMap .tabPage > div:nth-child(4)) {
		grid-area: 5 / 1 / 6 / 2;
	}

	#main.modal.responsive :global(.tab.signalMap .tabPage > div:nth-child(5)) {
		grid-area: 3 / 1 / 4 / 2;
	}

	#main.modal.responsive :global(.tab.signalMap .tabPage > div:nth-child(6)) {
		grid-area: 6 / 1 / 7 / 2;
	}
</style>
