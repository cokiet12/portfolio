<svelte:options accessors />

<script>
	// @ts-nocheck
	import { devuimode } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import Tree from '$lib/nested/tree/App.svelte';
	import Input from '$lib/nested/input.svelte';
	import Dropdown from '$lib/nested/dropdown.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	// 창모드 / 싱글, 듀얼모드
	export let id;
	export let winMode = false;

	const consts = {};
	let stats = {
		// 운영 제어
		ctl_1: false,
		ctl_2: false,
		ctl_3: false,
		ctl_4: false,
		ctl_5: false,
		ctl_6: false,
		ctl_7: false,
		ctl_8: false,
		ctl_9: false,
		ctl_10: false,

		// 현시 제어
		phase_1: false,
		selectedPH1: 1,

		// 앞막힘 제어
		spill_1: false,
		selectedS1: 1,
		selectedS2: 1,
		selectedS3: 1,

		// PPC 제어
		ppc_1: false,

		// 시차제 제어
		plan_1: false,
		selectedPL1: 0,

		// 현시생략 및 유지
		radio1: 0,

		// 제어실행
		radio2: 0,

		// 운영모드
		radio3: 0,

		// 교차로 선택
		treeChecked: []
	};
	let elems = {};

	let list = [];
	let children = [];

	// 교차로 리스트
	let sa = document.lcCon.SAoperate;
	let lc = document.lcCon.LCs;
	let temp = { label: '교차로 리스트', children: null };
	let arr = [];

	Object.keys(lc).forEach((v, i) => {
		if (lc[v].main_lcno == 0) {
			arr.push({ label: Number(v) + '. ' + lc[v].lcname, val: Number(v) });
		}
	});

	temp.children = arr;
	children.push(temp);

	list = {
		label: 'ROOT',
		children: children
	};

	// 현시 번호
	let option1 = [
		{ id: 1, text: '1' },
		{ id: 2, text: '2' },
		{ id: 3, text: '3' },
		{ id: 4, text: '4' },
		{ id: 5, text: '5' },
		{ id: 6, text: '6' },
		{ id: 7, text: '7' },
		{ id: 8, text: '8' }
	];

	// 앞막힘 방향
	let option2 = [
		{ id: 1, text: '북' },
		{ id: 2, text: '동' },
		{ id: 3, text: '남' },
		{ id: 4, text: '서' },
		{ id: 5, text: '북동' },
		{ id: 6, text: '남동' },
		{ id: 7, text: '남서' },
		{ id: 8, text: '북서' }
	];

	// 적용 현시
	let option3 = [
		{ id: 1, text: 'A1' },
		{ id: 2, text: 'A2' },
		{ id: 3, text: 'A3' },
		{ id: 4, text: 'A4' },
		{ id: 5, text: 'A5' },
		{ id: 6, text: 'A6' },
		{ id: 7, text: 'A7' },
		{ id: 8, text: 'A8' },
		{ id: 9, text: 'B1' },
		{ id: 10, text: 'B2' },
		{ id: 11, text: 'B3' },
		{ id: 12, text: 'B4' },
		{ id: 13, text: 'B5' },
		{ id: 14, text: 'B6' },
		{ id: 15, text: 'B7' },
		{ id: 16, text: 'B8' }
	];

	// 시차제 플랜
	let option4 = [
		{ id: 0, text: '일반제' },
		{ id: 6, text: '시차제1' },
		{ id: 7, text: '시차제2' },
		{ id: 8, text: '시차제3' },
		{ id: 9, text: '시차제4' },
		{ id: 10, text: '시차제5' }
	];

	// 상세
	function ppcConfig(e) {
		document.createWindow('ppcConfig', id, e);
	}

	// 교차로 제어 다운로드
	function downloadCtrl() {
		let jsonArray = [];
		stats.treeChecked.forEach((v, i) => {
			let json = new Object();
			// 소등
			json['SHUTDOWN'] = Number(stats.ctl_1);
			// 점멸
			json['FLASH'] = Number(stats.ctl_2);
			// 조광제어
			json['LIGHT'] = Number(stats.ctl_3);
			// 수동허용
			json['MANUAL'] = Number(stats.ctl_4);
			// 모순사용
			json['CONFLICT'] = Number(stats.ctl_5);
			// 모순해제
			json['CONFLICT_RESET'] = Number(stats.ctl_6);
			// SCU
			json['SCU_RESET'] = Number(stats.ctl_7);
			// MCU
			json['MCU_RESET'] = Number(stats.ctl_8);
			// 감응제어
			json['TRC_CONTROL'] = Number(stats.ctl_9);
			// 보행자
			json['PED_BUTTON'] = Number(stats.ctl_10);
			// 현시생략
			json['PHASE_OMIT'] = stats.phase_1 ? (!stats.radio1 ? 1 : 0) : 0;
			// 현시유지
			json['PHASE_HOLD'] = stats.phase_1 ? (stats.radio1 ? 1 : 0) : 0;
			// 해당현시번호
			json['EXECUTE_PHASE'] = Number(stats.selectedPH1);
			// 앞막힘제어
			json['SPILLBACK'] = Number(stats.spill_1);
			// 앞막힘 방향
			json['SPILLBACK_DIR'] = stats.spill_1 ? Number(stats.selectedS1) : 0;
			// 적용주현시
			json['MAIN_SPILLBACK'] = stats.spill_1 ? Number(stats.selectedS2) : 0;
			// 적용부현시
			json['SUB_SPILLBACK'] = stats.spill_1 ? Number(stats.selectedS3) : 0;
			// PPC제어
			json['PPC_CONTROL'] = Number(stats.ppc_1);
			// 시차제적용
			json['TIME_CONROL'] = Number(stats.plan_1);
			// 시차제플랜번호
			json['PLANCLSS'] = Number(stats.selectedPL1);
			// 수행명령
			json['EXECUTE'] = stats.radio2;
			// ???
			json['XCONTROL'] = 0;
			// 교차로번호
			json['LCNO'] = Number(v);

			let string = JSON.stringify(json);
			jsonArray.push(string);
		});

		if (jsonArray.length) {
			document.callTcp('/specialcmd_down', jsonArray, (res) => {
				console.log(res);
			});
		} else {
			document.createMsg('선택된 교차로가 없습니다.');
		}
	}

	// 교차로 모드 다운로드
	function downloadMode() {
		let jsonArray = [];
		stats.treeChecked.forEach((v, i) => {
			let json = new Object();
			json['RING'] = (1)[('온라인감응', '오프라인감응', '온라인제어', '오프라인제어')];
			switch (stats.radio3) {
				case 0:
					json['CODE'] = 20; //온라인 감응
					break;
				case 1:
					json['CODE'] = 18; //오프라인 감응
					break;
				case 2:
					json['CODE'] = 22; //온라인 무감응
					break;
				case 3:
					json['CODE'] = 16; //오프라인 무감응
					break;
			}
			json['LCNO'] = Number(v);
			let string = JSON.stringify(json);
			jsonArray.push(string);
		});

		if (jsonArray.length) {
			document.callTcp('/lccontrol_down', jsonArray, (res) => {
				console.log(res);
			});
		} else {
			document.createMsg('선택된 교차로가 없습니다.');
		}
	}
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="grid">
			<div class="list">
				<div class="subject">교차로 리스트</div>
				<div class="wrap">
					<div class="tree">
						<Tree
							tree={list}
							width={''}
							height={'600px'}
							multiple={true}
							bind:checked={stats.treeChecked}
						/>
					</div>
				</div>
			</div>
			<div class="ctl">
				<div class="subject">교차로 제어</div>
				<div class="btn" on:click={downloadCtrl}>
					<img style="margin-right:5px; width:13px" src="/svg/button/download.svg" alt="" />
					다운로드
				</div>
				<div class="wrap">
					<!-- 교차로 제어 -->
					<div class="lcCtl content">
						<div class="title">교차로</div>
						<div class="tab">
							<Input type="checkbox1" bind:checked={stats.ctl_1}>소등</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_2}>점멸</Input>
							<div />
							<div />
							<Input type="checkbox1" bind:checked={stats.ctl_3}>조광제어</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_4}>수동허용</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_5}>모순사용</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_6}>모순해제</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_7}>SCU리셋</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_8}>MCU리셋</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_9}>감응제어</Input>
							<Input type="checkbox1" bind:checked={stats.ctl_10}>보행자버튼</Input>
						</div>
					</div>

					<!-- 현시  -->
					<div class="lcPhase content">
						<div class="title">
							현시
							<div><Input type="checkbox2" bind:checked={stats.phase_1} /></div>
						</div>
						<div class="tab">
							<div>
								<Input type="radio" radios={['생략', '유지']} bind:checked={stats.radio1} />
							</div>
							<div>현시번호</div>
							<div>
								<div class="sel">
									<select bind:value={stats.selectedPH1} class="static">
										{#each option1 as i}
											<option value={i.id}>
												{i.text}
											</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- 앞막힘 -->
					<div class="lcSpill content">
						<div class="title">
							앞막힘
							<div><Input type="checkbox2" bind:checked={stats.spill_1} /></div>
						</div>
						<div class="tab">
							<div>앞막힘 방향</div>
							<div>
								<div class="sel">
									<select bind:value={stats.selectedS1} class="static">
										{#each option2 as i}
											<option value={i.id}>
												{i.text}
											</option>
										{/each}
									</select>
								</div>
							</div>
							<div />
							<div />
							<div>적용 주현시</div>
							<div>
								<div class="sel">
									<select bind:value={stats.selectedS2} class="static">
										{#each option3 as i}
											<option value={i.id}>
												{i.text}
											</option>
										{/each}
									</select>
								</div>
							</div>
							<div>적용 부현시</div>
							<div>
								<div class="sel">
									<select bind:value={stats.selectedS3} class="static">
										{#each option3 as i}
											<option value={i.id}>
												{i.text}
											</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- PPC / 시차제 -->
					<div class="lcPPCPlan content">
						<div class="title">
							<div>
								PPC
								<div><Input type="checkbox2" bind:checked={stats.ppc_1} /></div>
							</div>
							<div>
								시차제
								<div><Input type="checkbox2" bind:checked={stats.plan_1} /></div>
							</div>
						</div>
						<div class="tab">
							<div>PPC 설정</div>
							<div><Button on:click={ppcConfig}>설정</Button></div>
							<div>시차제 플랜</div>
							<div>
								<div class="sel">
									<select bind:value={stats.selectedPL1} class="static">
										{#each option4 as i}
											<option value={i.id}>
												{i.text}
											</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- 수행 -->
					<div class="lcExcute content">
						<div class="title">수행</div>
						<div class="tab">
							<div>
								<Input type="radio" radios={['종료', '명령']} bind:checked={stats.radio2} />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mode">
				<div class="subject">운영모드</div>
				<div class="btn" on:click={downloadMode}>
					<img style="margin-right:5px; width:13px" src="/svg/button/download.svg" alt="" />
					다운로드
				</div>
				<div class="wrap">
					<!-- 운영모드 -->
					<div class="lcMode content">
						<div class="tab">
							<div>
								<Input
									type="radio"
									radios={['온라인감응', '오프라인감응', '온라인제어', '오프라인제어']}
									bind:checked={stats.radio3}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
		/* 높이(가변) */
		max-height: 900px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 630px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	/* 카드 */
	.EntireDiv {
		height: calc(100% - 32px);
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		padding: 10px;
	}

	/* 카드 Grid */
	.EntireDiv .grid {
		display: grid;
		grid-template-columns: auto 390px;
		grid-template-rows: auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
	}

	/* 교차로 리스트 */
	.EntireDiv .grid .list {
		grid-area: 1 / 1 / 3 / 2;
		display: grid;
		grid-template-rows: 20px auto;
		grid-row-gap: 10px;
	}

	/* 교차로 제어 */
	.EntireDiv .grid .ctl {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: 20px auto;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
		grid-area: 1 / 2 / 2 / 3;
	}
	.EntireDiv .grid .ctl .subject {
		grid-area: 1 / 1 / 2 / 2;
	}

	.EntireDiv .grid .ctl .btn {
		text-align: end;
		grid-area: 1 / 2 / 2 / 3;
		display: inline-flex;
		justify-content: flex-end;
	}

	.EntireDiv .grid .ctl .wrap {
		grid-area: 2 / 1 / 3 / 3;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
	}

	.EntireDiv .grid .ctl .wrap .content {
		display: grid;
		grid-template-rows: 30px auto;
		grid-row-gap: 6px;
	}

	/* 교차로 운영모드 */
	.EntireDiv .grid .mode {
		display: grid;
		grid-template-rows: 20px auto;
		grid-row-gap: 10px;
		grid-area: 2 / 2 / 3 / 3;
	}

	.EntireDiv .grid .mode .subject {
		grid-area: 1 / 1 / 2 / 2;
	}

	.EntireDiv .grid .mode .btn {
		display: inline-flex;
		justify-content: flex-end;
		text-align: end;
		grid-area: 1 / 2 / 2 / 3;
	}

	.EntireDiv .grid .mode .wrap {
		grid-area: 2 / 1 / 3 / 3;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
		align-content: center;
	}

	.EntireDiv .grid .wrap {
		border: 1px solid #86b5de;
		border-radius: 4px;
	}

	.EntireDiv .grid .subject {
		color: #666666;
	}

	.EntireDiv .grid .wrap .content .title {
		color: #666666;
	}

	.EntireDiv .grid .wrap .content .tab {
		padding-left: 10px;
	}

	.EntireDiv .grid .wrap .content .tab :global(label) {
		padding: 0;
	}

	.EntireDiv .grid .wrap .content .tab :global(label > div) {
		margin: 0 7px 0 0;
	}

	/* 교차로 제어 */
	.lcCtl .title {
		display: grid;
		align-items: center;
		border-bottom: 1px solid #666;
		height: 30px;
	}

	.lcCtl .tab {
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		align-items: center;
	}

	/* 현시생략 및 유지 */
	.lcPhase .title {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		border-bottom: 1px solid #666;
		height: 30px;
	}

	.lcPhase .title > div {
		display: grid;
		justify-content: end;
	}

	.lcPhase .tab {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		align-items: center;
	}

	.lcPhase .tab :global(.radio) {
		display: grid;
		grid-template-columns: 1fr 1fr !important;
		grid-column-gap: 10px;
		align-items: center;
	}

	/* 앞막힘 */
	.lcSpill .title {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		border-bottom: 1px solid #666;
		height: 30px;
	}

	.lcSpill .title > div {
		display: grid;
		justify-content: end;
	}

	.lcSpill .tab {
		display: grid;
		grid-template-rows: 1fr 1fr;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		align-items: center;
	}

	/* PPC */
	.lcPPCPlan .title {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 10px;
		align-items: center;
		border-bottom: 1px solid #666;
		height: 30px;
	}

	.lcPPCPlan .title > div {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
	}

	.lcPPCPlan .title > div > div {
		display: grid;
		justify-content: end;
	}

	.lcPPCPlan .tab {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-column-gap: 10px;
		align-items: center;
	}

	/* 수행 */
	.lcExcute .title {
		display: grid;
		align-items: center;
		border-bottom: 1px solid #666;
		height: 30px;
	}

	.lcExcute .tab {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
	}

	.lcExcute .tab :global(.radio) {
		display: grid;
		grid-template-columns: 1fr 1fr !important;
		grid-column-gap: 10px;
		align-items: center;
	}

	/* 운영모드 */
	.lcMode .tab :global(.radio) {
		display: grid;
		grid-template-rows: 1fr 1fr;
		grid-template-columns: 1fr 1fr !important;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		align-items: center;
	}

	/* DropDown */
	.sel {
		position: relative;
		overflow: hidden;

		height: 32px;
		font-size: 1.3rem;
		border-radius: 4px;
		border: 1px solid #dadde1;
		background-color: white;
	}

	.sel > select {
		width: 100%;
		height: calc(100% - 1px);
		padding: 0 5px;
		border: none;
		margin: 0;
		color: #0584fe;
		font-size: 1.3rem;
	}
</style>
