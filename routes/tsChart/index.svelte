<script>
	import TSC from '$lib/nested/timeSpaceChart/tsc.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import { onMount } from 'svelte';

	let salist = ['',157,160] //그룹리스트
	let sano = 1; //가상그룹
	let times = new Array(2);
	let cycle = 120;
	let isMove = false;
	let lineNum = 3;
	let lcs = [];
	let spdK = [40, 20, 50, 30, 20, 40, 0];
	let spdKrev = [0, 20, 40, 30, 50, 70, 40];

	let [pos1, pos2] = [0, 0];
	let dragged = false;
	let draggingLC = -1;
	let drgInfo = -1;
	let isSpd = false;
	let lcInd = -1;
	let modiList = new Object();

	let disabled = false;

	function optimize () {
		document.createMsgWindow('tsChart/optimize.svelte', '옵셋 최적화', {
			lcs : lcs,
			spdK : spdK,
			spdKrev : spdKrev,
			cycle : cycle
		}, ()=>{
			lcs=lcs;
		});
	}

	function dragMouseDown(e, that) {
		//드래그시작
		e = e || window.event;
		e.preventDefault();
		drgInfo = that ? that.getAttribute('phid').split(',') : this.getAttribute('phid').split(','); //lcno,ring,phaseno
		isSpd = isNaN(Number(drgInfo[2]));
		
		draggingLC = lcs.find((el) => el.lcno == drgInfo[0]);
		lcInd = lcs.indexOf(draggingLC);

		pos2 = e.clientX;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		//매 드래그시
		e = e || window.event;
		e.preventDefault();
		e.stopPropagation();
		pos1 = Math.round(( pos2 - e.clientX ) / 3); //이동한 값
		pos2 = e.clientX;
		dragged = true;

		const phase = drgInfo[1];

		if (pos1) {
			if (isSpd) { //속도
				if (phase == 'A') {
					const curSpd = spdK[lcInd]
					if (!(pos1 > 0 && curSpd - pos1 < 10)) {
						spdK[lcInd] -= pos1;
						if (e.shiftKey) {
							const len = spdK.length;
							for (let i=0; i < len; i++) {
								spdK[i] = spdK[lcInd];
							}
						}
					}
				} else if (phase == 'B') {
					const curSpd = spdKrev[lcInd]
					if (!(pos1 > 0 && curSpd - pos1 < 10)) {
						spdKrev[lcInd] -= pos1;
						if (e.shiftKey) {
							const len = spdKrev.length;
							for (let i=0; i < len; i++){
								spdKrev[i] = spdKrev[lcInd];
							}
						}
					}
				}
			} else { //현시
				const ind = Number(drgInfo[2]);

				const next = draggingLC['phase' + phase][ind + 1]; //다음거
				const alt = next || draggingLC['phase' + phase][ind - 1]; //다음거가 없으면 이전것
				if (
					(pos1 < 0 && alt + pos1 > 5) || //대체현시가 5이하로 내려가지 않거나
					(pos1 > 0 && draggingLC['phase' + phase][ind] - pos1 > 5) //드래그현시가 5이하로 내려가지 않으면
				) {
					if (next) {
						draggingLC['phase' + phase][ind + 1] += pos1;
					} else {
						draggingLC['phase' + phase][ind - 1] += pos1;
					}
					draggingLC['phase' + phase][ind] -= pos1;
				}
				lcs = lcs;
			}
		}
	}
	function closeDragElement(e, that) {
		//드래그종료
		if (!dragged) {
			const phase = drgInfo[1];
			const tg = that || e.target;
			const textInput = document.createElement('input');
			textInput.setAttribute('type', 'number');
			textInput.setAttribute('max', 1000);
			textInput.value = tg.textContent;
			textInput.onmousedown = function (e) {
				e.stopPropagation();
			}
			textInput.onkeydown = function (e) {
				if (e.key == 'Enter') {
					textInput.blur();
				} else if (e.key == 'Tab') {
					const move = isSpd ? 
					(tg.nextElementSibling || tg.previousElementSibling) : 
					(tg.parentElement.nextElementSibling.children[phase == 'B' ? 0 : 1])
					if (move.textContent) {
						dragMouseDown(e, move)
						closeDragElement(e, move)
					}
				}
			}
			tg.insertAdjacentElement('afterbegin', textInput);
			textInput.select();
			if (isSpd) { //속도
				textInput.onblur = function () {
					const val = Number(textInput.value);
					if (val > 10 && val < 1000) {
						if (phase == 'A') {
							spdK[lcInd] = val;
						} else if (phase == 'B') {
							spdKrev[lcInd] = val;
						}
						textInput.remove();
					} else {
						document.createMsg('10을 초과하는 숫자값을 입력해주세요',1)
					}
				}
			} else { //현시
				const _drgInfo = drgInfo;
				textInput.onblur = function () {
					const val = Number(textInput.value);
					const id = _drgInfo[0] + '/' + _drgInfo [1];
					if (typeof modiList[id] == 'undefined') {
						modiList[id] = new Array();
					}
					modiList[id][Number(_drgInfo[2])] = [textInput, val];
					if (val > 10 && val < 1000) {
						for (const [key, modi] of Object.entries(modiList)) {
							
							const [lcno, phase] = key.split('/');
							const phaseList = lcs.find((el) => el.lcno == lcno)['phase' + phase];
							const len = phaseList.length;
							let sum = 0;
							for (let i = 0; i < len; i++) {
								sum += modi[i] ? modi[i][1] : phaseList[i];
							}
							if (sum == parseInt(cycle)) {
								modi.forEach((el, ind)=>{
									phaseList[ind] = el[1];
									el[0].remove();
								})
								lcs = lcs;
								modiList = new Object();
							} else {
								document.createMsg(`주기( ${sum} )를 그룹 주기( ${parseInt(cycle)} )와 맞춰주세요`,1)
							}
						}
					} else {
						document.createMsg('10을 초과하는 숫자값을 입력해주세요',1)
					}
				}
				// const ind = Number(drgInfo[2]);

				// const next = draggingLC['phase' + phase][ind + 1]; //다음거
				// const alt = next || draggingLC['phase' + phase][ind - 1]; //다음거가 없으면 이전것
				// if (
				// 	(pos1 < 0 && alt + pos1 > 5) || //대체현시가 5이하로 내려가지 않거나
				// 	(pos1 > 0 && draggingLC['phase' + phase][ind] - pos1 > 5) //드래그현시가 5이하로 내려가지 않으면
				// ) {
				// 	if (next) {
				// 		draggingLC['phase' + phase][ind + 1] += pos1;
				// 	} else {
				// 		draggingLC['phase' + phase][ind - 1] += pos1;
				// 	}
				// 	draggingLC['phase' + phase][ind] -= pos1;
				// }
				// lcs = lcs;
			}
		}
		dragged = false;
		document.onmouseup = null;
		document.onmousemove = null;
		draggingLC = -1;
		drgInfo = -1;
	}

	function onChoose() {
		disabled = true;
		const tsp = times[1].split(':');
		const url = `/GETSPLIT?SANO=${salist[sano]}&DAY=${times[0]}&HOUR=${tsp[0]}&MIN=${tsp[1]}`;

		ajax(url).then((res) => {
			const LD = res.LCDATA;
			const CYC = res.LCYCLE;
			const TOD = res.TOD;

			let _lcs = new Array();
			let _spdK = new Array();
			let _spdKrev = new Array();

			if (TOD.length) {
				const cyc = CYC[0].cyclelength;
				cycle = cycle == cyc ? cyc + 0.001 : cyc;
				// cycle = 180;
				LD.forEach((ld, i) => {
					//교차로별
					const tod = TOD.filter((el) => el.lcno == ld.lcno);
					const cyc = CYC.find((el) => el.lcno == ld.lcno);
					const ubin = ld.uphase.toString(2);
					const dbin = ld.dphase.toString(2);
					let lcd = {
						lcno: ld.lcno,
						lcname: ld.lcname,
						adist: ld.udist,
						bdist: ld.ddist,
						offset: cyc.offset,
						phaseA: new Array(),
						phaseB: new Array(),
						prePhaseOffset: new Array(),
						postPhaseOffset: new Array(),
						redA: new Array(tod.length / 2).fill(true),
						redB: new Array(tod.length / 2).fill(true),
						cuPhaseA: new Array(),
						cuPhaseB: new Array()
					};
					if (i == LD.length - 1) {
						lcd.adist = 0;
					}
					[...ubin].reverse().forEach((v, i) => {
						const bool = Boolean(Number(v));
						if (bool) lcd.redA[i] = false;
					});
					[...dbin].reverse().forEach((b, o) => {
						const bool = Boolean(Number(b));
						if (bool) lcd.redB[o] = false;
					});

					tod.forEach((v) => {
						//교차로 현시별
						lcd['phase' + (v.ring == 1 ? 'A' : 'B')][v.phaseno - 1] = v.split;
						// lcd['red' + (v.ring == 1 ? 'A' : 'B')][v.phaseno-1] = ld.mainphase == v.phaseno ? false : true;
					});

					_lcs.push(lcd);
					_spdK[i] = ld.uspd;
					_spdKrev[i] = ld.dspd;
				});
				lcs = _lcs;
				spdK = _spdK;
				spdKrev = _spdKrev;
			}
			disabled = false;
		});
	}
	onMount(() => {
		let curtime = new Date();
		times[0] = String(curtime.getDay());
		let h = String(curtime.getHours());
		let m = String(curtime.getMinutes());
		times[1] = (h.length < 2 ? '0' + h : h) + ':' + (m.length < 2 ? '0' + m : m);
	});
