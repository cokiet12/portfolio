<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { TrfTable, TrfSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	$: if ($TrfTable[0] == 1) {
		exportExcel(table1);
		$TrfTable[0] = 0;
	}

	$: if ($TrfTable[0] == 2) {
		exportPDF(table1);
		$TrfTable[0] = 0;
	}

	$: if ($TrfTable[0] == 3) {
		exportClib(table1);
		$TrfTable[0] = 0;
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
		lcno: -1,
		sano: 1,
		year: 2010
	};

	$: searchEvent(param);

	let SelectedLcno = 0;

	function searchEvent(stat) {
		console.log(stat.lcno);
		SelectedLcno = stat.lcno;
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
	for (let i = 0; i < 23; i++) {
		let temp = [`-`, '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
		data.push(temp);
	}

	function type_dir(a) {
		const b = Number(a);

		switch (b) {
			case 1:
				return '북';
			case 2:
				return '동';
			case 3:
				return '남';
			case 4:
				return '서';
			case 5:
				return '북동';
			case 6:
				return '남동';
			case 7:
				return '남서';
			case 8:
				return '북서';
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
			filename: 'Tfhistory_[YYYY]-[MM]-[DD]',
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

	function itiClick() {
		const starttime = stats.value1.replace('T', ' ');
		const endtime = stats.value2.replace('T', ' ');
		ajax(
			'/NTCS_L_TRAFFIC/GetLog' + `?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
		).then((res) => {
			const lens = res.length;
			const Aarr = new Array();

			if (lens > 0) {
				res.forEach((v, i) => {
					let arr = new Array();

					if (v.credate != undefined) {
						arr[0] = v.credate.replace('T', '\n');
					} else {
						arr[0] = '';
					}
					arr[1] = v.lcno;
					if (v.dir1 != undefined) {
						arr[2] = type_dir(v.dir1);
					} else {
						arr[2] = '';
					}
					if (v.dir2 != undefined) {
						arr[3] = type_dir(v.dir2);
					} else {
						arr[3] = '';
					}
					arr[4] = v.ql;
					arr[5] = v.avgspd;
					arr[6] = v.movelength;
					arr[7] = v.linklength;
					arr[8] = v.fromint;
					arr[9] = v.sumocc;
					arr[10] = v.sumnocc;
					arr[11] = v.sumvol;
					arr[12] = v.ds;
					arr[13] = v.sumsmt;

					Aarr.push(arr);
				});

				table1.loadData(Aarr);
				console.log('검색 완료');
				document.isSuccess(res);
			} else {
				console.log('Data 없음');
				table1.loadData(data);
				document.isSuccess(res);
			}
		});
	}
</script>

<div class="srhtap_h">
	<Searcher
		width="100%"
		onChoose={(no) => {
			param = no;
		}}
	/>
	<div />
	<input type="datetime-local" bind:value={stats.value1} />
	<div class="during">~</div>
	<input type="datetime-local" bind:value={stats.value2} />
	<div />
	<Button bind:this={elems.btn} on:click={itiClick} icon="search" colored={true}>조회</Button>
</div>
<div class="tabletap_h">
	<Table
		bind:wrapper={elems.table1}
		bind:table={table1}
		colheader={[
			'생성 일시',
			'교차로번호',
			'접근로방향',
			'선호방향',
			'대기길이',
			'평균속도',
			'유효이동거리',
			'링크길이',
			'출발 교차로번호',
			'점유율',
			'비점유율',
			'교통량',
			'포화도',
			'포화 비점유율'
		]}
		{data}
		option={{
			colWidths: [
				'75px',
				'60px',
				'60px',
				'57px',
				'57px',
				'57px',
				'65px',
				'57px',
				'84px',
				'50px',
				'54px',
				'50px',
				'50px',
				'77px'
			],
			renderer: 'html',
			rowHeaders: false,
			rowHeights: 34,
			readOnly: true,
			height: '100%'
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
		height: 25px;
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
</style>
