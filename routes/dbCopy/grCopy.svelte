<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	const consts = {};
	let stats = {
		checked1: false,
		checked2: false,
		checked3: false,
		checked4: false
	};
	let elems = {};

	// 원본 그룹
	let origin;

	// 대상 그룹
	let target;

	// 그룹 복사
	function copy() {
		let json = {
			source: origin ? origin.sano : '',
			destination: target ? target.sano : '',
			operationinfo: false,
			cycleinfo: stats.checked1,
			dailyinfo: stats.checked2,
			weeklyinfo: stats.checked3,
			specialdayinfo: stats.checked4
		};

		if (json.source === '') {
			console.log('원본 그룹이 선택되지 않았습니다.');
		} else if (json.source === 0) {
			console.log('원본 그룹으로 미소속 그룹을 선택할 수 없습니다.');
		} else if (json.destination === '') {
			console.log('대상 그룹이 선택되지 않았습니다.');
		} else if (json.destination === 0) {
			console.log('대상 그룹으로 미소속 그룹을 선택할 수 없습니다.');
		} else if (json.source == json.destination) {
			console.log('대상 그룹과 원본 그룹이 같습니다.');
		} else if (!(json.cycleinfo || json.dailyinfo || json.weeklyinfo || json.specialdayinfo)) {
			console.log('최소 하나 이상의 옵션이 선택되어야 합니다.');
		} else {
			console.log('복사 진행');
			ajax(`/ntcs_m_saoprate/Copy`, 'POST', json).then((res) => {
				document.isSuccess(res);
			});
		}
	}
</script>

<div class="entireDiv">
	<div class="First">
		<div class="Box1">원본 그룹</div>
		<div />
		<div class="Select1">
			<Searcher
				width="100%"
				onChoose={(no) => {
					origin = no;
				}}
			/>
		</div>
	</div>
	<div class="Second">
		<div class="Box1">대상 그룹</div>
		<div />
		<div class="Select2">
			<Searcher
				width="100%"
				onChoose={(no) => {
					target = no;
				}}
			/>
		</div>
	</div>
	<div class="Third">
		<div class="Box1">복사할 정보</div>
		<div />
		<div class="Check">
			<Input type="checkbox1" bind:checked={stats.checked1}>일 계획</Input>
			<Input type="checkbox1" bind:checked={stats.checked2}>주기 계획</Input>
			<Input type="checkbox1" bind:checked={stats.checked3}>주간 계획</Input>
			<Input type="checkbox1" bind:checked={stats.checked4}>특수일 계획</Input>
		</div>
	</div>
	<div class="btntap">
		<div />
		<Button colored="blue" icon="compare" on:click={copy}>복사</Button>
	</div>
</div>

<style>
	.entireDiv {
		height: 100%;
		display: grid;
		grid-template-rows: 14% 14% 62% 10%;
		font-size: 1.2rem;
	}

	.First,
	.Second {
		display: grid;
		grid-template-columns: 25% 3% 72%;
		align-items: center;
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

	.Select1,
	.Select2 {
		display: flex;
		justify-content: right;
	}

	.Third {
		display: grid;
		grid-template-columns: 25% calc(3% - 9px) 72%;
		margin-top: 6.795px;
	}

	.Check {
		display: grid;
		grid-template-rows: 10% 10% 10% 10% 10% 10% 10% 10% 10% 10%;
		overflow: hidden;
	}

	.btntap {
		display: grid;
		grid-template-columns: 77% 23%;
		align-items: end;
	}
</style>
