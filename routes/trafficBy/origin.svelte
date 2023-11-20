<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import Button from '$lib/nested/button.svelte';
	import Input from '$lib/nested/input.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	const consts = {
		date1: null,
		date2: null
	};

	export let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	$: statEvent(stats);

	let elems = {
		table1: null,
		table2: null
	};
	// Table
	export let table1;
	export let table2;

	// Datas
	let data1 = [];
	let data2 = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		cellProperties.readOnly = true;
		return cellProperties;
	};

	// Option
	let option1 = {
		colWidths: [
			40, 40, 40, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20
		],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		fixedRowsTop: 2
		// cells: optionC
	};
	let option2 = {
		colWidths: 30,
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		cells: optionC
	};

	function statEvent(stat) {
		if (table1 && table2) {
			initData();
		}
	}

	// 데이터 생성
	function makeData(res, sort) {
		let _data;

		if (sort == 'origin') {
			_data = [
				[
					'교차로명',
					'설치위치',
					'수집일시',
					'차로',
					'직진',
					'',
					'',
					'',
					'',
					'',
					'좌회전',
					'',
					'',
					'',
					'',
					'',
					'우회전',
					'',
					'',
					'',
					'',
					''
				],
				[
					'',
					'',
					'',
					'',
					'세단',
					'SUV',
					'VAN',
					'트럭',
					'버스',
					'이륜',
					'세단',
					'SUV',
					'VAN',
					'트럭',
					'버스',
					'이륜',
					'세단',
					'SUV',
					'VAN',
					'트럭',
					'버스',
					'이륜'
				]
			];
			for (let i = 1; i < 65; i++) {
				_data.push([
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					'',
					''
				]);
			}
		} else {
			_data = [
				['합계', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
			];
		}

		if (res) {
			let length;

			if (typeof res == 'object') {
				length = Object.keys(res).length;
			} else {
				length = res.length;
			}

			if (length) {
			}
		}

		return _data;
	}

	// 옵션 생성
	function makeOption(sort) {
		let optionM;

		if (sort == 'origin') {
			optionM = [
				{ row: 0, col: 0, rowspan: 2, colspan: 1 },
				{ row: 0, col: 1, rowspan: 2, colspan: 1 },
				{ row: 0, col: 2, rowspan: 2, colspan: 1 },
				{ row: 0, col: 3, rowspan: 2, colspan: 1 },
				{ row: 0, col: 4, rowspan: 1, colspan: 6 },
				{ row: 0, col: 10, rowspan: 1, colspan: 6 },
				{ row: 0, col: 16, rowspan: 1, colspan: 6 }
			];
		}

		return { mergeCells: optionM };
	}

	// 초기화
	function initData() {
		table1.loadData(makeData(null, 'origin'));
		table1.updateSettings(makeOption('origin'));
		table2.loadData(makeData(null, 'sum'));
	}

	// 초기 조회
	onMount(() => {
		initData();
	});
</script>

<div class="tabPage">
	<div class="tabOption">
		<div>
			<input type="datetime-local" bind:value={consts.date1} />
		</div>
		<div>
			<input type="datetime-local" bind:value={consts.date2} />
		</div>
		<div>
			<Button icon="search" colored={true}>조회</Button>
		</div>
	</div>
	<div class="tabContent">
		<div class="origin">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				data={data1}
				width={'100%'}
				height={'480px'}
				option={option1}
			/>
		</div>
		<div class="sum">
			<Table
				bind:wrapper={elems.table2}
				bind:table={table2}
				data={data2}
				width={'100%'}
				height={'auto'}
				option={option2}
			/>
		</div>
	</div>
</div>

<style>
	.tabPage {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		grid-row-gap: 10px;
	}

	.tabPage .tabOption {
		display: grid;
		grid-template-columns: max-content max-content 80px;
		grid-column-gap: 10px;
	}

	.tabPage .tabContent {
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
	}

	/* TR TD */
	.tabPage .tabContent .origin :global(.handsontable tr:nth-child(1) td),
	.tabPage .tabContent .origin :global(.handsontable tr:nth-child(2) td) {
		color: #666;
		background: #181d23;
	}

	.tabPage .tabContent .sum :global(.handsontable tr td:nth-child(1)) {
		color: #666;
		background: #181d23;
	}

	.tabPage :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}

	/* INPUT DATE */
	input[type='datetime-local'] {
		height: calc(100% - 2px);
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.3rem;
		color: #0584fe;
	}
</style>
