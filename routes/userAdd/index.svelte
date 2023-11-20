<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import { ajax } from '$lib/js/functions.mjs';
	import Table from '$lib/nested/table.svelte';
	import Input from '$lib/nested/input.svelte';
	import Select from '$lib/nested/dropdown.svelte';
	import Button from '$lib/nested/button.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher();

	export let winMode = false;
	export let params;

	const consts = {};
	let stats = {};
	let elems = {
		table1: null,
		str1: null,
		str2: null,
		btn1: null,
		btn2: null
	};
	// Table
	let table1;

	// Data
	let data = [];

	// Option
	let option = [
		{ id: 1, text: '전체관리자' },
		{ id: 2, text: '관리자' },
		{ id: 3, text: '운영자' }
	];

	let select = 1;

	function btn() {
		if (params != null && elems.str1 != null && elems.str2 != null) {
			let dt = {
				user_id: params,
				user_nm: elems.str1,
				password: elems.str2,
				auth_lev: select,
				use_yn: 1,
				del_yn: 0,
				user_json: '{}'
			};
			console.log(dt);
			ajax('/ntcs_m_user/insert', 'POST', dt).then((result) => {
				console.log(result);
				document.createMsg('계정 추가가 완료되었습니다.');
				dispatch('destroy');
			});
		} else {
			document.createMsg('입력하지 않은 부분이 있습니다. 제대로 입력해주세요');
		}
	}

	onMount(() => {});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="id">
			<div class="box">아이디</div>
			<div />
			<Input
				width="calc(100% - 2px)"
				height="calc(100% - 2px)"
				type="text"
				bind:value={elems.str1}
			/>
		</div>
		<div />
		<div class="password">
			<div class="box">비밀번호</div>
			<div />
			<Input
				width="calc(100% - 2px)"
				height="calc(100% - 2px)"
				type="password"
				bind:value={elems.str2}
			/>
		</div>
		<div />
		<div class="auth">
			<div class="box">권한</div>
			<div />
			<div class="sel">
				<select bind:value={select} class="static">
					{#each option as i}
						<option value={i.id}>
							{i.text}
						</option>
					{/each}
				</select>
			</div>
		</div>
		<div />
		<div class="btn">
			<div />
			<Button bind:this={elems.btn1} on:click={btn} height="30px" colored={true}>생성</Button>
			<div />
			<Button
				bind:this={elems.btn2}
				height="30px"
				on:click={() => {
					dispatch('destroy');
				}}>취소</Button
			>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #000000;
		padding: 15px;
		height: 200px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 280px;
		height: 200px;
	}

	.sel {
		position: relative;
		overflow: hidden;
		width: calc(100% - 2px);
		height: calc(100% - 2px);

		font-size: 1.3rem;
		border-radius: 4px;
		border: 1px solid #212830;
		background-color: 14181D;
	}

	.sel > select {
		width: 100%;
		height: calc(100% - 1px);
		padding: 0 5px;
		border: none;
		margin: 0;
		color: #fff;
		background-color: #14181d;
		font-size: 1.3rem;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 24px);
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #181d22;
		border-radius: 6px;
		background-color: #181d22;
		display: grid;
		grid-template-rows: 20% 5px 20% 5px 20% calc(20% - 10px) 20%;
		padding: 10px;
	}

	.id,
	.password,
	.auth {
		display: grid;
		grid-template-columns: 35% 5px calc(65% - 5px);
		font-size: 1.3rem;
	}

	.box {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0px solid #212830;
		border-radius: 4px;
	}

	.btn {
		display: grid;
		grid-template-columns: calc(100% - 153px) 74px 5px 74px;
		align-items: end;
		margin: auto;
	}

	#main :global(div.text) {
		border: 1px solid #212830;
		background-color: #14181d;
	}

	#main :global(div.text > input) {
		color: #fff;
		background-color: #14181d;
	}
</style>
