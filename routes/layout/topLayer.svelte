<script>
	import Window from '$lib/nested/window/window.svelte';
	import { onMount } from 'svelte';
	import { loadList, sbOn } from '$lib/store.mjs';

	let msgStat = {
		id: null,
		TO: null,
		isOpen: false,
		msg: '',
		lev: ['#DDD', '#FD7', '#F99'],
		color: null
	};
	let msgWinStat = {
		content: null
	};
	let elems = {
		msgWin: null,
		topLayer: null
	};
	let title = null;

	function destMsgWin() {
		// if (msgWinStat.content) {
		msgWinStat.content.$destroy();
		msgWinStat.content = null;
		$sbOn = false;
		elems.msgWin.classList.remove('open');
		title = null;
		// }
	}

	onMount(() => {
		document.createMsg = function (msg, lev = 0) {
			if (msgStat.TO) {
				clearTimeout(msgStat.TO);
			}
			msgStat.id = 'message';
			msgStat.color = msgStat.lev[lev];
			msgStat.msg = msg;
			msgStat.isOpen = true;
			msgStat.TO = setTimeout(() => {
				msgStat.TO = null;
				msgStat.color = null;
				msgStat.isOpen = false;
				msgStat.msg = '';
			}, 1400 + msg.length * 30);
		};

		document.createMsgWindow = function (url, _title, params, ev) {
			if (msgWinStat.content == null && title == null) {
				title = _title;
				elems.msgWin.classList.add('open');
				$sbOn = true;
				import(`/src/routes/${url}`).then((res) => {
					msgWinStat.content = new res.default({
						target: elems.msgWin,
						props: {
							params: params
						}
					});
					msgWinStat.content.$on('destroy', (e) => {
						destMsgWin();
					});
					if (typeof ev == 'function') {
						msgWinStat.content.$on('ev', ev)
					}
				});
			}
		};

		document.callTcp = function (url, jsons, cb, gap = 500, rest) {
			document.createMsgWindow('modals/tcp.svelte', 'TCP요청', {
				url: url,
				jsons: jsons,
				cb: cb,
				gap: gap,
				rest: rest
			});
		};
		document.isSuccess = function (res) {
			const isSuccess = Boolean(typeof res.FAIL == 'undefined');
			// if(!res.success || !res.issuccess) {
			//     isSuccess = true;
			// } else {
			//     isSuccess = false;
			// }
			// console.log(res)
			// if(res.success || res.issuccess) {
			//     if(res.success == false) {
			//         isSuccess = false;
			//     } else {
			//         isSuccess = true
			//     }
			// }
			document.createMsgWindow('modals/isSuccess.svelte', '통신 결과', {
				res: res,
				isSuccess: isSuccess
			});
			return isSuccess;
		};
		$loadList.push('all done : topLayer');
	});
</script>

<topLayer bind:this={elems.topLayer}>
	<!-- 화면블러 -->
	<div id="screenBlock" class:sbOn={$sbOn} />

	<!-- 메시지 -->
	<div id={msgStat.id} class:open={msgStat.isOpen} style:color={msgStat.color}>{msgStat.msg}</div>

	<!-- 모달 -->
	<div id="msgWin" bind:this={elems.msgWin}>
		<div class="title">
			{title}
			<div class="btns">
				<div on:click={destMsgWin}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			</div>
		</div>
	</div>
</topLayer>

<style>
	topLayer {
		/*background-color: #0f9d58;*/
		pointer-events: none;
		position: absolute;
		z-index: 5;
		width: 100vw;
		height: 100vh;
	}
	topLayer #map1 {
		width: 100%;
		height: 100%;
	}
	topLayer :global(.ol-unselectable) {
		filter: var(--filter);
	}

	#screenBlock {
		display: none;
		position: absolute;
		left: 0;
		top: 0;
		background-color: #0003;
		width: 100vw;
		height: 100vh;
		z-index: 1;
		transition: display 0.15s;
	}
	#screenBlock.sbOn {
		display: block;
		pointer-events: auto;
	}

	#message {
		user-select: none;
		background-color: #0009;
		border-radius: 14px;
		padding: 15px 40px;
		min-width: 15vw;
		max-width: 90vw;
		left: 50vw;
		bottom: -7vh;
		font-size: 1.3rem;
		transform: translateX(-50%);
		transition: bottom 0.1s ease-in;
		z-index: 3;
		text-align: center;
		box-shadow: 0 1px 2px #0005;
		/*outline: 1px solid #ffe13f;*/
		font-weight: bold;
		position: absolute;
		display: inline-block;
	}
	#message.open {
		bottom: 24vh;
	}
	#msgWin {
		left: 50%;
		top: 50%;
		transform: translate(-50%, -70%);
		pointer-events: all;
		position: absolute;
		display: none;
		background-color: #000000;
		box-shadow: 0px 0px 20px #0000000d;
		border: 1px solid #dbe2e677;
		border-radius: 4px;
		overflow: visible;
		grid-template-rows: 1fr;
		max-height: calc(100% - 37px);
		z-index: 2;
		outline: 1px solid #0000;

		min-width: 300px;
		min-height: 210px;
	}
	#msgWin .title {
		--height: 40px;

		background-color: #212830;
		position: relative;
		height: var(--height);
		line-height: 72px;
		font-size: 1.4rem;
		color: #bbb;
		padding-left: 17px;
		/* border-bottom: 1px solid #DBE2E6; */

		line-height: 40px;

		/* border-bottom: 1px solid #CCC; */
	}
	#msgWin .title .btns {
		--btnmg: 2px;

		position: absolute;
		right: var(--btnmg);
		top: 0;
		height: var(--height);

		color: #999;
	}
	#msgWin .title .btns > div {
		border-radius: 3px;
		float: left;
		width: calc(var(--height) - (var(--btnmg) * 2));
		height: calc(var(--height) - (var(--btnmg) * 2));
		margin: var(--btnmg) 0 var(--btnmg) 0;
		overflow: hidden;

		transition: background-color 0.05s;
	}
	#msgWin .title .btns > div:hover {
		box-shadow: inset 0 0 3px #0009;
	}
	#msgWin .title .btns > div:active {
		background-color: #0003;
	}
	#msgWin .title .btns :global(svg) {
		margin: 9px;
		float: left;
		width: 18px;
	}
	#msgWin.open {
		display: block;
	}
</style>
