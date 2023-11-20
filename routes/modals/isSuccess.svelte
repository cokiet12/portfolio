<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/nested/button.svelte';
	import _ from 'lodash';
	const dispatch = createEventDispatcher();

	export let params;

	const isSuccess = params.isSuccess;
	const datas = params.res;

	// isSuccess = Boolean(!params.success || !params.issuccess)
	// const isSuccess = Boolean(!params.message)
	/**
	 * @type {string}
	 */
	let msg;
	let to;

	function destroy() {
		removeEventListener('keydown', keyDest);
		if (to) clearTimeout(to);
		dispatch('destroy');
	}

	function keyDest(e) {
		if (e.key == 'Enter' || e.key == ' ') {
			e.preventDefault();
			destroy();
		}
	}

	addEventListener('keydown', keyDest);

	if (isSuccess) {
		// ISDATA FALSE
		if (_.isEmpty(datas)) {
			msg = `<b>주의 : </b><p>데이터가 없습니다.</p>`;
			to = setTimeout(() => {
				destroy();
			}, 1000);
		}
		// ISDATA TRUE
		else {
			msg = '요청 성공했습니다.';
			to = setTimeout(() => {
				destroy();
			}, 1000);
		}
	} else {
		msg = `<b>에러내용 : </b><p>${datas.message}</p>`;
		msg = `<b>에러내용 : </b><p>요청 실패했습니다.</p>`;
		// if (params.errors) {
		//     for (const v in params.errors) {
		//         msg += `<p>${params.errors[v]}</p>`
		//     }
		// } else if (params.error) {
		//     msg += `<p>${params.error.message}</p>`
		// } else {
		//     msg += `<p>${params.status} ${params.statusText}</p>`
		// }
	}
</script>

<div class="msg">{@html msg}</div>
<div class="btnDiv">
	{#if isSuccess && !_.isEmpty(datas)}
		<div class="pour" />
	{/if}
	<Button height="32px" width="90" on:click={destroy} colored={isSuccess ? (_.isEmpty(datas) ? 'yellow' : 'tp') : 'red'}
		>확인(Space)</Button
	>
</div>

<style>
	.msg {
		padding: 30px 0;
		text-align: center;
		color: #ccc;
	}
	.msg > :global(p) {
		margin: 3px 0;
	}
	.btnDiv {
		overflow: hidden;
		border-radius: 3px;
		position: absolute;
		left: 50%;
		bottom: 15px;
		transform: translateX(-50%);
	}
	.pour {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 100%;
		background-color: rgb(0, 210, 140);
		animation-name: pour;
		animation-duration: 0.7s;
		animation-iteration-count: 1;
		/* animation-iteration-count: infinite; */
	}
	@keyframes pour {
		from {
			width: 0%;
		}
		to {
			width: 100%;
		}
	}
</style>
