<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { TrfTable, TrfSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	$: if ($TrfTable[4] == 1) {
		exportExcel(table1);
		$TrfTable[4] = 0;
	}

	$: if ($TrfTable[4] == 2) {
		exportPDF(table1);
		$TrfTable[4] = 0;
	}

	$: if ($TrfTable[4] == 3) {
		exportClib(table1);
		$TrfTable[4] = 0;
	}

	const consts = {};
	let stats = {
		isSmallast: false,
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

	// let starttime = "2022-09-26 07:54:05";
	// let endtime = "2022-09-30 07:54:05";

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
	for (let i = 0; i < 23; i++) {
		let temp = [`-`, '-', '-', '-', '-', '-', '-', '-', '-', '-'];
		data.push(temp);
	}

	let option = [
		{ id: 1, text: '15분' },
		{ id: 2, text: '1시간' },
		{ id: 3, text: '1일' },
		{ id: 4, text: '한 달' }
	];

	let selected = 1;

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

	function tfdfStaticClick() {
		const starttime = stats.value1.replace('T', ' ');
		const endtime = stats.value2.replace('T', ' ');
		switch (selected) {
			case 1:
				ajax(
					`/NTCS_S_TFDTTRAFFIC/MIN?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;

					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_TF = new Array();
							if (v.tfdt_credate != undefined) {
								arr_TF[0] = v.tfdt_credate.replace('T', '\n');
							} else {
								arr_TF[0] = '';
							}
							arr_TF[1] = v.lcno;
							arr_TF[2] = LcName;
							arr_TF[3] = v.tfdt_no;
							arr_TF[4] = v.tfdt_smt;
							arr_TF[5] = v.tfdt_sfr;
							arr_TF[6] = v.tfdt_occ;
							arr_TF[7] = v.tfdt_nocc;
							arr_TF[8] = v.tfdt_spd;
							arr_TF[9] = v.tfdt_ds;

							arr.push(arr_TF);
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
					`/NTCS_S_TFDTTRAFFIC/HOUR?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;

					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_TF = new Array();
							if (v.tfdt_credate != undefined) {
								arr_TF[0] = v.tfdt_credate.replace('T', '\n');
							} else {
								arr_TF[0] = '';
							}
							arr_TF[1] = v.lcno;
							arr_TF[2] = LcName;
							arr_TF[3] = v.tfdt_no;
							arr_TF[4] = v.tfdt_smt;
							arr_TF[5] = v.tfdt_sfr;
							arr_TF[6] = v.tfdt_occ;
							arr_TF[7] = v.tfdt_nocc;
							arr_TF[8] = v.tfdt_spd;
							arr_TF[9] = v.tfdt_ds;

							arr.push(arr_TF);
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
					`/NTCS_S_TFDTTRAFFIC/DAY?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;

					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_TF = new Array();
							if (v.tfdt_credate != undefined) {
								arr_TF[0] = v.tfdt_credate.replace('T', '\n');
							} else {
								arr_TF[0] = '';
							}
							arr_TF[1] = v.lcno;
							arr_TF[2] = LcName;
							arr_TF[3] = v.tfdt_no;
							arr_TF[4] = v.tfdt_smt;
							arr_TF[5] = v.tfdt_sfr;
							arr_TF[6] = v.tfdt_occ;
							arr_TF[7] = v.tfdt_nocc;
							arr_TF[8] = v.tfdt_spd;
							arr_TF[9] = v.tfdt_ds;

							arr.push(arr_TF);
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
					`/NTCS_S_TFDTTRAFFIC/MON?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;

					const arr = new Array();

					if (lens > 0) {
						res.forEach((v, i) => {
							const arr_TF = new Array();
							if (v.tfdt_credate != undefined) {
								arr_TF[0] = v.tfdt_credate.replace('T', '\n');
							} else {
								arr_TF[0] = '';
							}
							arr_TF[1] = v.lcno;
							arr_TF[2] = LcName;
							arr_TF[3] = v.tfdt_no;
							arr_TF[4] = v.tfdt_smt;
							arr_TF[5] = v.tfdt_sfr;
							arr_TF[6] = v.tfdt_occ;
							arr_TF[7] = v.tfdt_nocc;
							arr_TF[8] = v.tfdt_spd;
							arr_TF[9] = v.tfdt_ds;

							arr.push(arr_TF);
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
	<Button on:click={tfdfStaticClick} bind:this={elems.btn} icon="search" colored={true}>조회</Button
	>
</div>
<div class="tabletap_h">
	<Table
		bind:wrapper={elems.table1}
		bind:table={table1}
		colheader={[
			'생성 일시',
			'교차로번호',
			'교차로명',
			'검지기번호',
			'포화 비점유율',
			'포화 교통류율',
			'점유',
			'비점유',
			'교통량',
			'속도',
			'포화도'
		]}
		{data}
		option={{
			colWidths: ['88px', '70px', '180px', '75px', '78px', '78px', '71px', '71px', '71px', '71px'],
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
		height: 100%;
		padding: 0 9px;
		border: none;
		margin: 0;
		color: #0584fe;
		font-size: 1.3rem;
	}
</style>
