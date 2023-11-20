<svelte:options accessors />

<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { HisTable, HisSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;

	const consts = {};
	let stats = {
		value1: null,
		value2: null,
		value3: null
	};
	let elems = {
		table1: null,
		btn: null,
		tag: null,
		img: null,
		Excel: null,
		btn1: null,
		btn2: null,
		btn3: null
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
		'교차로<br>번호',
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
					let _arrA = [];
					let _arrB = [];

					if (i == 0) {
						arr.push([
							'생성 일시',
							'교차로<br>번호',
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
				table1.loadData(arr);
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

		elems.tag.addEventListener('mouseenter', function () {
			elems.Excel.style = 'display:grid;';
		});

		elems.Excel.addEventListener('mouseleave', function () {
			elems.Excel.style = 'display:none;';
		});

		elems.btn1.addEventListener('mouseenter', function () {
			elems.btn1.style = 'color:#fff; border-bottom: 1px #237fd2 solid; cursor:pointer;';
		});

		elems.btn1.addEventListener('mouseleave', function () {
			elems.btn1.style = 'color:#999;';
		});

		elems.btn1.addEventListener('click', function () {
			// 엑셀 저장
			exportExcel(table1);
		});

		elems.btn2.addEventListener('mouseenter', function () {
			elems.btn2.style = 'color:#fff; border-bottom: 1px #237fd2 solid; cursor:pointer;';
		});

		elems.btn2.addEventListener('mouseleave', function () {
			elems.btn2.style = 'color:#999;';
		});

		elems.btn2.addEventListener('click', function () {
			// PDF 저장/인쇄
			exportPDF(table1);
		});

		elems.btn3.addEventListener('mouseenter', function () {
			elems.btn3.style = 'color:#fff; border-bottom: 1px #237fd2 solid; cursor:pointer;';
		});

		elems.btn3.addEventListener('mouseleave', function () {
			elems.btn3.style = 'color:#999;';
		});

		elems.btn3.addEventListener('click', function () {
			// 데이터 복사
			exportClib(table1);
		});
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="search">
			<div>
				<div>
					<Searcher
						width="200px"
						bind:value={stats.value3}
						onChoose={(no) => {
							param = no;
						}}
					/>
				</div>
				<div>
					<input type="datetime-local" bind:value={stats.value1} />
				</div>
				<div>
					<div class="during">~</div>
				</div>
				<div>
					<input type="datetime-local" bind:value={stats.value2} />
				</div>
				<div>
					<Button
						height={'30px'}
						icon="search"
						bind:this={elems.btn}
						on:click={lchClick}
						colored={true}
						width="80">조회</Button
					>
				</div>
			</div>
			<div>
				<div bind:this={elems.tag} class="imgtag">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img bind:this={elems.img} src={'/svg/button/print.svg'} alt="icon" />
				</div>
				<div bind:this={elems.Excel} class="ExcelBtn" style="display:none;">
					<div bind:this={elems.btn1} class="divbtn">엑셀 저장</div>
					<div bind:this={elems.btn2} class="divbtn">PDF 저장/인쇄</div>
					<div bind:this={elems.btn3} class="divbtn">데이터 복사</div>
				</div>
			</div>
		</div>
		<div class="table">
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
		width: 1200px;
		height: 900px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}

	.EntireDiv .search {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 10px;
		/* align-items: end;
            justify-content: end; */
	}

	.EntireDiv .search > div:nth-child(1) {
		display: grid;
		grid-template-columns: 200px max-content 10px max-content 80px auto;
		grid-column-gap: 10px;
		/* align-items: end;
                justify-content: end; */
	}

	.EntireDiv .search > div:nth-child(2) {
		display: grid;
		justify-content: end;
		justify-items: end;
	}

	input[type='datetime-local'] {
		height: calc(100% - 2px);
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.3rem;
		color: #0584fe;
	}

	/* Handsontable */
	/* overflow시 스크롤 */
	/* 창모드 */
	#main.win :global(.tableWrapper > .ht_master > .wtHolder) {
		overflow-x: hidden;
		overflow-y: auto;
	}

	/* 싱글, 듀얼모드 */
	#main.modal :global(.tableWrapper > .ht_master > .wtHolder) {
		overflow: auto;
	}

	#main :global(.handsontable tr th) {
		color: #666;
		background: #181d23;
	}

	#main :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}

	.EntireDiv .search > div:nth-child(1) > div:nth-child(2),
	.EntireDiv .search > div:nth-child(1) > div:nth-child(4) {
		border: 1px solid #212830;
		background-color: #212830;
	}

	.EntireDiv .search > div:nth-child(1) > div:nth-child(2) :global(input),
	.EntireDiv .search > div:nth-child(1) > div:nth-child(4) :global(input) {
		color: #fff;
		border: 1px solid #212830;
		background-color: #212830;
	}

	.during {
		text-align: center;
		line-height: 34px;
	}

	.ExcelBtn {
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		position: absolute;
		background-color: #212830;
		margin-top: 47px;
		width: 100px;
		height: 80px;
		border-radius: 5px;
		z-index: 110;
		top: 24px;
	}

	.divbtn {
		/* line-height: 26.66px; */
		margin: auto;
		font-style: bold;
	}

	.imgtag {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 34px;
		height: 32px;
		line-height: 34px;
		text-align: center;
		border-radius: 5px;
		background-color: #000;
	}

	img {
		width: 20px;
		height: 20px;
	}
</style>
