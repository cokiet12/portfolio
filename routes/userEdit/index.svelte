<svelte:options accessors />

<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import { ajax } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';

	export let winMode = false;
	export let id;

	const consts = {};
	let stats = {};
	let elems = {
		table: null,
		btn1: null
	};
	let table;
	var row1 = null;
	var row2 = null;
	let modal;

	let delUser = new Array();

	// 삭제
	function deleteRow(row1) {
		if (row1 != null) {
			if (table.countRows() != 1) {
				let delUserNo = table.getSourceDataAtCell(row1, 0);
				let delUserName = table.getSourceDataAtCell(row1, 1);
				table.alter('remove_row', row1);
				row1 = null;
				row2 = null;

				delUser.push(delUserNo);
				delUser.push(delUserName);
				console.log(delUserName);
				console.log(delUser);
			} else {
				document.createMsg('사용자 데이터는 하나 이상있어야 합니다!');
			}
		} else {
			document.createMsg('제거할 줄을 선택해주세요!');
		}
	}

	//조회
	function userSearch(table) {
		delUser = [];
		ajax('/ntcs_m_user/list').then((res) => {
			for (var i = 0; i < res.length; i++) {
				if (res[i].auth_lev == 1) {
					res[i].auth_lev = '전체관리자';
				} else if (res[i].auth_lev == 2) {
					res[i].auth_lev = '관리자';
				} else {
					res[i].auth_lev = '운영자';
				}
			}

			let Sdata = new Array();

			for (var i = 0; i < res.length; i++) {
				Sdata.push([`${res[i].user_id}`, `${res[i].user_nm}`, `${res[i].auth_lev}`]);
			}
			table.loadData(Sdata);
			console.log(res);
			document.isSuccess(res);
		});
	}
	// 저장
	function userSave() {
		let lens = delUser.length;

		if (lens > 0) {
			for (var i = 0; i < lens; i += 2) {
				let delArray = { user_id: delUser[i], user_nm: delUser[i + 1] };
				console.log(delArray);
				ajax('/ntcs_m_user/delete', 'POST', delArray).then((result) => {
					console.log(result);
					document.isSuccess(result);
				});
			}
		} else {
			document.createMsg('변경사항이 없습니다.');
		}
	}

	// 추가
	function userAdd(e) {
		let indexArray = table.getDataAtCol(0);
		let lastindex = Number(indexArray[indexArray.length - 1]) + 1;

		modal = document.createMsgWindow('userAdd/index.svelte', '계정생성', lastindex);
	}

	function userUpdate(selrow) {
		if (selrow != null) {
			if (table.countRows() != 1) {
				modal = document.createMsgWindow('userUpdate/index.svelte', '계정정보 변경', {
					userId : table.getSourceDataAtCell(selrow, 0),
					userName : table.getSourceDataAtCell(selrow, 1),
					userAuth : table.getSourceDataAtCell(selrow, 2)
				});

				selrow = null;
				row2 = null;
			} else {
				document.createMsg('사용자 데이터는 하나 이상있어야 합니다!');
			}
		} else {
			document.createMsg('제거할 줄을 선택해주세요!');
		}
	}

	onMount(() => {
		ajax('/ntcs_m_user/list').then((res) => {
			for (var i = 0; i < res.length; i++) {
				if (res[i].auth_lev == 1) {
					res[i].auth_lev = '전체관리자';
				} else if (res[i].auth_lev == 2) {
					res[i].auth_lev = '관리자';
				} else {
					res[i].auth_lev = '운영자';
				}
			}

			let data = new Array();

			for (var i = 0; i < res.length; i++) {
				data.push([`${res[i].user_id}`, `${res[i].user_nm}`, `${res[i].auth_lev}`]);
			}
			table.loadData(data);
		});
		table.updateSettings({ height: 406 });

		elems.btn1.$on('click', function () {
			userSave();
		});
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="tabletap">
			<Table
				bind:wrapper={elems.table}
				bind:table
				colheader={['사용자ID', '아이디', '권한']}
				data={[['', '', '']]}
				option={{
					renderer: 'html',
					height: '406px',
					rowHeaders: false,
					colWidths: ['20px', '40px', '40px'],
					renderAllRows: true,
					readOnly: true,
					afterSelectionEnd: function (x1, y1, x2, y2) {
						if ((x1 <= x2 && y1 < y2) || (x1 < x2 && y1 <= y2) || (x1 == x2 && y1 == y2)) {
							row1 = x1;
							if (x1 == 0) row2 = parseInt(x2 + 1);
							else row2 = x2;
						} else if ((x1 >= x2 && y1 > y2) || (x1 > x2 && y1 >= y2)) {
							row1 = x2;
							if (x2 == 0) row2 = parseInt(x1 + 1);
							else row2 = x1;
						} else if (x1 < x2 && y1 > y2) {
							row1 = x1;
							row2 = x2;
						} else if (x1 > x2 && y1 < y2) {
							row1 = x2;
							row2 = x1;
						}
					}
				}}
			/>
		</div>
		<div />
		<div class="btntap">
			<Button height={'30px'} icon="search" on:click={userSearch(table)}>조회</Button>
			<div />
			<Button height={'30px'} icon="plus" on:click={userAdd}>추가</Button>
			<div />
			<Button height={'30px'} icon="edit" on:click={userUpdate(row1)}>수정</Button>
			<div />
			<Button height={'30px'} icon="delete" on:click={deleteRow(row1)}>삭제</Button>
			<div />
			<Button height={'30px'} icon="save2db" bind:this={elems.btn1} colored={true}>저장</Button>
		</div>
	</div>
</div>

<style>
	#main {
		min-width: 450px;
		min-height: 450px;
		font-size: 1.3rem;
		background-color: #000000;
		padding: 11px;
		overflow: auto;
	}

	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-rows: calc(100% - 44px) 10px 34px;
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}

	.tabletap {
		overflow: auto;
	}

	.tabletap :global(.tableWrapper) {
		height: 406px !important;
	}

	.tabletap :global(.tableWrapper .wtHolder) {
		overflow: auto !important;
	}

	.btntap {
		display: grid;
		grid-template-columns: 15% 5px 15% 5px 15% 5px 15% calc(23.6% - 15px) 16%;
		overflow: hidden;
		align-items: end;
	}

	#main.win {
		width: 482px;
		height: 482px;
	}

	#main :global(.handsontable tr th) {
		color: #666;
		background: #181d23;
	}

	#main :global(.handsontable tr td) {
		color: #999999;
		background: #212830;
	}
</style>
