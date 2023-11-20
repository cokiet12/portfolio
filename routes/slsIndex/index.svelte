<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import Table from '$lib/nested/table.svelte';

	export let winMode = false;
	export let params;

	const consts = {};
	let stats = {};
	let elems = {
		table1: null
	};
	// Table
	let table1;

	// Data
	let data = [];

	// Option
	let option = {
		colWidths: [30, 30],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true
	};

	function makeData() {
		let _data;

		_data = [
            ['서비스 수준', '제어지체'],
            ['A', '15초 이하'],
            ['B', '15 ~ 30초'],
            ['C', '30 ~ 50초'],
            ['D', '50 ~ 70초'],
            ['E', '70 ~ 100초'],
            ['F', '100 ~ 220초'],
            ['FF', '220 ~ 340초'],
            ['FFF', '340초 이상']
        ];

		table1.loadData(_data);
	}

	onMount(() => {
		makeData();
	});
</script>

<div
	id="main"
	class:modal={winMode == false}
	class:win={winMode == true}
>
	<div class="EntireDiv">
		<div class="table">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				{data}
				width={'100%'}
				height={'auto'}
				{option}
			/>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #000000;
		padding: 11px;
		/* 높이(가변) */
		max-height: 720px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 300px;
        height: 240px;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		display : grid;
		grid-template-columns: auto;
		grid-template-rows: auto 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		box-shadow: 0px 0px 10px #0000000D;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830DD;
		padding: 15px;
	}

    /* overflow시 스크롤 */
    /* 창모드 */
    #main.win :global(.tableWrapper > .ht_master > .wtHolder) {
        overflow-x: hidden;
        overflow-y: auto;
    }

    /* TR TD */
    .EntireDiv .table :global(.handsontable tr:nth-child(1) td) {
        color: #666;
        background: #181D23;
    }

    .EntireDiv :global(.handsontable tr td) {
        color: #999999;
        background: #212830;
    }

	/* 테이블 */
	#main .table {
		display: grid;
		grid-template-columns: 100%;
	}

	/* scroll */
	#main :global(::-webkit-scrollbar) {width: 7px;height: 7px; background-color: rgba(0, 0, 0, 0.7);}
	#main :global(::-webkit-scrollbar-thumb) {background-color:rgba(126, 126, 126, 0.7); border-radius: 2px;}
</style>
