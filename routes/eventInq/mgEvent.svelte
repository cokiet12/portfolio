<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { devuimode, pageWidth, EventTable4, EventSize } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import Select from '$lib/nested/dropdown.svelte';

	$: if ($EventTable4 == 1) {
		console.log('운영자 엑셀 저장 클릭');
		exportExcel(table1);
		$EventTable4 = 0;
	}

	$: if ($EventTable4 == 2) {
		console.log('운영자 PDF 저장/인쇄 클릭');
		exportPDF(table1);
		$EventTable4 = 0;
	}

	$: if ($EventTable4 == 3) {
		console.log('운영자 데이터 복사 클릭');
		exportClib(table1);
		$EventTable4 = 0;
	}

	const consts = {};
	let stats = {
		value1: null,
		value2: null,
		checked1: false,
		checked2: false,
		checked3: false,
		checked4: false,
		checked5: false,
		checked6: false
	};
	let elems = {
		table1: null,
		btn: null,
		check: null
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
	for (let i = 0; i < 11; i++) {
		let temp = [``, '', '', '', '', ''];
		data.push(temp);
	}

	let data2 = new Array();
	for (let i = 0; i < 22; i++) {
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
			filename: 'MgEvent_[YYYY]-[MM]-[DD]',
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

	function MgClick() {
		let mname = new Array();
		if (
			stats.checked1 == false &&
			stats.checked2 == false &&
			stats.checked3 == false &&
			stats.checked4 == false &&
			stats.checked5 == false &&
			stats.checked6 == false
		) {
			mname.push(-1);
		} else if (
			stats.checked1 == true &&
			stats.checked2 == true &&
			stats.checked3 == true &&
			stats.checked4 == true &&
			stats.checked5 == true &&
			stats.checked6 == true
		) {
			mname.push(-1);
		} else {
			if (stats.checked1 == true) {
				mname.push(14);
			}
			if (stats.checked2 == true) {
				mname.push(41);
			}
			if (stats.checked3 == true) {
				mname.push(67);
			}
			if (stats.checked4 == true) {
				mname.push(68);
			}
			if (stats.checked5 == true) {
				mname.push(69);
			}
			if (stats.checked6 == true) {
				mname.push(160);
			}
		}
		let StrR = '';
		for (var i = 0; i < mname.length; i++) {
			if (i == mname.length - 1) {
				StrR += mname[i];
			} else {
				StrR += mname[i] + ',';
			}
		}
		console.log(StrR);
		const starttime = stats.value1.replace('T', ' ');
		const endtime = stats.value2.replace('T', ' ');
		let result = {
			starttime: starttime,
			endtime: endtime,
			leventtype: 4,
			lcno: -1,
			mname: StrR,
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
	<div class="MghEvt">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div class="MrSrh">
			<div class="Box1">기간</div>
			<div />
			<input type="datetime-local" bind:value={stats.value1} />
			<div class="during">~</div>
			<input type="datetime-local" bind:value={stats.value2} />
			<div />
		</div>
		<div />
		<div class="MvSrh">
			<div class="Box1">이벤트</div>
			<div />
			<div class="Check1">
				<Input type="checkbox1" bind:checked={stats.checked1}>업다운로드</Input>
				<Input type="checkbox1" bind:checked={stats.checked2}>교차로 특수제어</Input>
				<Input type="checkbox1" bind:checked={stats.checked3}>그룹 수동제어</Input>
				<Input type="checkbox1" bind:checked={stats.checked4}>그룹 모드제어</Input>
				<Input type="checkbox1" bind:checked={stats.checked5}>그룹 특수제어</Input>
				<Input type="checkbox1" bind:checked={stats.checked6}>운영자 로그인</Input>
			</div>
			<Button bind:this={elems.btn} colored="blue" icon="search" on:click={MgClick}>조회</Button>
		</div>
	</div>
	<div />
	<div class="TableMvt">
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
		grid-template-rows: 14% 10px calc(86% - 10px);
		margin-top: 5px;
	}

	.EntireDiv._big {
		height: 100%;
		display: grid;
		grid-template-rows: 78px 10px calc(100% - 93px);
	}

	.MghEvt {
		display: grid;
		grid-template-rows: calc(50% - 5px) 10px calc(50% - 5px);
	}

	.MrSrh {
		display: grid;
		grid-template-columns: 10% 10px 16% 15px 16% calc(58% - 25px);
	}

	.MvSrh {
		display: grid;
		grid-template-columns: 10% 1px calc(82% - 1px) 8%;
		align-items: center;
	}

	.Check1 {
		margin-top: 3px;
	}

	.Box1 {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 32px;
		border: 1px solid #dadde1;
		font-size: 1.3rem;
		border-radius: 4px;
	}

	input[type='datetime-local'] {
		height: calc(100% - 2px);
		border: 1px solid #dadde1;
		border-radius: 4px;
		padding: 0 2px;
		font-size: 1.2rem;
		color: #0584fe;
	}

	.TableMvt {
		height: 100%;
		overflow: auto;
	}

	.TableMvt :global(.handsontable td) {
		color: #777777;
	}

	.TableMvt :global(.handsontable tr td:first-child) {
		font-size: 1.2rem;
	}

	.during {
		text-align: center;
		line-height: 34px;
	}
</style>
