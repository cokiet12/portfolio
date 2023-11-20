<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { devuimode, pageWidth, EventTable3, EventSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import Select from '$lib/nested/dropdown.svelte';

	$: if ($EventTable3 == 1) {
		console.log('검지기 엑셀 저장 클릭');
		exportExcel(table1);
		$EventTable3 = 0;
	}

	$: if ($EventTable3 == 2) {
		console.log('검지기 PDF 저장/인쇄 클릭');
		exportPDF(table1);
		$EventTable3 = 0;
	}

	$: if ($EventTable3 == 3) {
		console.log('검지기 데이터 복사 클릭');
		exportClib(table1);
		$EventTable3 = 0;
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
	let param = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	let SelectedLcno = 0;
	let LcName = null;

	$: searchEvent(param);

	function searchEvent(stat) {
		console.log(stat.lcno);
		SelectedLcno = stat.lcno;
		LcName = document.lcCon.LCs[SelectedLcno].lcname;
	}

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
	for (let i = 0; i < 12; i++) {
		let temp = [``, '', '', '', '', ''];
		data.push(temp);
	}

	let data2 = new Array();
	for (let i = 0; i < 23; i++) {
		let temp = [``, '', '', '', '', ''];
		data2.push(temp);
	}

	function TargetName(l_code, target_no, target_name) {
		if (l_code == 1 || l_code == 3) {
			return document.lcCon.LCs[target_no].lcname;
		} else {
			return target_name;
		}
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
			filename: 'TfEvent_[YYYY]-[MM]-[DD]',
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

	function TfClick() {
		const starttime = stats.value1.replace('T', ' ');
		const endtime = stats.value2.replace('T', ' ');
		let result = {
			starttime: starttime,
			endtime: endtime,
			leventtype: 3,
			lcno: SelectedLcno,
			mname: '-1',
			userid: -1,
			sname: -1
		};
		console.log(result);
		ajax('/NTCS_L_EVENT/GetLog', 'POST', result).then((res) => {
			const arr = new Array();

			res.forEach((v, i) => {
				let _arr = new Array();
				_arr[0] = v.cre_date.split('.')[0].replace('T', '\n');
				_arr[1] = v.target_no;
				_arr[2] = TargetName(v.l_code, v.target_no, v.target_name);
				_arr[3] = v.m_name;
				_arr[4] = v.s_name;
				_arr[5] = v.explain;
				arr.push(_arr);
			});

			if (arr.length) {
				table1.loadData(arr);
				document.isSuccess(res);
			} else {
				if ($EventSize == 1) {
					table1.loadData(data2);
					document.isSuccess(res);
				} else {
					table1.loadData(data);
					document.isSuccess(res);
				}
			}
		});
	}

	onMount(() => {});
</script>

<div class="EntireDiv {$EventSize == 1 ? '_big' : ''}">
	<div class="TfrhEvt">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<Searcher
			onChoose={(no) => {
				param = no;
			}}
			width="100%"
		/>
		<div />
		<input type="datetime-local" bind:value={stats.value1} />
		<div class="during">~</div>
		<input type="datetime-local" bind:value={stats.value2} />
		<div />
		<Button bind:this={elems.btn} colored="blue" icon="search" on:click={TfClick}>조회</Button>
	</div>
	<div />
	<div class="TableTvt">
		<Table
			bind:wrapper={elems.table1}
			bind:table={table1}
			colheader={['발생 시각', '대상 ID', '대상 이름', '발생이벤트', '이벤트 상세', '이벤트 설명']}
			data={data2}
			option={{
				renderer: 'html',
				rowHeights: 34,
				colWidths: ['75px', '38px', '136px', '130px', '137px', '136px'],
				readOnly: true,
				height: '100%'
			}}
		/>
	</div>
</div>

<style>
	.EntireDiv {
		height: 100%;
		display: grid;
		grid-template-rows: 7% 5px calc(93% - 5px);
		margin-top: 5px;
	}

	.EntireDiv._big {
		height: 100%;
		display: grid;
		grid-template-rows: 34px 10px calc(100% - 49px);
	}

	.TfrhEvt {
		display: grid;
		grid-template-columns: 21% 10px 16% 15px 16% calc(39% - 25px) 8%;
	}

	input[type='datetime-local'] {
		height: calc(100% - 2px);
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.2rem;
		color: #0584fe;
	}

	.TableTvt {
		height: 100%;
		overflow: auto;
	}

	.TableTvt :global(.handsontable td) {
		color: #777777;
	}

	.TableTvt :global(.handsontable tr td:first-child) {
		font-size: 1.2rem;
	}

	.during {
		text-align: center;
		line-height: 34px;
	}
</style>
