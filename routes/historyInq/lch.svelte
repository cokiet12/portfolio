<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { HisTable, HisSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	$: if ($HisTable[0] == 1) {
		console.log('교차로이력 엑셀 저장 클릭');
		exportExcel(table1);
		$HisTable[0] = 0;
	}

	$: if ($HisTable[0] == 2) {
		console.log('교차로이력 PDF 저장/인쇄 클릭');
		exportPDF(table1);
		$HisTable[0] = 0;
	}

	$: if ($HisTable[0] == 3) {
		console.log('교차로이력 데이터 복사 클릭');
		exportClib(table1);
		$HisTable[0] = 0;
	}

	const consts = {};
	let stats = {
		value1: null,
		value2: null,
		value3: null
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

	data.push([
		'생성 일시',
		'교차로번호',
		'제어<br>모드',
		'주기',
		'옵셋',
		'링',
		'현시',
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'보행',
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'우선신호',
		'',
		''
	]);
	data.push([
		'',
		'',
		'',
		'',
		'',
		'',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'현시',
		'점멸',
		'RED'
	]);

	for (let i = 0; i < 30; i++) {
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
				``,
				'',
				'',
				'',
				'',
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
				'-',
				'-',
				'',
				''
			];
			data.push(temp);
		}
	}

	var whichMergedCells = '[';
	for (let i = 0; i < 16; i++) {
		if (i == 0) {
			whichMergedCells += '{"row":0,"col":0,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":0,"col":1,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":0,"col":2,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":0,"col":3,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":0,"col":4,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":0,"col":5,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":0,"col":6,"rowspan":1,"colspan":8},';
			whichMergedCells += '{"row":0,"col":14,"rowspan":1,"colspan":8},';
			whichMergedCells += '{"row":0,"col":22,"rowspan":1,"colspan":3},';
		} else if (i == 15) {
			whichMergedCells += '{"row":' + i * 2 + ',"col":0,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":1,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":2,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":3,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":4,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":23,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":24,"rowspan":2,"colspan":1}]';
		} else {
			whichMergedCells += '{"row":' + i * 2 + ',"col":0,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":1,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":2,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":3,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":4,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":23,"rowspan":2,"colspan":1},';
			whichMergedCells += '{"row":' + i * 2 + ',"col":24,"rowspan":2,"colspan":1},';
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

	function type_cntlmode(a) {
		const b = Number(a);
		if (b == 1) {
			return '로컬';
		} else if (b == 2) {
			return '로컬<br>감응';
		} else if (b == 0) {
			return 'SCU';
		} else if (b == 4) {
			return '센터<br>감응';
		} else {
			return '센터';
		}
	}

	function lchClick() {
		const starttime = stats.value1.replace('T', ' ');
		const endtime = stats.value2.replace('T', ' ');
		console.log(starttime);
		console.log(endtime);
		ajax(
			'/NTCS_L_OPERATERST/GetLog' +
				`?starttime=${starttime}&endtime=${endtime}&lcno=${SelectedLcno}`
		).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				let optionM = [];

				for (let i = 0; i < lens + 1; i++) {
					if (i == 0) {
						optionM.push({ row: 0, col: 0, rowspan: 2, colspan: 1 });
						optionM.push({ row: 0, col: 1, rowspan: 2, colspan: 1 });
						optionM.push({ row: 0, col: 2, rowspan: 2, colspan: 1 });
						optionM.push({ row: 0, col: 3, rowspan: 2, colspan: 1 });
						optionM.push({ row: 0, col: 4, rowspan: 2, colspan: 1 });
						optionM.push({ row: 0, col: 5, rowspan: 2, colspan: 1 });
						optionM.push({ row: 0, col: 6, rowspan: 1, colspan: 8 });
						optionM.push({ row: 0, col: 14, rowspan: 1, colspan: 8 });
						optionM.push({ row: 0, col: 22, rowspan: 1, colspan: 3 });
					} else if (i == lens) {
						optionM.push({ row: i * 2, col: 0, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 1, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 2, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 3, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 4, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 23, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 24, rowspan: 2, colspan: 1 });
					} else {
						optionM.push({ row: i * 2, col: 0, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 1, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 2, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 3, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 4, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 23, rowspan: 2, colspan: 1 });
						optionM.push({ row: i * 2, col: 24, rowspan: 2, colspan: 1 });
					}
				}

				const arr = new Array();
				res.forEach((v, i) => {
					console.log(v);
					let _arrA = [];
					let _arrB = [];

					if (i == 0) {
						arr.push([
							'생성 일시',
							'교차로번호',
							'제어<br>모드',
							'주기',
							'옵셋',
							'링',
							'현시',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'보행',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'우선신호',
							'',
							''
						]);
						arr.push([
							'',
							'',
							'',
							'',
							'',
							'',
							'1',
							'2',
							'3',
							'4',
							'5',
							'6',
							'7',
							'8',
							'1',
							'2',
							'3',
							'4',
							'5',
							'6',
							'7',
							'8',
							'현시',
							'점멸',
							'RED'
						]);
					}

					if (v.CREDATE != undefined) {
						_arrA[0] = v.CREDATE.replace('T', ' ');
					} else {
						_arrA[0] = '';
					}
					_arrA[1] = v.lcno;
					if (v.CNTLMODE != undefined) {
						_arrA[2] = type_cntlmode(v.CNTLMODE);
					} else {
						console.log('out');
						_arrA[2] = '';
					}
					_arrA[3] = v.CYCLE;
					_arrA[4] = v.OFFSET;
					_arrA[5] = 'A링';
					_arrA[6] = v.ASPLIT1;
					_arrA[7] = v.ASPLIT2;
					_arrA[8] = v.ASPLIT3;
					_arrA[9] = v.ASPLIT4;
					_arrA[10] = v.ASPLIT5;
					_arrA[11] = v.ASPLIT6;
					_arrA[12] = v.ASPLIT7;
					_arrA[13] = v.ASPLIT8;
					_arrA[14] = v.PASPLIT1;
					_arrA[15] = v.PASPLIT2;
					_arrA[16] = v.PASPLIT3;
					_arrA[17] = v.PASPLIT4;
					_arrA[18] = v.PASPLIT5;
					_arrA[19] = v.PASPLIT6;
					_arrA[20] = v.PASPLIT7;
					_arrA[21] = v.PASPLIT8;
					_arrA[22] = v.PPC_APHASE;
					_arrA[23] = v.PPC_FLASH;
					_arrA[24] = v.PPC_ALLRED;

					_arrB[0] = '';
					_arrB[1] = '';
					_arrB[2] = '';
					_arrB[3] = '';
					_arrB[4] = '';
					_arrB[5] = 'B링';
					_arrB[6] = v.BSPLIT1;
					_arrB[7] = v.BSPLIT2;
					_arrB[8] = v.BSPLIT3;
					_arrB[9] = v.BSPLIT4;
					_arrB[10] = v.BSPLIT5;
					_arrB[11] = v.BSPLIT6;
					_arrB[12] = v.BSPLIT7;
					_arrB[13] = v.BSPLIT8;
					_arrB[14] = v.PBSPLIT1;
					_arrB[15] = v.PBSPLIT2;
					_arrB[16] = v.PBSPLIT3;
					_arrB[17] = v.PBSPLIT4;
					_arrB[18] = v.PBSPLIT5;
					_arrB[19] = v.PBSPLIT6;
					_arrB[20] = v.PBSPLIT7;
					_arrB[21] = v.PBSPLIT8;
					_arrB[22] = v.PPC_BPHASE;
					_arrB[23] = '';
					_arrB[24] = '';

					arr.push(_arrA);
					arr.push(_arrB);
				});
				console.log(arr);
				table1.loadData(arr);
				console.log(JSON.parse(whichMergedCells));
				document.isSuccess(res);
				//table1.updateSettings( { mergeCells: JSON.parse(whichMergedCells) });
			} else {
				console.log('데이터가 없다');
				table1.loadData(data);
				table1.clear();
				document.isSuccess(res);
			}
		});
	}

	onMount(() => {
		table1.updateSettings({ mergeCells: JSON.parse(whichMergedCells) });
	});
