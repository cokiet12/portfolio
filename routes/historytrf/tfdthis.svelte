<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { TrfTable, TrfSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';

	$: if ($TrfTable[3] == 1) {
		exportExcel(table2);
		$TrfTable[3] = 0;
	}

	$: if ($TrfTable[3] == 2) {
		exportPDF(table2);
		$TrfTable[3] = 0;
	}

	$: if ($TrfTable[3] == 3) {
		exportClib(table2);
		$TrfTable[3] = 0;
	}

	const consts = {};
	let stats = {
		isSmall4: false,
		value1: null,
		value2: null
	};
	let elems = {
		table1: null,
		table2: null,
		btn1: null,
		btn2: null
	};
	let param = {
		lcno: 1,
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
	export let table2;

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

	let result_len = 0;

	let data = new Array();
	for (let i = 0; i < 10; i++) {
		let temp = [`-`, '-', '-', '-', '-', '-', '-', '-', '-', '-', ''];
		data.push(temp);
	}

	let data2 = new Array();

	data2.push([
		'발생 시각',
		'채널',
		'점유',
		'비점유',
		'교통량',
		'카드실장',
		'단선여부',
		'ANALOG<br>오류여부',
		'DIGITAL<br>오류여부',
		'비점유<br>오류여부',
		'점유<br>오류여부',
		'교통량<br>오류여부'
	]);
	for (let i = 0; i < 11; i++) {
		let temp = [`-`, '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
		data2.push(temp);
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

	function type_jd(a) {
		// 유형 판별

		const b = Number(a);

		switch (b) {
			case 0:
				return '1.8x1.8';
			case 1:
				return '4.0x1.8';
			case 2:
				return '원형';
			case 3:
				return 'LONG LOOP';
			case 4:
				return '점형 검지기';
			case 5:
				return '영상';
			case 6:
				return '기타';
		}
	}

	function use_js(a) {
		// 용도 판별

		switch (a) {
			case 1:
				return '직진';
			case 2:
				return '좌회전';
			case 3:
				return '대기행렬';
			case 4:
				return '앞막힘';
			case 5:
				return '좌회전대기';
			case 6:
				return '기타';
			case 7:
				return '쌍루프(상류)';
			case 8:
				return '쌍루프(하류)';
		}
	}

	function ring_jd(a) {
		// 링 판별 1 : A링 2: B링

		if (a == 1) {
			return 'A링';
		} else {
			return 'B링';
		}
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

	function type_status_1(a) {
		const b = Number(a);
		if (b == 0) {
			return '실장';
		} else {
			return '실장 안됨';
		}
	}

	function type_status_2(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return '단선';
		}
	}

	function type_status_3(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return '단락';
		}
	}

	function type_status_4(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return '발진 이상';
		}
	}

	function type_err(a) {
		const b = Number(a);
		if (b == 0) {
			return '정상';
		} else {
			return 'ERROR';
		}
	}

	function btn1() {
		ajax(`/NTCS_M_TFDTOPERATE/GetBy?LCNO=${SelectedLcno}`).then((res) => {
			const lens = res.length;

			if (lens > 0) {
				const arr = new Array();
				res.forEach((v, i) => {
					const _arr = new Array();
					if (v.tfdt_regflag == 1) {
						_arr[0] = v.int_lcno;
						_arr[1] = v.tfdt_no;
						if (v.tfdt_type != undefined) {
							_arr[2] = type_jd(v.tfdt_type);
						} else {
							_arr[2] = '';
						}
						if (v.tfdt_use != undefined) {
							_arr[3] = use_js(v.tfdt_use);
						} else {
							_arr[3] = '';
						}
						if (v.tfdt_ring != undefined) {
							_arr[4] = ring_jd(v.tfdt_ring);
						} else {
							_arr[4] = '';
						}
						if (v.tfdt_phase != undefined) {
							_arr[5] = v.tfdt_phase;
						} else {
							_arr[5] = '';
						}
						if (v.tfdt_dir != undefined) {
							_arr[6] = type_dir(v.tfdt_dir);
						} else {
							_arr[6] = '';
						}
						if (v.tfdt_iodir != undefined) {
							_arr[7] = v.tfdt_iodir;
						} else {
							_arr[7] = '';
						}
						if (v.tfdt_lane != undefined) {
							_arr[8] = v.tfdt_lane;
						} else {
							_arr[8] = '';
						}
						if (v.tfdt_position != undefined) {
							_arr[9] = v.tfdt_position;
						} else {
							_arr[9] = '';
						}
						_arr[10] = false;

						arr.push(_arr);
					}
				});
				if (arr.length) {
					result_len = arr.length;
					table1.loadData(arr);
					document.isSuccess(res);
				} else {
					table1.loadData(data);
					document.isSuccess([]);
				}
			} else {
				table1.loadData(data);
				document.isSuccess(res);
			}
		});
	}

	function btn2() {
		if (result_len != 0) {
			const str = [
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0
			];
			let cnt = 0;

			for (var i = 0; i < result_len; i++) {
				if (table1.getDataAtCell(i, 10) == true) {
					str[table1.getDataAtCell(i, 1) - 1] = 1;
					cnt++;
				}
			}

			if (cnt == 0) {
				document.createMsg('검지기 선택을 해주세요');
			} else {
				const a = str.toString().replaceAll(',', '');
				console.log(a);
				const tfdt_bit = parseInt(a, 2);
				const starttime = stats.value1.replace('T', ' ');
				const endtime = stats.value2.replace('T', ' ');

				ajax(
					`/NTCS_L_TFDT/GetLog?fromDate=${starttime}&toDate=${endtime}&TFDT_NO=${tfdt_bit}&INT_LCNO=${SelectedLcno}`
				).then((res) => {
					const lens = res.length;
					console.log(res);
					if (lens > 0) {
						const arr = new Array();
						arr.push([
							'발생 시각',
							'채널',
							'점유',
							'비점유',
							'교통량',
							'카드실장',
							'단선여부',
							'ANALOG<br>오류여부',
							'DIGITAL<br>오류여부',
							'비점유<br>오류여부',
							'점유<br>오류여부',
							'교통량<br>오류여부'
						]);
						res.forEach((v, i) => {
							let _arrs = new Array();
							if (v.tfdt_credate != undefined) {
								_arrs[0] = v.tfdt_credate.replace('T', '\n');
							} else {
								_arrs[0] = '';
							}
							_arrs[1] = v.tfdt_no;
							_arrs[2] = v.tfdt_occ;
							_arrs[3] = v.tfdt_nocc;
							_arrs[4] = v.tfdt_wghvol;
							if (v.tfdt_status1 != undefined) {
								_arrs[5] = type_status_1(v.tfdt_status1);
							} else {
								_arrs[5] = '';
							}
							if (v.tfdt_status2 != undefined) {
								_arrs[6] = type_status_2(v.tfdt_status2);
							} else {
								_arrs[6] = '';
							}
							if (v.tfdt_status3 != undefined) {
								_arrs[7] = type_status_3(v.tfdt_status3);
							} else {
								_arrs[7] = '';
							}
							if (v.tfdt_status4 != undefined) {
								_arrs[8] = type_status_4(v.tfdt_status4);
							} else {
								_arrs[8] = '';
							}
							if (v.tfdt_status5 != undefined) {
								_arrs[9] = type_err(v.tfdt_status5);
							} else {
								_arrs[9] = '';
							}
							if (v.tfdt_status6 != undefined) {
								_arrs[10] = type_err(v.tfdt_status6);
							} else {
								_arrs[10] = '';
							}
							if (v.tfdt_status7 != undefined) {
								_arrs[11] = type_err(v.tfdt_status7);
							} else {
								_arrs[11] = '';
							}
							arr.push(_arrs);
						});
						table2.loadData(arr);
						document.isSuccess(res);
					} else {
						table2.loadData(data2);
						document.isSuccess(res);
					}
				});
			}
		} else {
			document.createMsg('검지기 검색을 먼저 해주세요');
		}
	}
</script>

<div class="entireDiv {$TrfSize == 1 ? '_big' : ''}">
	<div class="title">검지기 리스트</div>
	<div class="FirstDiv">
		<div class="search">
			<div />
			<Searcher
				onChoose={(no) => {
					param = no;
				}}
				width="100%"
			/>
			<div />
			<Button bind:this={elems.btn1} icon="search" on:click={btn1} colored={true}>조회</Button>
			<div />
		</div>
		<div />
		<div class="Htable1">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				colheader={[
					'교차로ID',
					'채널',
					'유형',
					'용도',
					'링',
					'현시',
					'방향',
					'유출입',
					'설치차선',
					'위치(0.1*N)',
					'조회'
				]}
				{data}
				option={{
					colWidths: [
						'73px',
						'73px',
						'83px',
						'83px',
						'73px',
						'73px',
						'73px',
						'73px',
						'73px',
						'83px',
						'65px'
					],
					renderer: 'html',
					rowHeaders: false,
					rowHeights: 27,
					height: '100%',
					readOnly: true,
					cells: function (row, col, prop) {
						var cellProperties = {};

						if (col == 10 && row >= 0) {
							cellProperties.type = 'checkbox';
							cellProperties.readOnly = false;
						}
						return cellProperties;
					}
				}}
			/>
		</div>
	</div>
	<div class="title">검지기 이력</div>
	<div class="SecondDiv">
		<div class="Period">
			<div />
			<input type="datetime-local" bind:value={stats.value1} />
			<div class="during">~</div>
			<input type="datetime-local" bind:value={stats.value2} />
			<div />
			<Button icon="search" on:click={btn2} colored={true}>조회</Button>
		</div>
		<div />
		<div class="Htable2">
			<Table
				bind:wrapper={elems.table2}
				bind:table={table2}
				data={data2}
				option={{
					colWidths: [
						'73px',
						'61px',
						'61px',
						'61px',
						'61px',
						'71px',
						'71px',
						'71px',
						'72px',
						'72px',
						'71px',
						'71px'
					],
					renderer: 'html',
					rowHeaders: false,
					rowHeights: 34,
					readOnly: true,
					fixedRowsTop: 1,
					height: '100%'
				}}
			/>
		</div>
	</div>
</div>

<style>
	input[type='datetime-local'] {
		height: 34px;
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.3rem;
		color: #0584fe;
	}

	.entireDiv {
		height: 100%;
		display: grid;
		grid-template-rows: 5% 39% 5% 51%;
		overflow: auto;
	}

	.entireDiv._big {
		height: 100%;
		display: grid;
		grid-template-rows: 4% 40% 4% 52%;
		overflow: auto;
	}

	.FirstDiv {
		display: grid;
		grid-template-rows: 44px 5px calc(100% - 49px);
		border: 1px solid #dadde1;
		border-radius: 4px;
	}

	.SecondDiv {
		display: grid;
		grid-template-rows: 44px 5px calc(100% - 49px);
		border: 1px solid #dadde1;
		border-radius: 4px;
	}

	.title {
		filter: brightness(75%);
		margin-left: 0.5%;
		font-size: 1.3rem;
		line-height: 36px;
		color: #e9eaeb;
		align-items: end;
	}

	.search {
		display: grid;
		grid-template-columns: 5px 21% calc(79% - 81px) 71px 5px;
		align-items: end;
	}

	.Period {
		display: grid;
		grid-template-columns: 5px 17% 15px 17% calc(66% - 96px) 71px 5px;
		align-items: end;
		overflow: auto;
	}

	.Htable1 {
		height: 100%;
		margin: 0px 5px 0 5px;
		overflow: auto;
	}

	.Htable1 :global(.hansontable .wtHider) {
		overflow-x: hidden;
		overflow-y: auto;
	}

	.Htable1 :global(.handsontable tr td:first-child),
	.Htable2 :global(.tableWrapper .handsontable tr:first-child td:first-child) {
		font-size: 1.3rem !important;
	}

	.Htable2 {
		height: 100%;
		margin: 0 5px 0 5px;
		overflow: auto;
	}

	.Htable2 :global(.hansontable .wtHider) {
		overflow-x: hidden;
		overflow-y: auto;
	}

	.Htable2 :global(.handsontable tr:first-child td) {
		color: #999999;
		background: #f4f7f9;
		height: 33px;
		border: 0px !important;
		border-bottom: 1px solid #edeef0 !important;
	}

	.during {
		text-align: center;
		line-height: 34px;
	}
</style>