</script>

<div id="main">
	<div class="EntireDiv">
		<div class="lcList">
			<div>
				<select bind:value={times[0]} on:change={onChoose} {disabled}>
					<option value="0">일</option>
					<option value="1">월</option>
					<option value="2">화</option>
					<option value="3">수</option>
					<option value="4">목</option>
					<option value="5">금</option>
					<option value="6">토</option>
				</select>요일 <input type="time" bind:value={times[1]} on:change={onChoose} {disabled} />
			</div>
			<Searcher
				width="100%"
				onlyGroup={true}
				bind:value={sano}
				{onChoose}
				tsc={true}
				bind:disabled
			/>
			<div>그룹 주기 : {parseInt(cycle)}초
				<svg on:click={onChoose} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
			  	</svg>
				<Button on:click={optimize} height="30px" colored={false}>옵셋 최적화</Button>
			</div>

			<div>
				<div class="title">
					<div>교차로명</div>
					<div>시속</div>

					<div>1현시</div>
					<div>2현시</div>
					<div>3현시</div>
					<div>4현시</div>
					<div>5현시</div>
					<div>6현시</div>
					<div>7현시</div>
					<div>8현시</div>

					<div>옵셋</div>
				</div>
				{#each [...lcs].reverse() as lc, ind}
					<div class="lcs">
						<div>{lc.lcno}. {lc.lcname}</div>
						<div class="phase" title="일괄조정(Shift키)">
							<div phid="{lc.lcno},B,spd" on:mousedown={dragMouseDown}>{spdKrev[spdKrev.length-1-ind]}</div>
							<div phid="{lc.lcno},A,spd" on:mousedown={dragMouseDown}>{spdK[spdK.length-1-ind]}</div>
						</div>

						<div class="phases">
							{#each lc.phaseA as A, i}
								<div class="phase">
									<div phid="{lc.lcno},B,{i}" on:mousedown={dragMouseDown}>
										{lc.phaseB[i] || ''}
									</div>
									<div phid="{lc.lcno},A,{i}" on:mousedown={dragMouseDown}>{A || ''}</div>
								</div>
							{/each}
						</div>
						<!-- <div class="phase" phid="{lc.lcno},{}" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[0]) || ''}</div>
                        <div class="phase" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[1]) || ''}</div>
                        <div class="phase" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[2]) || ''}</div>
                        <div class="phase" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[3]) || ''}</div>
                        <div class="phase" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[4]) || ''}</div>
                        <div class="phase" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[5]) || ''}</div>
                        <div class="phase" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[6]) || ''}</div>
                        <div class="phase" on:mousedown={dragMouseDown}>{parseInt(lc.phaseA[7]) || ''}</div> -->

						<div>{parseInt(lc.offset)}s</div>
					</div>
				{/each}
			</div>
		</div>
		<div>
			<TSC isDark={true} {isMove} bind:lineNum bind:lcs {cycle} speedK={spdK} speedKrev={spdKrev} />
		</div>
	</div>
