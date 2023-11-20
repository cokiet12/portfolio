<svelte:options accessors />

<script>
	// @ts-nocheck
	import Button from '$lib/nested/button.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Edit from './edit.svelte';
	import Read from './read.svelte';
	import _ from 'lodash';

	// 창모드 / 싱글, 듀얼모드
	export let winMode = false;
	export let onSize;

	const consts = {};

	let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};

	let editmode = false;
	// Add
	let addId = new Array();

	// Del
	let delId = new Array();

	// 추가
	function addRow() {
		let row = table1.countRows();
		let indexArray = table1.getDataAtCol(0);

		for (let i = 0; i < indexArray.length; i++) {
			if (indexArray[i] === 9999) {
				indexArray.splice(i, 1);
				i--;
			}
		}

		let autoIncrease;

		if (indexArray.length == 0) {
			autoIncrease = 0;
		} else {
			autoIncrease = indexArray[indexArray.length - 1];
		}

		if (typeof autoIncrease == 'string') {
			console.log('!0잘못된 번호입니다.');
		} else {
			table1.alter('insert_row', row, 1);

			// 데이터 입력
			table1.setDataAtCell(row, 0, autoIncrease + 1);
			table1.setDataAtCell(row, 1, stats.lcno);
			table1.selectCell(row, 0);

			addId.push(autoIncrease + 1);
			if (delId.includes(autoIncrease + 1)) {
				var search = delId.indexOf(autoIncrease + 1);
				if (search != -1) {
					delId.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			}
		}
	}

	// 삭제
	function delRow() {
		if (row1 != null) {
			let delIdNo = table1.getSourceDataAtCell(row1, 0);
			table1.alter('remove_row', row1);
			table1.selectCell(row1 - 1, 0);

			if (addId.includes(delIdNo)) {
				var search = addId.indexOf(delIdNo);
				if (search != -1) {
					addId.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			} else {
				delId.push(delIdNo);
			}
		} else {
			document.createMsg('제거할 줄을 선택해주세요!');
		}
	}

	// 초기 조회
</script>

<div id="main" class="newScrollBar" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv newScrollBar">
		<div class="search">
			<Searcher
				bind:value={stats.lcno}
				width="200px"
				onChoose={(no) => {
					stats = no;
				}}
			/>
		</div>
		<div class="button">
			<Button
				icon={editmode ? 'detail' : 'edit'}
				colored={true}
				on:click={() => {
					editmode = !editmode;
				}}>{editmode ? '분석' : '입력'}</Button
			>
		</div>
		<div class="table" class:dnone={editmode}>
			<Read bind:stats bind:onSize bind:winMode bind:editmode />
		</div>
		<div class="table" class:dnone={!editmode}>
			<Edit bind:stats />
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #000000;
		box-sizing: border-box;
		height: calc(100% - 40px);
		padding: 11px;
		/* 높이(가변) */
		/* max-height: 720px; */
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 1072px;
	}

	/* 카드 */
	.EntireDiv {
		box-sizing: border-box;
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: 32px 1fr;
		grid-row-gap: 10px;
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #181d22; */
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}
	.EntireDiv .search {
		grid-area: 1 / 1 / 2 / 2;
	}

	/* 테이블 */
	.EntireDiv .button {
		grid-area: 1 / 2 / 2 / 3;
		display: grid;
		grid-template-columns: 70px;
		grid-template-rows: auto;
		grid-column-gap: 5px;
		justify-content: end;
	}

	.EntireDiv .table {
		grid-area: 2 / 1 / 3 / 3;
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

	/* Td 줄바꿈 방지 */
	#main .table :global(.handsontable td) {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
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