</script>

<div class="srhtap_h">
	<Searcher
		width="100%"
		bind:value={stats.value3}
		onChoose={(no) => {
			param = no;
		}}
	/>
	<div />
	<input type="datetime-local" bind:value={stats.value1} />
	<div class="during">~</div>
	<input type="datetime-local" bind:value={stats.value2} />
	<div />
	<Button icon="search" bind:this={elems.btn} on:click={lchClick} colored={true}>조회</Button>
</div>
<div class="tabletap_h">
	<Table
		bind:wrapper={elems.table1}
		bind:table={table1}
		{data}
		option={{
			renderer: 'html',
			rowHeaders: false,
			fixedRowsTop: 2,
			colWidths: function (i) {
				if (i == 0) {
					return '68px';
				} else if (i == 2) {
					return '40px';
				} else if (i == 22 || i == 23 || i == 24) {
					return '29px';
				} else if (i == 1) {
					return '40px';
				} else if (i == 3 || i == 4) {
					return '30px';
				} else {
					return '33px';
				}
			},
			// nestedHeaders: [
			//     ['&nbsp;생성 일시&nbsp;','교차로<br>번호','&nbsp;제어모드&nbsp;','주기','옵셋','&nbsp;링&nbsp;','1현시','2현시','3현시','4현시','5현시','6현시','7현시','8현시','1보행','2보행','3보행','4보행','5보행','6보행','7보행','8보행','우선신호<br>현시','우선신호<br>점멸','우선신호<br>ALL RED']
			// ],
			readOnly: true,
			renderAllRows: true,
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

	.tabletap_h :global(.tableWrapper .handsontable tr:first-child td:first-child) {
		font-size: 1.3rem !important;
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

	.tabletap_h :global(.handsontable tr:first-child td),
	.tabletap_h :global(.handsontable tr:nth-child(2) td) {
		color: #999999;
		background: #f4f7f9;
		height: 27px;
		border-top: 0px !important;
		border-left: 0px !important;
		border-right: 0px !important;
	}

	.tabletap_h :global(.handsontable tr:first-child td:nth-child(6)),
	.tabletap_h :global(.handsontable tr:first-child td:nth-child(7)),
	.tabletap_h :global(.handsontable tr:first-child td:nth-child(15)),
	.tabletap_h :global(.handsontable tr:nth-child(2) td:nth-child(14)),
	.tabletap_h :global(.handsontable tr:nth-child(2) td:nth-child(22)) {
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
</style>
