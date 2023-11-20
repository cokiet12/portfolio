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
		colWidths: [30, 40],
		rowHeights: 23,
		renderer: 'html',
		renderAllRows: true
	};

	function makeData() {
		let _data;
		let optionM = [{ row: 0, col: 0, rowspan: 1, colspan: 2 }];
		if (params == 2004) {
			_data = [
				['4색 등화기(2004년식)', ''],
				['0X00', '적색 R 고정'],
				['', '보행 적색 고정'],
				['0X01', '좌회전 AG 고정'],
				['0X02', '황색 Y 고정'],
				['0X03', '황색 Y 점멸'],
				['0X04', '좌회전 AG 점멸'],
				['0X08', '보행자 PR'],
				['', '보행 녹색 고정'],
				['0X10', '직진 G 고정'],
				['', '보행 녹색 점멸'],
				['0X20', '황색 Y 고정'],
				['', '보행 적색 점멸'],
				['0X30', '적색 R 고정'],
				['0X40', '직진 G 점멸'],
				['0X80', '차량 R 소등']
			];

			optionM.push({ row: 1, col: 0, rowspan: 2, colspan: 1 });
			optionM.push({ row: 7, col: 0, rowspan: 2, colspan: 1 });
			optionM.push({ row: 9, col: 0, rowspan: 2, colspan: 1 });
			optionM.push({ row: 11, col: 0, rowspan: 2, colspan: 1 });
		} else {
			_data = [
				['3색 등화기(2010년식)', ''],
				['0X00', '적색 R 고정'],
				['0X01', 'G1 고정'],
				['0X02', 'Y1 고정'],
				['0X03', 'Y1 점멸'],
				['0X04', 'R1 점멸'],
				['0X05', 'G1 점멸'],
				['0X08', 'R1 Y1 G1 소등'],
				['0X10', 'G2 고정'],
				['0X20', 'Y2 고정'],
				['0X30', 'Y2 점멸'],
				['0X40', 'R2 점멸'],
				['0X50', 'G2 점멸'],
				['0X80', 'R2 Y2 G2 소등']
			];
		}

		table1.loadData(_data);
		table1.updateSettings({
			mergeCells: optionM
		});
	}

	onMount(() => {
		makeData();
	});
</script>

<div
	id="main"
	class={params == 2004 ? '_2004' : '_2010'}
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
		background-color: #f9fafb;
		padding: 15px;
		max-height: 1400px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 300px;
	}

	#main.win._2004 {
		height: 391px;
	}

	#main.win._2010 {
		height: 345px;
	}

	/* 카드 */
	.EntireDiv {
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
	}

	/* 테이블 */
	#main .table {
		display: grid;
		grid-template-columns: 100%;
	}

	/* Handsontable */
	#main .table :global(.handsontable tr:nth-child(1) td) {
		color: #999999;
		background: #f4f7f9;
	}
</style>
