<svelte:options accessors />

<script>
	// @ts-nocheck

	/*
            innerHTML 초기화 해야함
            변수 설정
        */
	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';

	export let winMode = false;

	const consts = {};
	let stats = {};
	let elems = {
		table1: null,
		table2: null
	};
	let table1;
	let table2;
	let cellOption;
	let measureRenderer;

	cellOption = function (row, col, prop) {
		var cellProperties = {};
		if (col == 0) {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};

	measureRenderer = function (instance, td, row, col, prop, value, cellProperties) {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
		if (col == 1) {
			if (row == 2) {
				td.innerHTML = `${value} <span class="measureClass">[회]</span>`;
			} else {
				td.innerHTML = `${value} <span class="measureClass">[초]</span>`;
			}
		}
	};

	let serverConfigArr = [
		['제어서버 IP', ``],
		['제어서버 PORT', ``],
		['추가서버 IP', ``],
		['추가서버 PORT', ``]
	];

	let connectConfigArr = [
		['운영단말 → WAS Health Check 주기', ``],
		['WAS → 제어서버 Health Check 주기', ``],
		['무응답시 Health Check 재시도 횟수', ``],
		['제어서버 연결시도 반복주기', ``]
	];

	function systemSearch(table1, table2) {
		ajax('/SettingController/Network').then((res) => {
			if (res.length) {
				let serverConfigArr = [
					['제어서버 IP', `${res[0].control_server_ip}`],
					['제어서버 PORT', `${res[0].control_server_port}`],
					['추가서버 IP', `${res[0].extra_server_ip}`],
					['추가서버 PORT', `${res[0].extra_server_port}`]
				];

				let connectConfigArr = [
					['운영단말 → WAS Health Check 주기', `${res[0].connection_check_cycle}`],
					['WAS → 제어서버 Health Check 주기', `${res[0].ws_check_cycle}`],
					['무응답시 Health Check 재시도 횟수', `${res[0].health_check_retry}`],
					['제어서버 연결시도 반복주기', `${res[0].health_check_cycle}`]
				];

				table1.loadData(serverConfigArr);
				table2.loadData(connectConfigArr);
				document.isSuccess(res);
				/* Make Modal 구역 */
			} else {
				console.log('없습니다');
				document.isSuccess(res);
			}
		});
	}

	function systemInit(table1, table2) {
		let serverConfigArr = [
			['제어서버 IP', ``],
			['제어서버 PORT', ``],
			['추가서버 IP', ``],
			['추가서버 PORT', ``]
		];

		let connectConfigArr = [
			['운영단말 → WAS Health Check 주기', ``],
			['WAS → 제어서버 Health Check 주기', ``],
			['무응답시 Health Check 재시도 횟수', ``],
			['제어서버 연결시도 반복주기', ``]
		];

		table1.loadData(serverConfigArr);
		table2.loadData(connectConfigArr);
	}

	function systemSave(table1, table2) {
		let serverRes = table1.getSourceData();
		let connectRes = table2.getSourceData();

		if (
			serverRes[0][1] == '' ||
			serverRes[1][1] == '' ||
			serverRes[2][1] == '' ||
			serverRes[3][1] == ''
		) {
			document.createMsg('서버접속정보에 일부정보가 누락되었습니다!');
		} else if (
			connectRes[0][1] == '' ||
			connectRes[1][1] == '' ||
			connectRes[2][1] == '' ||
			connectRes[3][1] == ''
		) {
			document.createMsg('연결확인정보에 일부정보가 누락되었습니다!');
		} else {
			let json = {
				control_server_ip: serverRes[0][1],
				control_server_port: serverRes[1][1],
				extra_server_ip: serverRes[2][1],
				extra_server_port: serverRes[3][1],
				health_check_cycle: connectRes[3][1],
				health_check_retry: connectRes[2][1],
				connection_check_cycle: connectRes[0][1],
				ws_check_cycle: connectRes[1][1]
			};

			ajax('/SettingController/Network', 'POST', json).then((res) => {
				if (res.success == true) {
					document.isSuccess(res);
				} else {
					document.createMsg('저장을 실패했습니다.');
				}
			});
		}
	}

	onMount(() => {
		ajax('/SettingController/Network').then((res) => {
			if (res.length) {
				let serverConfigArr = [
					['제어서버 IP', `${res[0].control_server_ip}`],
					['제어서버 PORT', `${res[0].control_server_port}`],
					['추가서버 IP', `${res[0].extra_server_ip}`],
					['추가서버 PORT', `${res[0].extra_server_port}`]
				];

				let connectConfigArr = [
					['운영단말 → WAS Health Check 주기', `${res[0].connection_check_cycle}`],
					['WAS → 제어서버 Health Check 주기', `${res[0].ws_check_cycle}`],
					['무응답시 Health Check 재시도 횟수', `${res[0].health_check_retry}`],
					['제어서버 연결시도 반복주기', `${res[0].health_check_cycle}`]
				];

				table1.loadData(serverConfigArr);
				table2.loadData(connectConfigArr);
			} else {
				console.log('없습니다.');
			}
		});
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="title">서버접속정보</div>
		<div class="serverConfigTab">
			<Table
				bind:wrapper={elems.table1}
				bind:table={table1}
				data={serverConfigArr}
				option={{
					width: '100%',
					colWidths: ['50px', '45px'],
					colHeaders: false,
					rowHeaders: false,
					rowHeights: 39,
					height: '157px',
					cells: cellOption,
					renderAllRows: true
				}}
			/>
		</div>
		<div />
		<div class="title">연결확인정보</div>
		<div class="connectConfigTab">
			<Table
				bind:wrapper={elems.table2}
				bind:table={table2}
				data={connectConfigArr}
				option={{
					width: '100%',
					colWidths: ['50px', '45px'],
					colHeaders: false,
					rowHeaders: false,
					rowHeights: 39,
					height: '157px',
					renderer: measureRenderer,
					cells: cellOption,
					renderAllRows: true
				}}
			/>
		</div>
		<div />
		<div class="btntap">
			<Button icon="search" on:click={systemSearch(table1, table2)}>조회</Button>
			<div />
			<Button icon="init" on:click={systemInit(table1, table2)}>초기화</Button>
			<div />
			<Button icon="save2db" colored={true} on:click={systemSave(table1, table2)}>저장</Button>
		</div>
	</div>
</div>

<style>
	#main {
		min-width: 400px;
		min-height: 400px;
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
		overflow: auto;
	}

	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-rows: 5% calc(45% - 27px) 10px 5% calc(45% - 27px) 10px 34px;
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		padding: 15px;
	}

	#main.win {
		width: 432px;
		height: 442px;
	}

	.title {
		color: #0584fe;
		/* text-align: center; */
	}

	.serverConfigTab,
	.connectConfigTab {
		overflow: hidden;
	}

	.serverConfigTab :global(.handsontable tr td:first-child),
	.connectConfigTab :global(.handsontable tr td:first-child) {
		color: #999999;
		background: #f4f7f9;
	}

	.connectConfigTab :global(.handsontable .measureClass) {
		color: #bbb;
		font-size: 11px;
	}

	.serverConfigTab :global(.handsontable tr td:first-child),
	.connectConfigTab :global(.handsontable tr td:first-child) {
		text-align: right;
	}

	.btntap {
		display: grid;
		grid-template-columns: 21% 5px 21% calc(37% - 5px) 21%;
		align-items: end;
		overflow: auto;
	}
</style>
