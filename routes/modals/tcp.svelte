<script>
	// @ts-nocheck

	import Button from '$lib/nested/button.svelte';
	import Gauge from '$lib/nested/gauge.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { TCPreqs, TCPresp, ticketno, settings } from '$lib/store.mjs';
	import _ from 'lodash';

	const dispatch = createEventDispatcher();

	export let params;

	console.log(params);
	const cb = params.cb || new Function();
	const url = params.url;
	const jsons = params.jsons;
	const key = Object.keys(jsons[0])[0];
	const gap = params.gap || 70;
	const leng = jsons.length;
	const rest = params.rest;
	const svgs = {
		fail: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>`,
		success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>`
	};

	let done = 0;
	let listUp = new Array();
	let elems = {
		gauge: null
	};

	$TCPreqs = new Array();
	// $TCPresp = new Array()
	// @ts-ignore
	$TCPresp = jsons.map((el) => {
		return {
			key: el[key] || jsons[0],
			name: el._listName,
			data: undefined,
			ok: 0
		};
	});
	$ticketno = new Array();
	let cnt = 0;
	let rescnt = 0;

	function destroy() {
		if (sto) clearTimeout(sto);
		removeEventListener('waitLC', waitLC);
		dispatch('destroy');
	}

	function retry() {
		setTimeout(() => {
			let _jsons = new Array();
			console.log($TCPresp);
			$TCPresp.forEach((v, i) => {
				if (v.ok == -1) {
					_jsons.push(jsons[i]);
					$TCPresp.splice(i, 1);
				}
			});

			// @ts-ignore
			document.callTcp(url, _jsons, cb, gap + 20, rest ? _.concat(rest, $TCPresp) : $TCPresp);
		}, 50);
		destroy();
	}

	//요청부
	async function request() {
		if (cnt < leng) {
			let json = jsons[cnt];
			let dataInfo = {
				method: 'POST',
				body: JSON.stringify({
					data: json
				}),
				headers: {
					'Content-Type': 'application/json',
					Accept: '*/*',
					'Access-Control-Allow-Origin': '*'
				}
			};
			const reqURL = await fetch(settings.WASserver + url, dataInfo);
			const dt = await reqURL.json();
			const tkno = dt.ticketno == 999 ? json.LCNO + 999 : dt.ticketno;
			++cnt;

			$ticketno.push(tkno);
			$TCPreqs[cnt - 1] = {
				ticketno: tkno,
				data: json
			};
			console.log(tkno);
			if (typeof dt.sendTime != 'undefined') {
				$TCPresp[cnt - 1].sendTime = dt.sendTime;
			}
		} else {
			if (interval) {
				//요청 종료
				clearInterval(interval);
			}
		}
	}
	/**
	 * @type {NodeJS.Timeout | undefined}
	 */
	let interval;
	// if (leng > 1) {
	//     interval = setInterval(request, gap);
	// }
	// request()

	//대기 후 실패처리
	function timeOut() {
		done = 1;
		$TCPreqs.forEach((v, i) => {
			if (v != undefined) {
				if (typeof v.data == 'string') {
					try {
						v.data = JSON.parse(v.data);
					} catch (e) {}
				}
				$TCPresp[i].ok = -1;
			}
		});
		// sendAjax('/setLog', {'data':log_data_f});
		let result = rest ? _.concat(rest, $TCPresp) : $TCPresp;
		result.done = false;

		cb(result);
		removeEventListener('waitLC', waitLC);
	}
	let sto = setTimeout(timeOut, 2000 + gap * leng * 1.5);

	//수신처리
	let waitLC = (e) => {
		const tcpResponse = e.resp;
		if (tcpResponse.error) {
			//에러시
			console.error(tcpResponse.error);
			clearTimeout(sto);
			return;
			// sendAjax('/setLog', {'data':log_data_f});
		} else {
			const ticind = e.ticind;

			$TCPreqs[ticind] = null;

			$TCPresp[ticind].data = tcpResponse;
			$TCPresp[ticind].ok = 1;

			// sendAjax('/setLog', {'data': log_data_s});

			if (++rescnt == leng) {
				//성공 종료
				clearTimeout(sto);
				sto = setTimeout(() => {
					done = 2;
					setTimeout(() => {
						destroy();
					}, 500);
				}, 200);
				let result = rest ? _.concat(rest, $TCPresp) : $TCPresp;
				result.done = true;

				cb(result);
			}
		}
	};
	addEventListener('waitLC', waitLC);
</script>

<div class="padding" />
{#each $TCPresp as list}
	<p class:done={list.ok == 1} class:fail={list.ok == -1} class:stay={list.ok == 0}>
		{list.name || list.key}
		{#if list.ok == 1}
			{@html svgs.success}
		{:else if list.ok == -1}
			{@html svgs.fail}
		{:else}
			{@html svgs.success}
		{/if}
	</p>
{/each}
{#if done == 0 && leng > 1}
	<Gauge max={leng} cur={rescnt} />
{:else if done == 1}
	<div class="btnDiv">
		<Button on:click={retry} colored="red">실패리스트 재시도</Button>
		<Button
			on:click={() => {
				let result = rest ? _.concat(rest, $TCPresp) : $TCPresp;
				result.done = true;
				cb(result);
				destroy();
			}}>닫기</Button
		>
	</div>
{:else if done == 2}
	<div class="btnDiv">
		<div />
		<Button on:click={destroy}>닫기</Button>
	</div>
{/if}

<style>
	.padding {
		padding: 7px;
	}
	p {
		text-align: center;
	}
	p.done {
		color: rgb(0, 190, 60);
	}
	p.fail {
		color: rgb(255, 70, 70);
	}
	p.stay {
		color: #bbb;
	}
	p :global(svg) {
		width: 1.4rem;
		vertical-align: middle;
	}
	.btnDiv {
		/* background-color:green; */
		display: grid;
		padding: 11px;
		gap: 11px;
		grid-template-columns: 1fr 1fr;
	}
</style>