</div>

<style>
	#main {
		--main-padding: 11px;
		font-size: 1.3rem;
		padding: var(--main-padding);
		width: 1170px;
		height: 750px;
	}
	.EntireDiv {
		width: calc(100%- (var(--main-padding) * 2));
		height: calc(100%- (var(--main-padding) * 2));
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #DBE2E6; */
		border-radius: 6px;
		background-color: #212830;
		display: grid;
		grid-template-columns: 1fr 700px;
		/* grid-row-gap: 10px; */
		padding: 10px;
	}
	.lcList {
		display: grid;
		grid-template-rows: 32px 32px 32px 1fr;
		gap: 9px;
	}
	.lcList > :first-child {
		width: 100%;
		border-radius: 4px;
		border: 1px solid #dadde1;
		line-height: 37px;
		text-align: center;
	}
	.lcList > :first-child > :is(input, select) {
		height: 21px;
		box-sizing: border-box;
		padding: 0 2px;
		font-size: 1.4rem;
		vertical-align: text-bottom;
		border: 1px solid #bbb;
		border-radius: 3px;
		color: #555;
	}
	.lcList > :first-child > :is(input, select):disabled {
		background-color: #999;
		opacity: 0.7;
	}
	.lcList > :nth-child(3) {
		width: 100%;
		position: relative;
		/* border-radius: 4px;
            border: 1px solid #DADDE1; */
		line-height: 34px;
		text-align: center;
	}
		.lcList > :nth-child(3) > svg {
			position: absolute;
			left:5px;
			top:5px;
			width:21px;
			color:white;
			cursor: pointer;
			border-radius: 1px;
		}
			.lcList > :nth-child(3) > svg:hover {
				color:#999;
				outline: 2px solid #999;
				outline-offset: 4px;
			}
			.lcList > :nth-child(3) > svg:active {
				color:#555;
				outline: 2px solid #555;
				outline-offset: 4px;
			}
		.lcList > :nth-child(3) > :global(button) {
			position: absolute;
			right:0;
			width: 75px;
		}

	.lcList > :last-child {
		width: 100%;
		border-radius: 4px;
		border: 1px solid #dadde1;
		overflow: hidden;
		position: relative;
		padding-top: 25px;
		line-height: 24px;
	}
	.lcList .title {
		position: absolute;
		top: -0.5px;
		height: 25px;
		text-align: center;
		width: 100.5%;
		display: grid;
		grid-template-columns: 14fr 5fr repeat(9, 3fr);
		background-color: #9ebdda;
		color: white;
		pointer-events: none;
	}

	/* 교차로리스트 */
	.lcList .lcs {
		height: 48px;
		float: right;
		text-align: center;
		width: 100%;
		display: grid;
		grid-template-columns: 14fr 5fr 24fr 3fr;
		/* background-color: white; */
		color: #777;
		user-select: none;
		border-bottom: 1px solid #ddd;
	}
		
	.lcList .lcs .phases {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
	}
	.lcList .lcs .phases > :first-child > :first-child {
		border-left: 2px solid #29e;
	}
	.lcList .lcs .phases > :first-child > :last-child {
		border-left: 2px solid #d77;
	}
		.lcList .lcs .phase > div {
			position: relative;
		}
			.lcList .lcs .phase > div > :global(input) {
				position:absolute;
				text-align:center;
				left:0;
				top:0;
				width:100%;
				height:100%;
				padding:0;
				border:0;
			}
			.lcList .lcs .phase > div > :global(input)::-webkit-outer-spin-button, 
			.lcList .lcs .phase > div > :global(input)::-webkit-inner-spin-button {
				-webkit-appearance: none;
  				margin: 0;
			}
		.lcList .lcs .phase > div:hover {
			cursor: ew-resize;
			outline: 1px solid #777;
		}
		.lcList .lcs .phase > div:active {
			background-color: #dfeffe;
		}

	.lcList .lcs > div {
		border-right: 1px solid #eee;
	}
</style>
