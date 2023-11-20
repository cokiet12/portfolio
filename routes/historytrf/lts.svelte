<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { TrfTable, TrfSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	$: if ($TrfTable[1] == 1) {
		exportExcel(table1);
		$TrfTable[1] = 0;
	}

	$: if ($TrfTable[1] == 2) {
		exportPDF(table1);
		$TrfTable[1] = 0;
	}

	$: if ($TrfTable[1] == 3) {
		exportClib(table1);
		$TrfTable[1] = 0;
	}

	const consts = {};
	let stats = {
		isSmall3: false,
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

	let SelectedLcno = 0;

	$: searchEvent(param);

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
		let temp = [`-`, '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
		data.push(temp);
	}

	let option = [
		{ id: 1, text: '15분' },
		{ id: 2, text: '1시간' },
		{ id: 3, text: '1일' },
		{ id: 4, text: '한 달' }
	];

	let selected = 1;

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

	function itsClick() {
		const starttime = stats.value1.replace('T', ' ');
		const endtime = stats.value2.replace('T', ' ');
		switch (selected) {
			case 1:
				ajax(
					`/NTCS_S_TRAFFIC/MIN?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;
					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_tt = new Array();
							if (v.credate != undefined) {
								arr_tt[0] = v.credate.replace('T', '\n');
							} else {
								arr_tt[0] = '';
							}
							arr_tt[1] = v.lcno;
							if (v.dir1 != undefined) {
								arr_tt[2] = type_dir(v.dir1);
							} else {
								arr_tt[2] = '';
							}
							if (v.dir2 != undefined) {
								arr_tt[3] = type_dir(v.dir2);
							} else {
								arr_tt[3] = '';
							}
							arr_tt[4] = v.ql;
							arr_tt[5] = v.spd;
							arr_tt[6] = v.movelength;
							arr_tt[7] = v.occ;
							arr_tt[8] = v.nocc;
							arr_tt[9] = v.smt;
							arr_tt[10] = v.vol;
							arr_tt[11] = v.ds;

							arr.push(arr_tt);
						});

						console.log('검색 완료');
						table1.loadData(arr);
						document.isSuccess(res);
					} else {
						console.log('데이터 없음');
						table1.loadData(data);
						document.isSuccess(res);
					}
				});
				break;

			case 2:
				ajax(
					`/NTCS_S_TRAFFIC/HOUR?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;
					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_tt = new Array();
							if (v.credate != undefined) {
								arr_tt[0] = v.credate.replace('T', '\n');
							} else {
								arr_tt[0] = '';
							}
							arr_tt[1] = v.lcno;
							if (v.dir1 != undefined) {
								arr_tt[2] = type_dir(v.dir1);
							} else {
								arr_tt[2] = '';
							}
							if (v.dir2 != undefined) {
								arr_tt[3] = type_dir(v.dir2);
							} else {
								arr_tt[3] = '';
							}
							arr_tt[4] = v.ql;
							arr_tt[5] = v.spd;
							arr_tt[6] = v.movelength;
							arr_tt[7] = v.occ;
							arr_tt[8] = v.nocc;
							arr_tt[9] = v.smt;
							arr_tt[10] = v.vol;
							arr_tt[11] = v.ds;

							arr.push(arr_tt);
						});

						console.log('검색 완료');
						table1.loadData(arr);
						document.isSuccess(res);
					} else {
						console.log('데이터 없음');
						table1.loadData(data);
						document.isSuccess(res);
					}
				});
				break;

			case 3:
				ajax(
					`/NTCS_S_TRAFFIC/DAY?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;
					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_tt = new Array();
							if (v.credate != undefined) {
								arr_tt[0] = v.credate.replace('T', '\n');
							} else {
								arr_tt[0] = '';
							}
							arr_tt[1] = v.lcno;
							if (v.dir1 != undefined) {
								arr_tt[2] = type_dir(v.dir1);
							} else {
								arr_tt[2] = '';
							}
							if (v.dir2 != undefined) {
								arr_tt[3] = type_dir(v.dir2);
							} else {
								arr_tt[3] = '';
							}
							arr_tt[4] = v.ql;
							arr_tt[5] = v.spd;
							arr_tt[6] = v.movelength;
							arr_tt[7] = v.occ;
							arr_tt[8] = v.nocc;
							arr_tt[9] = v.smt;
							arr_tt[10] = v.vol;
							arr_tt[11] = v.ds;

							arr.push(arr_tt);
						});

						console.log('검색 완료');
						table1.loadData(arr);
						document.isSuccess(res);
					} else {
						console.log('데이터 없음');
						table1.loadData(data);
						document.isSuccess(res);
					}
				});
				break;
			case 4:
				ajax(
					`/NTCS_S_TRAFFIC/MON?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;
					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_tt = new Array();
							if (v.credate != undefined) {
								arr_tt[0] = v.credate.replace('T', '\n');
							} else {
								arr_tt[0] = '';
							}
							arr_tt[1] = v.lcno;
							if (v.dir1 != undefined) {
								arr_tt[2] = type_dir(v.dir1);
							} else {
								arr_tt[2] = '';
							}
							if (v.dir2 != undefined) {
								arr_tt[3] = type_dir(v.dir2);
							} else {
								arr_tt[3] = '';
							}
							arr_tt[4] = v.ql;
							arr_tt[5] = v.spd;
							arr_tt[6] = v.movelength;
							arr_tt[7] = v.occ;
							arr_tt[8] = v.nocc;
							arr_tt[9] = v.smt;
							arr_tt[10] = v.vol;
							arr_tt[11] = v.ds;

							arr.push(arr_tt);
						});

						console.log('검색 완료');
						table1.loadData(arr);
						document.isSuccess(res);
					} else {
						console.log('데이터 없음');
						table1.loadData(data);
						document.isSuccess(res);
					}
				});
				break;
		}
	}
</script>

<div class="srhtap_h">
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
	<div class="sel">
		<select bind:value={selected} class="static">
			{#each option as i}
				<option value={i.id}>
					{i.text}
				</option>
			{/each}
		</select>
	</div>
	<div />
	<Button on:click={itsClick} bind:this={elems.btn} icon="search" colored={true}>조회</Button>
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
			'속도',
			'유효이동거리',
			'점유율',
			'비점유율',
			'유입 교통량',
			'포화도',
			'포화 비점유율'
		]}
		{data}
		option={{
			colWidths: [
				'80px',
				'71px',
				'71px',
				'71px',
				'71px',
				'60px',
				'73px',
				'60px',
				'60px',
				'71px',
				'69px',
				'75px'
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
		grid-template-columns: 21% 10px 17% 15px 17% 10px 8% calc(29.5% - 35px) 7.5%;
	}

	.during {
		text-align: center;
		line-height: 34px;
	}

	.sel {
		position: relative;
		overflow: hidden;

		height: 32px;
		font-size: 1.3rem;
		border-radius: 4px;
		border: 1px solid #dadde1;
		background-color: white;
	}

	.sel > select {
		width: 100%;
		height: calc(100% - 1px);
		padding: 0 9px;
		border: none;
		margin: 0;
		color: #0584fe;
		font-size: 1.3rem;
	}
</style>
