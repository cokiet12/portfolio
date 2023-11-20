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
	import { param } from 'jquery';

	const dispatch = createEventDispatcher();

	export let winMode = false;
	export let params;

	const consts = {};
	let stats = {};
	let elems = {
		table1: null,
		name: params.userName,
		pwd: '',
        newpwd: '',
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

	let select = option.find(el=>el.text==params.userAuth).id;

	function btn() {
		if (elems.pwd=='') {
			document.createMsg('현재 비밀번호를 입력하지 않았습니다.', 1);
			return;
		}
		let dt = {
			user_id: params.userId,
			user_nm: elems.name,
			password: elems.pwd,
			password2: elems.newpwd,
			auth_lev: select
		};
		ajax('/ntcs_m_user/change', 'POST', dt).then((result) => {
			if (result.message == 'Not matched Password') {
				document.createMsg('현재 비밀번호가 틀립니다', 2)
			} else if (result.success == false) {
				document.createMsg('요청이 실패하였습니다', 2)
			} else {
				document.createMsg('계정정보 수정이 완료되었습니다.')
				dispatch('destroy');
			}
		});
	}

	onMount(() => {
    });
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
				bind:value={elems.name}
                disabled={true}
			/>
		</div>
		<div />
        <div class="password">
			<div class="box">현재 비밀번호</div>
			<div />
			<Input
				width="calc(100% - 2px)"
				height="calc(100% - 2px)"
				type="password"
				bind:value={elems.pwd}
			/>
		</div>
        <div />
		<div class="password">
			<div class="box">변경 비밀번호</div>
			<div />
			<Input
				width="calc(100% - 2px)"
				height="calc(100% - 2px)"
				type="password"
				bind:value={elems.newpwd}
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
			<Button bind:this={elems.btn1} on:click={btn} height="30px" colored={true}>수정</Button>
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
		height: 250px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 280px;
		height: 250px;
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
		grid-template-rows: 17% 5px 17% 5px 17% 5px 17% calc(12% - 15px) 20%;
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
