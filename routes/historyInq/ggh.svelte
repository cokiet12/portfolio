<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { HisTable, HisSize } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	$: if ($HisTable[1] == 1) {
		console.log('그룹이력 엑셀 저장 클릭');
		exportExcel(table1);
		$HisTable[1] = 0;
	}

	$: if ($HisTable[1] == 2) {
		console.log('그룹이력 PDF 저장/인쇄 클릭');
		exportPDF(table1);
		$HisTable[1] = 0;
	}

	$: if ($HisTable[1] == 3) {
		console.log('그룹이력 데이터 복사 클릭');
		exportClib(table1);
		$HisTable[1] = 0;
	}

	const consts = {};
	let stats = {
		value1: null,
		value2: null
	};
	let elems = {
		table1: null,
		btn: null
	};

	export let table1;

	let today = new Date();
	let year = today.getFullYear();
	let month = ('0' + (today.getMonth() + 1)).slice(-2);
	let day = ('0' + today.getDate()).slice(-2);
	let hours = ('0' + today.getHours()).slice(-2);
	let hours2 = ('0' + (today.getHours() - 5)).slice(-2);
	let minutes = ('0' + today.getMinutes()).slice(-2);

	let firstInput = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
	let secondInput = year + '-' + month + '-' + day + 'T' + hours2 + ':' + minutes;
	stats.value1 = secondInput;
	stats.value2 = firstInput;

	let data = new Array();

	data.push([
		'기본정보',
		'',
		'',
		'',
		'NOW',
		'',
		'',
		'',
		'TOD',
		'',
		'',
		'',
		'',
		'',
		'MAN',
		'',
		'',
		''
	]);
	data.push([
		'생성<br>일시',
		'그룹<br>번호',
		'제어<br>모드',
		'제어<br>상태',
		'주기<br>길이',
		'시간<br>계획',
		'LC<br>옵셋',
		'LC<br>현시',
		'주기<br>길이',
		'주기<br>계획',
		'일<br>계획',
		'LC시간<br>계획',
		'LC<br>옵셋',
		'LC<br>현시',
		'주기<br>길이',
		'주기<br>계획',
		'옵셋<br>번호',
		'현시<br>번호'
	]);

	for (let i = 0; i < 23; i++) {
		if (i % 2 == 0) {
			let temp = [
				`-`,
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-'
			];
			data.push(temp);
		} else {
			let temp = [
				`-`,
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-',
				'-'
			];
			data.push(temp);
		}
	}

	var whichMergedCells = '[';
	whichMergedCells += '{"row":0,"col":0,"rowspan":1,"colspan":4},';
	whichMergedCells += '{"row":0,"col":4,"rowspan":1,"colspan":4},';
	whichMergedCells += '{"row":0,"col":8,"rowspan":1,"colspan":6},';
	whichMergedCells += '{"row":0,"col":14,"rowspan":1,"colspan":4}]';

	function gghClick() {
		document.isSuccess([]);
	}

	function exportExcel(table) {
		// 엑셀
		let exportPlugin = table.getPlugin('exportFile');
		exportPlugin.downloadFile('csv', {
			bom: true,
			columnDelimiter: ',',
			exportHiddenColumns: false,
			exportHiddenRows: true,
			fileExtension: 'csv',
			filename: 'LChistory_[YYYY]-[MM]-[DD]',
			mimeType: 'text/csv',
			rowDelimiter: '\r\n',
			rowHeaders: false
		});
	}

	function exportPDF(table) {
		const newWin = window.open('');
		newWin.document.write(table.toHTML());

		let link = newWin.document.createElement('link');
		link.href = 'stylesheets/main/pdfStyle.css';
		link.rel = 'stylesheet';
		newWin.document.getElementsByTagName('head')[0].append(link);

		setTimeout(function () {
			newWin.print();
			newWin.close();
		});
	}

	function exportClib(table) {
		// 클립보드
		const plugin = table.getPlugin('exportFile');
		const string = plugin.exportAsString('csv');

		let t = document.createElement('textarea');
		document.body.appendChild(t);
		t.value = string;
		t.select();
		document.execCommand('copy');
		document.body.removeChild(t);
		document.createMsg('복사되었습니다.');
	}

	onMount(() => {
		table1.updateSettings({ mergeCells: JSON.parse(whichMergedCells) });
	});
</script>

<div class="srhtap_h">
	<Searcher width="100%" />
	<div />
	<input type="datetime-local" bind:value={stats.value1} />
	<div class="during">~</div>
	<input type="datetime-local" bind:value={stats.value2} />
	<div />
	<Button bind:this={elems.btn} on:click={gghClick} icon="search" colored={true}>조회</Button>
</div>
<div class="tabletap_h">
	<Table
		bind:wrapper={elems.table1}
		bind:table={table1}
		{data}
		option={{
			renderer: 'html',
			rowHeaders: false,
			readOnly: true,
			fixedRowsTop: 2,
			height: '100%',
			colWidths: function (i) {
				if (i == 0) {
					return '72px';
				} else if (i == 11) {
					return '54px';
				} else {
					return '40px';
				}
			}
		}}
	/>
</div>

<style>
	input[type='datetime-local'] {
		height: calc(100% - 2px);
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.3rem;
		color: #0584fe;
	}

	.tabletap_h {
		height: calc(100% - 49px);
	}

	.tabletap_h :global(.hansontable .wtHider) {
		overflow-x: hidden;
		overflow-y: auto;
	}

	.tabletap_h :global(.handsontable td) {
		color: #777777;
		overflow: hidden;
		height: 33px;
	}

	.tabletap_h :global(.handsontable tr:first-child td) {
		color: #999999;
		background: #f4f7f9;
		height: 25px;
		border-top: 0px !important;
		border-left: 0px !important;
		border-right: 0px !important;
	}

	.tabletap_h :global(.handsontable tr:nth-child(2) td) {
		color: #999999;
		background: #f4f7f9;
		line-height: 13px;
		height: 31px;
		border-top: 0px !important;
		border-left: 0px !important;
		border-right: 0px !important;
	}

	.tabletap_h :global(.tableWrapper .handsontable tr:nth-child(2) td:first-child),
	.tabletap_h :global(.tableWrapper .handsontable tr:first-child td:first-child) {
		font-size: 1.3rem !important;
	}

	.tabletap_h :global(.handsontable tr:first-child td:nth-child(1)),
	.tabletap_h :global(.handsontable tr:first-child td:nth-child(5)),
	.tabletap_h :global(.handsontable tr:first-child td:nth-child(9)),
	.tabletap_h :global(.handsontable tr:nth-child(2) td:nth-child(4)),
	.tabletap_h :global(.handsontable tr:nth-child(2) td:nth-child(8)),
	.tabletap_h :global(.handsontable tr:nth-child(2) td:nth-child(14)) {
		border-right: 1px solid #edeef0 !important;
	}

	.srhtap_h {
		display: grid;
		margin-top: 5px;
		margin-bottom: 10px;
		align-items: end;
		grid-template-columns: 21% 10px 17% 15px 17% calc(37.5% - 25px) 7.5%;
	}

	.during {
		text-align: center;
		line-height: 34px;
	}

	.tabletap_h :global(.tableWrapper .htCore tr:first-child th) {
		border: 1px solid #e6eaed;
		background-color: #f0f3f8;
	}
</style>
