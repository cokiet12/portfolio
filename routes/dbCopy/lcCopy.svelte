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
		checked4: false,
		checked5: false,
		checked6: false,
		checked7: false,
		checked8: false,
		checked9: false,
		checked10: false
	};
	let elems = {};

	// 원본 교차로
	let origin;

	// 대상 교차로
	let target;

	// 교차로 복사
	function copy() {
		let json = {
			source: origin ? Number(origin.lcno) : '',
			destination: target ? Number(target.lcno) : '',
			contradictionmap: stats.checked1,
			startupcode: stats.checked2,
			flashmap: stats.checked3,
			signalmap: stats.checked4,
			phaseconfig: stats.checked5,
			reservationplan: stats.checked6,
			detectorconfig: stats.checked7,
			splitinfomation: stats.checked8,
			algorithmvariable: stats.checked9,
			outputmap: stats.checked10
		};

		if (json.source === '') {
			console.log('원본 교차로가 선택되지 않았습니다.');
		} else if (json.destination === '') {
			console.log('대상 교차로가 선택되지 않았습니다.');
		} else if (json.source == json.destination) {
			console.log('대상 교차로와 원본 교차로가 같습니다.');
		} else if (
			!(
				json.signalmap ||
				json.outputmap ||
				json.detectorconfig ||
				json.phaseconfig ||
				json.reservationplan ||
				json.startupcode ||
				json.flashmap ||
				json.contradictionmap ||
				json.algorithmvariable ||
				json.splitinfomation
			)
		) {
			console.log('최소 하나 이상의 옵션이 선택되어야 합니다.');
		} else {
			console.log('복사 진행');
			console.log(json);
			ajax(`/ntcs_m_lc/Copy`, 'POST', json).then((res) => {
				document.isSuccess(res);
			});
		}
	}
</script>

<div class="entireDiv">
	<div class="First">
		<div class="Box1">원본 교차로</div>
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
		<div class="Box1">대상 교차로</div>
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
			<Input type="checkbox1" bind:checked={stats.checked1}>모순맵</Input>
			<Input type="checkbox1" bind:checked={stats.checked2}>제어변수</Input>
			<Input type="checkbox1" bind:checked={stats.checked3}>플래시맵</Input>
			<Input type="checkbox1" bind:checked={stats.checked4}>시그널맵</Input>
			<Input type="checkbox1" bind:checked={stats.checked5}>현시구성</Input>
			<Input type="checkbox1" bind:checked={stats.checked6}>예약계획</Input>
			<Input type="checkbox1" bind:checked={stats.checked7}>검지기구성</Input>
			<Input type="checkbox1" bind:checked={stats.checked8}>스플릿정보</Input>
			<Input type="checkbox1" bind:checked={stats.checked9}>알고리즘변수</Input>
			<Input type="checkbox1" bind:checked={stats.checked10}>방향별출력맵</Input>
		</div>
	</div>
	<div class="btntap">
		<div />
		<Button icon="compare" colored="blue" on:click={copy}>복사</Button>
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
