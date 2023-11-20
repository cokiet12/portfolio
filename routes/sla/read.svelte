<script>
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';

	export let stats = {};
	export let winMode = true;
	export let editmode = false;
	export let onSize = (wid, hei) => {
		setTimeout(() => {
			table1.refreshDimensions();
			table2.refreshDimensions();
			table3.refreshDimensions();
			table4.refreshDimensions();
		});
	};
	$: if (!editmode) {
		setTimeout(() => {
			table1.refreshDimensions();
			table2.refreshDimensions();
			table3.refreshDimensions();
			table4.refreshDimensions();
		});
	}

	$: searchEvent(stats);
	$: console.log(winMode);
	let elems = {
		table1: null,
		table2: null,
		table3: null,
		table4: null
	};
	// Table
	let table1;
	let table2;
	let table3;
	let table4;

	// Datas
	let data1 = [];
	let data2 = [];
	let data3 = [];
	let data4 = [];

	// Row
	let row1 = null;
	let row2 = null;

	// Option
	let option1 = {
		colWidths: [90, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true,
		readOnly: true,
		fixedRowsTop: 2
	};

	function searchEvent(stat) {
		if (table1) {
			initData();
		}
	}

	function initData() {
		table1.loadData([
			[
				'접근로',
				'북',
				'',
				'',
				'',
				'',
				'동',
				'',
				'',
				'',
				'',
				'남',
				'',
				'',
				'',
				'',
				'서',
				'',
				'',
				'',
				''
			],
			[
				'',
				'중앙LT',
				'중앙TH',
				'LT',
				'TH',
				'RT',
				'중앙LT',
				'중앙TH',
				'LT',
				'TH',
				'RT',
				'중앙LT',
				'중앙TH',
				'LT',
				'TH',
				'RT',
				'중앙LT',
				'중앙TH',
				'LT',
				'TH',
				'RT'
			],
			[
				'초기대기차량대수(대)',
				'-',
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
			],
			[
				'추가지채유형판단',
				'-',
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
			],
			['균열지체', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
			['증분지체', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
			['추가지체', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
			['순행시간', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
			[
				'(적정)옵셋(초)',
				'-',
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
			],
			[
				'옵셋편의율',
				'-',
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
			],
			['연동계수', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
			[
				'평균제어지제',
				'-',
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
			],
			[
				'차로군서비스수준',
				'-',
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
			]
		]);
		table1.updateSettings({
			mergeCells: [
				{ row: 0, col: 0, rowspan: 2, colspan: 1 },
				{ row: 0, col: 1, rowspan: 1, colspan: 5 },
				{ row: 0, col: 6, rowspan: 1, colspan: 5 },
				{ row: 0, col: 11, rowspan: 1, colspan: 5 },
				{ row: 0, col: 16, rowspan: 1, colspan: 5 }
			]
		});
		table2.loadData([
			[
				'접근로지체',
				'-',
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
			],
			[
				'접근로서비스수준',
				'-',
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
			]
		]);
		table3.loadData([
			[
				'접근로교통량',
				'-',
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
			],
			[
				'교차로지체',
				'-',
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
			],
			[
				'교차로서비스수준',
				'-',
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
			]
		]);
		table4.loadData([
			['주기', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '지체도'],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', ''],
			['-', '-', '', '', '', '', '', '', '', '', '', '', '', '']
		]);
	}

	// function makeData(res){
	//     let _data;

	//     _data = [
	//         ['접근로','북','','','','','동','','','','','남','','','','','서','','','',''],
	//         ['','중앙LT','중앙TH','LT','TH','RT','중앙LT','중앙TH','LT','TH','RT','중앙LT','중앙TH','LT','TH','RT','중앙LT','중앙TH','LT','TH','RT'],
	//         ['초기대기차량대수(대)','-','','','','','','','','','','','','','','','','','','',''],
	//         ['추가지채유형판단','-','','','','','','','','','','','','','','','','','','',''],
	//         ['균열지체','-','','','','','','','','','','','','','','','','','','',''],
	//         ['증분지체','-','','','','','','','','','','','','','','','','','','',''],
	//         ['추가지체','-','','','','','','','','','','','','','','','','','','',''],
	//         ['순행시간','-','','','','','','','','','','','','','','','','','','',''],
	//         ['(적정)옵셋(초)','-','','','','','','','','','','','','','','','','','','',''],
	//         ['옵셋편의율','-','','','','','','','','','','','','','','','','','','',''],
	//         ['연동계수','-','','','','','','','','','','','','','','','','','','',''],
	//         ['평균제어지제','-','','','','','','','','','','','','','','','','','','',''],
	//         ['차로군서비스수준','-','','','','','','','','','','','','','','','','','','','']
	//     ]

	//     if(res){
	//         let length;
	//         if(typeof(res) == 'object'){
	//             length = Object.keys(res).length;
	//         } else {
	//             length = res.length;
	//         }

	//         if(length){

	//         } else {

	//         }
	//     }

	//     return _data
	// }

	onMount(() => {
		initData();
	});
</script>

<wrapper class="newScrollBar" class:winMode>
	<div class="container1">
		<div class="title">차로군 분석</div>
		<div>
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				data={data1}
				width={'70%'}
				height={'300px'}
				option={option1}
			/>
		</div>
		<div class="title">접근로 분석</div>
		<div>
			<Table
				bind:wrapper={elems.table2}
				bind:table={table2}
				data={data2}
				width={'70%'}
				height={'50px'}
				option={option1}
			/>
		</div>
		<div class="title">교차로 분석</div>
		<div>
			<Table
				bind:wrapper={elems.table3}
				bind:table={table3}
				data={data3}
				width={'70%'}
				height={'75px'}
				option={option1}
			/>
		</div>
	</div>
	<div class="container2">
		<div class="title">최적현시</div>
		<div>
			<Table
				bind:wrapper={elems.table4}
				bind:table={table4}
				data={data4}
				width={'70%'}
				height={'300px'}
				option={option1}
			/>
		</div>
	</div>
</wrapper>

<style>
	.title {
		font-size: 1.4rem;
		padding: 19px 24px;
		color: #cccccc;
	}

	* {
		box-sizing: border-box;
	}
	wrapper {
		/* width: 100%; */
		height: 100%;
		display: grid;
		overflow: auto;
		/* grid-template-columns: 1fr 1fr; */
		row-gap: 15px;
		grid-template-rows: 2fr 1fr;
	}
	wrapper.winMode {
		height: 657px;
	}
	.container1 {
		box-sizing: border-box;
		display: grid;
		background-color: #212830;
		padding: 11px;
		row-gap: 11px;
		width: 100%;

		grid-template-rows: 35px auto 35px auto 35px auto;
	}

	.container1 > div {
		width: 100%;
	}
	.winMode .container1 > div {
		width: 980px;
	}

	.container2 {
		box-sizing: border-box;
		display: grid;
		background-color: #212830;
		padding: 11px;
		row-gap: 11px;

		grid-template-rows: 35px auto;
	}
	.winMode .container2 > div {
		width: 980px;
	}

	wrapper :global(.handsontable tr td:nth-child(1)) {
		background-color: #2e3843 !important;
	}
	wrapper :global(.handsontable .wtHolder) {
		overflow: hidden !important;
	}
</style>
