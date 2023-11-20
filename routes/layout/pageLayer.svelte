<script>
	// @ts-nocheck
	//함수
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	// import { menuInfo } from '$lib/js/consts.mjs';
	import {
		uimode,
		userName,
		userJson,
		mainMaps,
		lcStatis,
		opclrs,
		WASgap,
		settings
	} from '$lib/store.mjs';
	import {
		curlcno,
		mapDiv,
		menuOpen,
		summaryOpen,
		chartOpen,
		mapTheme,
		themeMode,
		globNameOff,
		globFlowOff,
		globGroupOff,
		showLC,
		showLoop,
		showSmart,
		showPush,
		curMainMap
	} from '$lib/user_info.mjs';
	import Input from '$lib/nested/input.svelte';
	import { Doughnut } from 'svelte-chartjs';
	// import {
	// Chart as ChartJS,
	// Title,
	// Tooltip,
	// Legend,
	// ArcElement,
	// CategoryScale,
	// } from 'chart.js';
	import Chart from 'chart.js/auto/auto.js';

	//네스티드
	import MenuBar from './menubar.svelte';
	import Summary from './summary.svelte';
	import Searcher from '$lib/nested/searcher.svelte';

	// ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
	uimode.set(0);
	let evfade = false;
	let evto = null;
	let evstat = 1;
	let evtext = '수신 이벤트 없음';
	let evactive = false;

	$: $userJson.maptheme = $mapTheme;
	$: $userJson.theme = $themeMode;
	$: $userJson.mapdiv = $mapDiv;
	$: $userJson.chartopen = $chartOpen;
	$: updateStatis($lcStatis);
	$: setWAStime($chartOpen);
	$: evTO(evactive);

	function evTO() {
		if (evactive) {
			if (evto) {
				clearTimeout(evto);
				evfade = false;
				evto = null;
			}
			evto = setTimeout(() => {
				evfade = true;
				evto = setTimeout(() => {
					evactive = false;
					evfade = false;
					evto = null;
				}, 2000);
			}, 3000);
		}
	}

	function updateStatis(st) {
		if (chart) {
			chart.data.datasets[0].data = [
				st.SCU,
				st.opmode1,
				st.opmode2,
				st.fixed,
				st.opmode4,
				st.opmode5,
				st.manual,
				st.flash
			];
			chart.update();
		}
	}

	let chart;

	// 랜덤
	function random() {
		let arr = [];
		for (let i = 0; i < 24; i++) {
			const rand = Math.floor(Math.random() * 41) + 1;
			arr.push(rand);
		}
		// console.log(arr)
		return arr;
	}
	const dayArr = ['일', '월', '화', '수', '목', '금', '토'];
	const cdata = {
		labels: [
			'08:00',
			'08:05',
			'08:10',
			'08:15',
			'08:20',
			'08:25',
			'08:30',
			'08:35',
			'08:40',
			'08:45'
		],
		datasets: [
			{
				label: '북',
				data: random(),
				backgroundColor: [
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)'
				],
				borderColor: [
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)',
					'rgba(10, 132, 255, 1)'
				],
				borderWidth: 1
			},
			{
				label: '동',
				data: random(),
				backgroundColor: [
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)'
				],
				borderColor: [
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)',
					'rgba(215, 121, 55, 1)'
				],
				borderWidth: 1
			},
			{
				label: '남',
				data: random(),
				backgroundColor: [
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)'
				],
				borderColor: [
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)',
					'rgba(155, 155, 155, 1)'
				],
				borderWidth: 1
			},
			{
				label: '서',
				data: random(),
				backgroundColor: [
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)'
				],
				borderColor: [
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)',
					'rgba(241, 188, 47, 1)'
				],
				borderWidth: 1
			}
		]
	};

	function setWAStime() {
		if ($WASgap && $chartOpen) {
			const fd = new Date(Number(new Date()) + $WASgap);

			const month = fd.getMonth() + 1;
			const date = fd.getDate();
			const day = dayArr[fd.getDay()];
			const hours = fd.getHours();
			const minutes = fd.getMinutes();
			const seconds = fd.getSeconds();
			// const millis = fd.getMilliseconds();

			CurDate = `${month}월 ${date}일 ${day}요일`;
			CurTime = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${
				seconds < 10 ? `0${seconds}` : seconds
			}`;
		}
	}

	onMount(async () => {
		document.evon = (stat, text) => {
			evactive = false;
			evactive = true;
			evstat = Number(stat);
			evtext = text;
		};
		const ctx = elems.canvas.getContext('2d');
		chart = new Chart(ctx, {
			type: 'bar',
			data: cdata,
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		setInterval(() => {
			setWAStime();
		}, 1000);

		// setInterval(() => {
		//     const a = Math.floor(Math.random() * 10);
		//     const b = Math.floor(Math.random() * 15);
		//     const c = Math.floor(Math.random() * 20);
		//     const data1 = [a,b,c,c,b,a,b,c];
		//     updateChart(myChart, data1);
		// },2000)

		// Chart 데이터 업데이트 함수
		// function updateChart(Chart, newData) { // newData는 Arr
		//     for(var i=0; i<newData.length; i++) {
		//         Chart.data.datasets[0].data[i] = newData[i];
		//     }
		//     Chart.update();
		// }
	});

	const consts = {
		uimodes: ['none', 'single', 'dual']
	};
	let stats = {
		uimode: 1,
		btn1open: false,
		btn2open: false,
		btn4open: false,
		check: [true, true, true, false, false], // 교통신호정보, 제어운영, 에러발생, 현시이동류, 그룹 구분
		check2: [true, false, false, false], // 교차로, 루프/영상, 스마트 영상, 압버튼
		MapRadio: 1, // 1: 기본맵, 2: 3분할 맵, 3: 4분할 맵
		test: null
	};
	let elems = {
		modal: null,
		canvas: null
	};

	// let pageName = new String();
	let pageName = new String();
	let pageNameKo = new String();
	let RightStd1 = [0, 0]; // 루프검지(2개)
	let RightStd2 = [3, 3]; // 보행감응(2개)
	let CurDate = '0월 0일 O요일'; // 현재 날짜
	let CurTime = '00:00:00'; // 현재 시간
	let SyncTime;
	let AllCnt = 0; // 전체 제어기
	let SyncCnt = 0; // 동기화된 제어기

	// 동기화 시간
	// fetch(`${settings.WASserver}/timeSyncUp`).then(async (res)=>{
	//     let dt = await res.json()
	//     if(Object.keys(dt.data).length){
	//         let year = (dt.data.year + 2000)
	//         let mon = dt.data.mon < 10 ? '0' + dt.data.mon : dt.data.mon
	//         let day = dt.data.day < 10 ? '0' + dt.data.day : dt.data.day
	//         let hour = dt.data.hour < 10 ? '0' + dt.data.hour : dt.data.hour
	//         let min = dt.data.min < 10 ? '0' + dt.data.min : dt.data.min
	//         let sec = dt.data.sec < 10 ? '0' + dt.data.sec : dt.data.sec

	//         SyncTime = year + '.' + mon + '.' + day + ' ' + hour + ':' + min + ':' + sec
	//     } else {
	//         SyncTime = "0000.00.00 00:00:00"
	//     }
	// })

	$: themeModeChanged($themeMode);
	$: mapThemeChanged($mapTheme);
	$: globModeChanged($globNameOff, $globFlowOff, $globGroupOff);
	$: globFacChanged($showLC, $showLoop, $showSmart, $showPush);
	$: $userJson.menuopen = $menuOpen;
	$: $userJson.curlcno = $curlcno;

	function panToLc() {
		$userJson.curmainmap = $curMainMap;
		const lcnode = document.lcCon.lcnodesArr.find((el) => el.lcno == $curlcno);

		// console.log($mainMaps)
		// console.log($curMainMap)
		// console.log($mainMaps[$curMainMap])
		if (lcnode) {
			$mainMaps[$curMainMap].getView().animate({
				center: [lcnode.node_lng, lcnode.node_lat],
				duration: 300
			});
		}
	}

	function themeModeChanged(tm) {
		if (typeof document !== 'undefined') {
			console.log(tm);
			if (tm) {
				document.body.classList.add('dark');
			} else {
				document.body.classList.remove('dark');
			}
		}
	}

	function mapThemeChanged(tm) {
		if (typeof document !== 'undefined') {
			console.log(tm);
			switch (tm) {
				case 0:
					document.body.style.setProperty('--filter', 'brightness(0.97) saturate(0.7)');
					break;
				case 1:
					document.body.style.setProperty('--filter', 'brightness(0.4) saturate(0.9)');
					break;
				case 2:
					document.body.style.setProperty(
						'--filter',
						'invert(1) hue-rotate(180deg) contrast(0.75) brightness(1.2) saturate(0.5)'
					);
					break;
			}
		}
	}

	function globModeChanged(name, flow, group) {
		if (typeof document !== 'undefined') {
			if (name) {
				document.body.classList.remove('globNameOff');
			} else {
				document.body.classList.add('globNameOff');
			}
			if (flow) {
				document.body.classList.remove('globFlowOff');
			} else {
				document.body.classList.add('globFlowOff');
			}
			if (group) {
				document.body.classList.remove('globGroupOff');
			} else {
				document.body.classList.add('globGroupOff');
			}
		}
		let bin = String(Number(name)) + String(Number(flow)) + String(Number(group));
		$userJson.mapmarker = parseInt(bin, 2);
	}
	function globFacChanged(lc, loop, smart, push) {
		if (typeof document !== 'undefined') {
			if (lc) {
				document.body.classList.remove('globLcOff');
			} else {
				document.body.classList.add('globLcOff');
			}
			if (loop) {
				document.body.classList.remove('globLoopOff');
			} else {
				document.body.classList.add('globLoopOff');
			}
			if (smart) {
				document.body.classList.remove('globSmartOff');
			} else {
				document.body.classList.add('globSmartOff');
			}
			if (push) {
				document.body.classList.remove('globPushOff');
			} else {
				document.body.classList.add('globPushOff');
			}
		}
		let bin =
			String(Number(lc)) + String(Number(loop)) + String(Number(smart)) + String(Number(push));
		$userJson.fac = parseInt(bin, 2);
	}

	// $:if (stats.uimode) {
	//     setTimeout(()=>{
	//         uimode.set(stats.uimode);
	//     })
	// }

	$: if ($page.url) {
		//페이지 열릴 때
		pageName = $page.url.pathname.replace(/\//g, '');
	}
	let test = 0;

	const data = {
		labels: [
			'SCU 고정주기',
			'로컬',
			'로컬감응',
			'현시유지',
			'센터감응',
			'센터',
			'수동운영',
			'점멸'
		],
		datasets: [
			//0 SCU, 1 로컬, 2 로컬감응, 3 현시유지, 4 센터감응, 5 센터, 6 수동운영
			{
				label: '초기데이타',
				data: [0, 0, 0, 0, 0, 0, 0, 0],
				backgroundColor: opclrs,
				// hoverOffset: 4,
				borderWidth: 0
			}
		]
	};
	const config = {
		type: 'doughnut',
		data: data,
		options: {
			borderRadius: '1',
			maintainAspectRatio: false,
			responsive: false,
			cutout: '60%',
			spacing: 2,
			plugins: {
				legend: {
					position: 'bottom',
					display: false,
					labels: {
						usePointStyle: true,
						padding: 20,
						font: {
							size: 12
						}
					}
				}
			}
		}
	};

	// function test1() { console.log(stats.MapRadio);}; // 지도 분할 onChange ex
	// function test2() { console.log($themeMode);}; // 테마 onChange ex

	// @ts-ignore
	// $: pageNameKo = menuInfo[pageName];
	function btn1false(e) {
		if (e.target.closest('.MapFp') || e.target.closest('.MapFpDiv')) {
			return;
		}
		stats.btn1open = false;
		document.removeEventListener('click', btn1false);
	}
	function btn4false(e) {
		if (e.target.closest('.hbtn1') || e.target.closest('.LoginDiv')) {
			return;
		}
		stats.btn4open = false;
		document.removeEventListener('click', btn4false);
	}
	function btn1() {
		if (stats.btn1open) {
			stats.btn1open = false;
			document.removeEventListener('click', btn1false);
		} else {
			stats.btn1open = true;
			document.addEventListener('click', btn1false);
		}
	}
	function btn2() {
		stats.btn2open = !stats.btn2open;
	}
	function btn3() {
		$chartOpen = !$chartOpen;
	}
	function btn4() {
		if (stats.btn4open) {
			stats.btn4open = false;
			document.removeEventListener('click', btn4false);
		} else {
			stats.btn4open = true;
			document.addEventListener('click', btn4false);
		}
	}
</script>

<uimodeLayer class:dashboard={$uimode == 0}>
	<div
		class="header"
		class:btn1open={stats.btn1open}
		class:btn2open={stats.btn2open}
		class:btn3open={$chartOpen}
		class:btn4open={stats.btn4open}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="#6e6e6e"
			on:click={() => {
				$menuOpen = !$menuOpen;
			}}
		>
			<path
				fill-rule="evenodd"
				d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
				clip-rule="evenodd"
			/>
		</svg>
		<div
			class="eventbox"
			class:active={evactive}
			class:evfade
			class:err={evstat == 0}
			class:norm={evstat == 1}
			class:posit={evstat == 2}
			on:click={(e) => {
				if (evactive) {
					document.createWindow('eventInq', false, e, { tabVal: 2 });
				} else {
					evactive = true;
				}
			}}
		>
			<div class="icon">
				<svg
					id="그룹_7641"
					data-name="그룹 7641"
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 20 19.403"
				>
					<g id="그룹_7643" data-name="그룹 7643">
						<path
							id="패스_2718"
							data-name="패스 2718"
							d="M19.707,15.649h0L12.073,1.319A2.17,2.17,0,0,0,10.008.005H9.883a2.229,2.229,0,0,0-2,1.251L.247,15.649a2.72,2.72,0,0,0,.125,2.5A2.5,2.5,0,0,0,2.5,19.4H17.454a2.306,2.306,0,0,0,2.128-1.251,2.4,2.4,0,0,0,.125-2.5M9.883,6.388c.626,0,1,.313.939.876l-.313,5.006a.629.629,0,0,1-1.251,0L8.944,7.326c-.063-.563.313-.939.939-.939m0,7.259a1,1,0,1,1-1,1,.988.988,0,0,1,1-1"
							transform="translate(0 0)"
							fill="currentColor"
						/>
					</g>
				</svg>
			</div>
			<div class="text">
				{@html evtext}
			</div>
			<div class="icon2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					width="15"
					height="15"
					viewBox="0 0 20 20"
				>
					<defs>
						<clipPath id="clip-path">
							<rect id="사각형_771" data-name="사각형 771" width="10" height="5.821" fill="#666" />
						</clipPath>
					</defs>
					<g id="그룹_6342" data-name="그룹 6342" transform="translate(-16 -58) rotate(-90)">
						<rect
							id="사각형_772"
							data-name="사각형 772"
							width="20"
							height="20"
							transform="translate(-78 16)"
							fill="#c5c5c5"
							opacity="0"
						/>
						<g id="그룹_4831" data-name="그룹 4831" transform="translate(-63 29.821) rotate(180)">
							<g id="그룹_4830" data-name="그룹 4830" clip-path="url(#clip-path)">
								<path
									id="패스_1187"
									data-name="패스 1187"
									d="M9.725,5.539a.918.918,0,0,1-.677.276A.834.834,0,0,1,8.4,5.539H8.371L4.988,2.156,1.63,5.539A.952.952,0,0,1,0,4.862a.919.919,0,0,1,.276-.677L4.111.376A1.231,1.231,0,0,1,5.013,0a1.271,1.271,0,0,1,.9.351V.376L9.725,4.186a.969.969,0,0,1,0,1.353"
									transform="translate(0 0)"
									fill="#666"
								/>
							</g>
						</g>
					</g>
				</svg>
			</div>
		</div>
		<img src="/svg/mainLogo.png" />
		<span class="title">스마트 교차로</span>
		<Searcher bind:value={$curlcno} onChoose={panToLc} />
		<div class="hbtn1 ll" on:click={btn4}>
			<img class="hsvg ll" src="/svg/admin.svg" />
		</div>
		<div class="hbtn1 ff" on:click={btn3}>
			<img class="hsvg ff" src="/svg/staticbtn.svg" />
		</div>
		<!-- <div class="Smarttr" on:click={btn2}>
            <img class="Mapbtn" src="/svg/smart.svg"/>
            <span class="smalltitle">스마트교통신호운영</span>
            <img class="dropdown" src="/svg/arrow_down.svg"/>
        </div> -->
		<div class="MapFp" on:click={btn1}>
			<img class="Mapbtn" src="/svg/mapfp.svg" />
			<span class="smalltitle">지도기능선택</span>
			<img class="dropdown" src="/svg/arrow_down.svg" />
		</div>
	</div>
	<div class="body" class:menuopen={$menuOpen} class:summaryopen={$summaryOpen}>
		<div class="menu">
			<div class="newNScrollBar">
				<MenuBar />
			</div>
			<!-- <div class="newNScrollBar"> 
                <Summary></Summary>
            </div> -->
		</div>
		<!-- <div class="content">
            <div class="path"> <span>대메뉴 / </span><b>메뉴</b> </div>
            <div class="page">
                <div class="singleSide" class:dn={stats.uimode != 1}>
                    <img src="/leftside_mock.png" alt="no image"/>
                </div>
                <div class="single" bind:this={elems.modal}>
                    <div class="title">
                        {pageNameKo}
                    </div>
                    <slot></slot>
                    <div bind:this={elems.page}></div>
                </div>
                <div class="dual">
                    <div class="title">
                        {pageNameKo}
                    </div>
                    <slot></slot>
                </div>
            </div>
        </div> -->
		<div class="MapFpDiv" class:btn1open={stats.btn1open}>
			<div class="Fpentire">
				<div class="smalltitle">교차로 표출모드</div>
				<div class="RadioDiv">
					<div class="MapRadio">교차로</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapmd" hidden bind:group={$themeMode} value={0} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="RadioDiv lt">
					<div class="MapRadio">그룹</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapmd" hidden bind:group={$themeMode} value={1} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="smalltitle">지도 테마</div>
				<div class="RadioDiv">
					<div class="MapRadio">기본</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapth" hidden bind:group={$mapTheme} value={0} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="RadioDiv">
					<div class="MapRadio">어둡게</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapth" hidden bind:group={$mapTheme} value={1} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="RadioDiv lt">
					<div class="MapRadio">반전</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapth" hidden bind:group={$mapTheme} value={2} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="smalltitle">지도 분할</div>
				<div class="RadioDiv">
					<div class="MapRadio">기본 맵</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapfc" hidden bind:group={$mapDiv} value={0} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="RadioDiv">
					<div class="MapRadio">2분할 맵</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapfc" hidden bind:group={$mapDiv} value={1} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="RadioDiv">
					<div class="MapRadio">3분할 맵</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapfc" hidden bind:group={$mapDiv} value={2} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<div class="RadioDiv lt">
					<div class="MapRadio">4분할 맵</div>
					<div class="radio">
						<label>
							<input type="radio" name="mapfc" hidden bind:group={$mapDiv} value={3} />
							<div>
								<div />
							</div>
						</label>
					</div>
				</div>
				<!-- <div class="smalltitle">시설물</div>
                <div class="RadioDiv">
                    <div class="MapRadio">교차로</div>
                    <div class="MapIp">
                        <Input width="70px" type="checkbox1" bind:checked={$showLC}></Input>
                    </div>
                </div>
                <div class="RadioDiv">
                    <div class="MapRadio">(루프)검지기</div>
                    <div class="MapIp">
                        <Input width="70px" type="checkbox1" bind:checked={$showLoop}></Input>
                    </div>
                </div>
                <div class="RadioDiv">
                    <div class="MapRadio">카메라</div>
                    <div class="MapIp">
                        <Input width="70px" type="checkbox1" bind:checked={$showSmart}></Input>
                    </div>
                </div>
                <div class="RadioDiv">
                    <div class="MapRadio">압버튼</div>
                    <div class="MapIp">
                        <Input width="70px" type="checkbox1" bind:checked={$showPush}></Input>
                    </div>
                </div> -->
			</div>
		</div>
		<div class="LoginDiv" class:btn4open={stats.btn4open}>
			<div class="LoginText">{$userName}</div>
			<div
				class="LogoutDiv"
				on:click={() => {
					document.logout();
				}}
			>
				<img class="LogImg" src="/svg/logout.svg" />
				<div class="LoginBtn">로그아웃</div>
			</div>
		</div>
		<div class="SmartOp" class:btn2open={stats.btn2open}>
			<div class="SmartDiv">
				<div class="SmartContent">
					<!-- 교통신호정보(교차로) -->
					<div style="line-height:33.59px;">교차로 태그</div>
					<div class="InputDiv">
						<Input type="checkbox1" bind:checked={$globNameOff} />
					</div>
				</div>
				<div class="SmartContent">
					<div style="line-height:33.59px;">현시이동류</div>
					<div class="InputDiv">
						<Input type="checkbox1" bind:checked={$globFlowOff} />
					</div>
				</div>
				<div class="SmartContent">
					<div style="line-height:33.59px;">그룹 구분</div>
					<div class="InputDiv">
						<Input type="checkbox1" bind:checked={$globGroupOff} />
					</div>
				</div>
			</div>
		</div>
		<div class="newStdiv" class:btn3open={$chartOpen}>
			<div class="timeStamp">
				<div />
				<div class="curDate">{CurDate}</div>
				<div class="curTime">{CurTime}</div>
			</div>
			<div />
			<div class="firstSt">
				<div class="percentDiv">
					<div class="ptitle">뉴코아아웃렛사거리</div>
					<!-- <div class="ptitle">정상운영&nbsp;</div>
                    <dic class="ptext">{($lcStatis.norm / $lcStatis.sum % 100) || 0}%</dic> -->
				</div>
				<div />
				<div class="percontent">
					<canvas style="margin:auto;" width={350} height={200} bind:this={elems.canvas} />
				</div>
			</div>
			<div />
			<div class="secondSt">
				<div class="sStitle">이벤트</div>
				<div />
				<div class="sScontent">
					<div style="width:100%; height:15px;" />
					<!-- <canvas style="margin:auto;" width={210} height={180} bind:this={elems.canvas}/> -->
					<div
						class="Chartlegend"
						style="width:100%; margin-top:10px; height:calc(100% - 215px);"
					/>
					<div style="width:100%; height:10px;" />
				</div>
			</div>
			<div />
			<div class="lastSt">
				<div />
				<div class="lastDance">
					<span class="lD1S">마지막 시간동기화:</span>
					<div />
					<span class="lD2S">{SyncTime}</span>
				</div>
				<div />
				<div class="lastDance">
					<span class="lD1S">동기화된 제어기:</span>
					<div />
					<span class="lD2S">{SyncCnt} / {$lcStatis.sum ? $lcStatis.sum : AllCnt}</span>
				</div>
				<div />
			</div>
		</div>
	</div>
</uimodeLayer>

<style>
	.dn {
		display: none;
	}
	uimodeLayer {
		--header-height: 50px;

		position: absolute;
		z-index: 3;
		background-color: #eaeff3;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
	}
	uimodeLayer.dashboard {
		background-color: transparent;
	}
	uimodeLayer.dashboard .content {
		display: none;
	}
	uimodeLayer .header {
		-ms-user-select: none;
		-moz-user-select: -moz-none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		user-select: none;
		width: 100%;

		height: var(--header-height);
		background-color: #181d23;
		/* background-image: url("/upper_mock.png"); */
		background-repeat: no-repeat;
		outline: 1px solid #404750;
		pointer-events: all;

		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}
	.header .eventbox {
		cursor: default;
		opacity: 0.3;
		color: #999;

		box-sizing: border-box;
		position: absolute;
		left: 50vw;
		top: 57px;
		transform: translateX(-50%);
		background-color: #181d23;
		border-radius: 10px;
		border: 1px solid white;
		min-width: 350px;
		height: 35px;

		display: grid;
		grid-template-columns: 35px 1fr 35px;
	}
	.header .eventbox.err {
		border: 1px solid #f4574b;
	}
	.header .eventbox.posit {
		border: 1px solid #00cf80;
	}
	.header .eventbox.active {
		cursor: pointer;
		opacity: 1;
	}
	.header .eventbox.evfade {
		transition: opacity 2s ease;
		opacity: 0.3;
	}
	.header .eventbox:not(.active):hover {
		opacity: 0.7;
	}
	.eventbox > .icon svg {
		padding: 8.5px 10px;
	}
	.eventbox > .text {
		padding: 9px 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.eventbox.norm :global(:is(.icon, b)) {
		color: #ccc;
	}
	.eventbox.posit :global(:is(.icon, b)) {
		color: #00cf80;
	}
	.eventbox.err :global(:is(.icon, b)) {
		color: #f4574b;
	}
	.eventbox > .icon2 svg {
		padding: 8.5px 10px;
	}
	uimodeLayer .header > :is(svg, div > svg) {
		float: left;
		width: 25px;
		padding: 7px;
		margin: 5px 2px;
		cursor: pointer;
	}
	uimodeLayer .header :global(.searcher :is(input, .cover)) {
		background-color: #212830;
	}
	uimodeLayer .header img {
		float: left;
		height: 25px;
		vertical-align: top;
		margin: 11px 9px 0 4px !important;
	}
	uimodeLayer .header .hbtn1 {
		float: right;
		background-color: rgba(255, 255, 255, 0);
		margin: 5px 10px 0px 0px;
		height: 40px;
		width: 40px;
		border-radius: 8px;
		cursor: pointer;
	}
	uimodeLayer .header.btn3open .hbtn1.ff {
		background-color: #282d31;
	}
	uimodeLayer .header.btn4open .hbtn1.ll {
		background-color: #282d31;
	}
	uimodeLayer .header .hbtn1:hover {
		background-color: rgba(255, 255, 255, 0.5) !important;
	}
	uimodeLayer .header .hbtn1:hover > .hsvg {
		filter: invert(45%) sepia(37%) saturate(6852%) hue-rotate(192deg) brightness(98%) contrast(103%) !important;
	}
	uimodeLayer .header.btn3open .hsvg.ff {
		filter: invert(45%) sepia(37%) saturate(6852%) hue-rotate(192deg) brightness(98%) contrast(103%);
	}
	uimodeLayer .header.btn4open .hsvg.ll {
		filter: invert(45%) sepia(37%) saturate(6852%) hue-rotate(192deg) brightness(98%) contrast(103%);
	}
	uimodeLayer .header .Smarttr {
		float: right;
		background-color: rgba(255, 255, 255, 0);
		margin: 5px 50px 0px 0px;
		height: 40px;
		width: 175px;
		border-radius: 8px;
		cursor: pointer;
	}
	uimodeLayer .header .Smarttr {
		float: right;
		background-color: rgba(255, 255, 255, 0);
		margin: 5px 50px 0px 0px;
		height: 40px;
		width: 175px;
		border-radius: 8px;
		cursor: pointer;
	}
	uimodeLayer .header.btn2open .Smarttr {
		background-color: rgba(255, 255, 255, 1);
	}
	uimodeLayer .header.btn2open .Smarttr .smalltitle {
		color: #0584fe;
	}
	uimodeLayer .header.btn2open .Smarttr .Mapbtn {
		filter: invert(45%) sepia(37%) saturate(6852%) hue-rotate(192deg) brightness(98%) contrast(103%);
	}
	uimodeLayer .header .Smarttr:hover {
		background-color: rgba(255, 255, 255, 0.5) !important;
	}
	uimodeLayer .header .Smarttr:hover > .smalltitle {
		color: #0584fe;
	}
	uimodeLayer .header .Smarttr:hover > .Mapbtn {
		filter: invert(45%) sepia(37%) saturate(6852%) hue-rotate(192deg) brightness(98%) contrast(103%) !important;
	}
	uimodeLayer .header .MapFp {
		float: right;
		background-color: rgba(255, 255, 255, 0);
		margin: 5px 2px 0px 0px;
		height: 40px;
		width: 140px;
		border-radius: 8px;
		cursor: pointer;
	}
	uimodeLayer .header.btn1open .MapFp {
		background-color: #282d31;
	}
	uimodeLayer .header.btn1open .MapFp .smalltitle {
		color: #0584fe;
	}
	uimodeLayer .header.btn1open .MapFp .Mapbtn {
		filter: invert(45%) sepia(37%) saturate(6852%) hue-rotate(192deg) brightness(98%) contrast(103%);
	}
	uimodeLayer .header .MapFp:hover {
		background-color: rgba(255, 255, 255, 0.5) !important;
	}
	uimodeLayer .header .MapFp:hover > .smalltitle {
		color: #0584fe;
	}
	uimodeLayer .header .MapFp:hover > .Mapbtn {
		filter: invert(45%) sepia(37%) saturate(6852%) hue-rotate(192deg) brightness(98%) contrast(103%) !important;
	}
	uimodeLayer .header .Mapbtn {
		float: left !important;
		height: 18px !important;
		vertical-align: top;
		margin: 11px 8px 0 12px !important;
	}
	uimodeLayer .header .hsvg {
		float: left !important;
		height: 40px !important;
		vertical-align: top;
		margin: 0px 0px 0 0px !important;
	}
	uimodeLayer .header .dropdown {
		float: left !important;
		height: 20px !important;
		vertical-align: top;
		margin: 10px 8px 0 5px !important;
	}
	uimodeLayer .header .title {
		float: left;
		font-size: 1.8rem;
		line-height: 5.7rem;
		font-weight: bolder;
		height: 100%;
		display: block;

		color: #a4b5cb;
	}
	uimodeLayer .header .smalltitle {
		float: left;
		font-size: 1.4rem;
		line-height: 4.9rem;
		font-weight: bolder;
		height: 100%;
		display: block;

		color: #666666;
	}
	uimodeLayer .header > :global(.searcher) {
		margin: 9px 0 0 45px;
		float: left;
	}
	uimodeLayer .header fieldset {
		text-align: center;
		height: 35px;
		padding: 2px 21px;
		margin: 5px 7px;
		float: right;
		display: inline;
	}
	uimodeLayer .body {
		--body-padding: 3px;
		--menu-width: 0px;
		--summary-width: 0px;

		width: 100%;
		height: calc(100% - var(--header-height));
		padding: var(--body-padding);
	}
	uimodeLayer .MapFpDiv {
		display: none;
		position: absolute;
		width: 180px;
		/* height: 484px; */
		height: 455px;
		background: #181d23;
		border: 1px solid #7cb0de;
		border-radius: 10px;
		/* opacity: 0.9; */
		z-index: 9;
		pointer-events: all;
		margin-left: calc(100% - 287px);
		font-size: 1.4rem;
		color: #999999;
	}
	uimodeLayer .MapFpDiv.btn1open {
		display: block;
	}
	uimodeLayer .MapFpDiv .Fpentire {
		height: 100%;
		margin: 12px 12px 15px 12px;
	}
	uimodeLayer .MapFpDiv .smalltitle {
		float: left;
		width: 100%;
		height: 19px;
		font-size: 1.3rem;
		margin-bottom: 7px;
		color: #ccc;
	}
	uimodeLayer .MapFpDiv .RadioDiv {
		width: 100%;
		height: 35px;
		display: grid;
		grid-template-columns: 80% 20%;
	}
	uimodeLayer .MapFpDiv .RadioDiv.lt {
		margin-bottom: 20px;
	}
	uimodeLayer .MapFpDiv .MapRadio {
		line-height: 35px;
		margin-left: 1px;
	}
	uimodeLayer .MapFpDiv .MapIp {
		margin-top: 6px;
		overflow: hidden;
	}
	uimodeLayer .SmartOp {
		display: none;
		position: absolute;
		width: 180px;
		height: 140px;
		box-shadow: 0px 0px 10px #0000001a;
		background: #ffffff;
		border: 1px solid #7cb0de;
		border-radius: 10px;
		opacity: 0.9;
		z-index: 9;
		pointer-events: all;
		margin-left: calc(100% - 335px);
		font-size: 1.4rem;
		color: #666666;
	}
	uimodeLayer .SmartOp.btn2open {
		display: block;
	}
	uimodeLayer .SmartOp .SmartDiv {
		display: grid;
		grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
		height: calc(100% - 32px);
		margin: 18px 15px;
	}
	uimodeLayer .SmartOp .SmartDiv .SmartContent {
		display: grid;
		grid-template-columns: 80% 20%;
		height: 100%;
	}
	uimodeLayer .SmartOp .SmartDiv .SmartContent .InputDiv {
		margin-top: 5px;
		overflow: hidden;
	}
	uimodeLayer .LoginDiv {
		display: none;
		position: absolute;
		float: right;
		width: 125px;
		height: 80px;
		background-color: #212830;
		border-radius: 10px;
		border: 1px solid #7cb0de;
		pointer-events: all;
		z-index: 10;
		margin-left: calc(100% - 135px);
	}
	uimodeLayer .LoginDiv.btn4open {
		display: block;
	}
	uimodeLayer .LoginDiv .LoginText {
		margin: 8px 6px 0px 16px;
		width: calc(100% - 22px);
		height: 32px;
		line-height: 32px;
		font-size: 1.4rem;
		color: #a4b5cb;
	}
	uimodeLayer .LoginDiv .LogoutDiv {
		display: grid;
		grid-template-columns: 17% 83%;
		margin: 0px 6px 8px 6px;
		width: calc(100% - 12px);
		height: 32px;
		cursor: pointer;
		line-height: 32px;
		font-size: 1.4rem;
		border-radius: 4px;
		color: #ddd;
	}
	uimodeLayer .LoginDiv .LogoutDiv:hover {
		background-color: #111;
	}
	uimodeLayer .LoginDiv .LogoutDiv .LogImg {
		margin-top: 9px;
		margin-left: 10px;
	}
	uimodeLayer .LoginDiv .LogoutDiv .LoginBtn {
		margin-left: 7px;
	}
	uimodeLayer .newStdiv.btn3open {
		position: relative;
		display: grid;
		grid-template-rows: 11% 25px calc(34% - 35px) 10px calc(45% - 10px) 10px 10%;
		float: right;
		width: 350px;
		height: 90%;
		padding: 15px;
		margin-right: 5px;
		background: #181d23;
		border-radius: 15px;
		pointer-events: all;
		min-height: 800px;
		max-height: 800px;
	}
	.radio {
		overflow: hidden;
	}
	.radio > label {
		cursor: pointer;
		vertical-align: middle;
	}
	.radio > label > div {
		display: inline-block;
		background-color: white;
		width: 12px;
		height: 12px;
		border-radius: 12px;
		transition: border 0.1s ease-out;
		margin: 10px 7px 0px 7px;
		float: left;

		border: 2px solid #cccccc;
	}
	div.radio > label > div > div {
		width: 8px;
		height: 8px;
		margin: 2px auto;
		border-radius: 8px;

		background-color: #cccccc;
	}
	div.radio > label > input:checked + div {
		border: 2px solid #0584fe;
	}
	div.radio > label > input:checked + div > div {
		background-color: #0584fe;
	}
	uimodeLayer .newStdiv {
		display: none;
	}
	uimodeLayer .newStdiv .timeStamp {
		display: grid;
		grid-template-rows: calc(100% - 74px) 18px 56px;
		color: #aecde8;
		text-align: center;
	}
	uimodeLayer .newStdiv .timeStamp .curDate {
		font-size: 1.6rem;
	}
	uimodeLayer .newStdiv .timeStamp .curTime {
		font-size: 5.4rem;
	}

	uimodeLayer .newStdiv .firstSt {
		display: grid;
		grid-template-rows: 20px 10px calc(100% - 30px);
	}
	uimodeLayer .newStdiv .firstSt .percentDiv {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	uimodeLayer .newStdiv .firstSt .percentDiv .ptext {
		font-size: 1.5rem;
		color: #0584fe;
		font-weight: bolder;
	}
	uimodeLayer .newStdiv .firstSt .percontent {
		/* display:grid; */
		width: 100%;
		/* grid-template-columns: calc(50% - 5px) 10px calc(50% - 5px); */
	}
	uimodeLayer .newStdiv .firstSt .percontent .leftpdiv,
	uimodeLayer .newStdiv .firstSt .percontent .r1div {
		background: #212830;
		border-radius: 8px;
	}
	.lf1pdv {
		margin: 20px 25px;
		height: calc(100% - 40px);
		display: grid;
		grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
	}
	.pdivD {
		font-size: 1.4rem;
		font-weight: normal;
	}
	.pltitle {
		display: flex;
		height: 100%;
		align-items: center;
		width: 52px;
		color: #999999;
		float: left;
		justify-content: right;
	}
	.plcnt {
		display: flex;
		height: 100%;
		align-items: center;
		color: #666666;
		float: right;
	}
	uimodeLayer .newStdiv .firstSt .percontent .rightpdiv {
		display: grid;
		grid-template-rows: calc(50% - 5px) 10px calc(50% - 5px);
	}
	.r1div {
		height: 100%;
		display: grid;
		grid-template-rows: 10px 20% 3px calc(40% - 11px) calc(40% - 11px) 7px;
	}
	.tttttile {
		font-size: 1.5rem;
		font-weight: bold;
		color: #666666;
		text-align: center;
	}
	.pdivD2 {
		font-size: 1.4rem;
		font-weight: normal;
		margin-left: 21px;
		margin-right: 33px;
	}

	uimodeLayer .newStdiv .secondSt {
		display: grid;
		grid-template-rows: 20px 10px calc(100% - 30px);
	}
	.sStitle,
	.ptitle {
		font-size: 1.5rem;
		font-weight: bold;
		text-align: center;

		color: #85878a;
	}

	.sScontent {
		background: #212830;
		border-radius: 8px;
	}

	.Chartlegend {
		width: 100%;
		height: calc(100% - 205px);
		margin-top: 10px;
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
	}

	.ttttest {
		border-radius: 50%;
		width: 9px;
		height: 9px;
		background-color: #333333;
		margin-left: 20px;
		margin-top: 4px;
	}

	.Clegend {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		align-items: center;
	}

	.CCCCCleg1 {
		display: grid;
		grid-template-columns: 0.5fr 1fr;
		font-size: 1.4rem;
		color: #999999;
	}

	.CCCCCleg2 {
		display: grid;
		grid-template-columns: 0.5fr 1fr;
		font-size: 1.4rem;
		color: #999999;
	}

	.CCCCCleg3 {
		display: grid;
		grid-template-columns: 0.5fr 1fr;
		font-size: 1.4rem;
		color: #999999;
	}

	uimodeLayer .newStdiv .lastSt {
		background: #212830;
		border-radius: 8px;
		display: grid;
		grid-template-rows: 17px calc(50% - 22px) 10px calc(50% - 22px) 17px;
	}
	.lastDance {
		display: grid;
		grid-template-columns: 100px 20px calc(100% - 120px);
		margin-left: 25px;
		font-size: 1.4rem;
		font-weight: normal;
	}
	.lD1S {
		display: flex;
		align-items: center;
		justify-content: right;
		color: #999999;
	}
	.lD2S {
		display: flex;
		align-items: center;
		color: #666666;
	}

	uimodeLayer .body.menuopen {
		--menu-width: 211px;
	}
	uimodeLayer .body.summaryopen {
		--summary-width: 400px;
	}

	uimodeLayer .menu {
		border-radius: 9px;
		height: calc(100% - (var(--body-padding) * 2));
		float: left;
		background-color: #212830;
		box-shadow: 0px 0px 3px #0000000d;
	}
	uimodeLayer .menu > :first-child {
		width: var(--menu-width);
		height: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		pointer-events: all;
		float: left;
		border-radius: 8px;
		padding-top: 7px;

		transition: width 0.05s;
	}
	uimodeLayer .menu > :nth-child(2) {
		width: var(--summary-width);
		height: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		pointer-events: all;
		float: left;
		border-radius: 8px;
		padding-top: 7px;

		transition: width 0.05s;
	}
	uimodeLayer .content {
		--cont-padding: 11px;

		width: calc(100% - var(--menu-width) - (var(--cont-padding) * 2));
		height: calc(100% - (var(--cont-padding) * 2));
		padding: var(--cont-padding);
		pointer-events: all;

		float: right;
	}
	uimodeLayer .content .path {
		width: 100%;
		height: 22px;
		padding-left: 15px;
		margin-bottom: var(--cont-padding);

		line-height: 22px;
		font-size: 1.4rem;
		color: #999999;
		max-height: calc(100% - 37px);
	}
	/* ui모드별 설정 */
	uimodeLayer .content .page {
		gap: 9px;
		display: grid;
		/* overflow: auto; */
	}
	uimodeLayer .content .page > div {
		background-color: white;
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 4px;
		overflow: auto;
		grid-template-rows: 1fr;
		max-height: calc(100% - 37px);
	}
	uimodeLayer .content .page .singleSide {
		overflow: auto;
	}
	uimodeLayer .content .page .singleSide img {
		display: block;
		margin: 9px auto;
		width: 375px;
	}
	uimodeLayer .content .page .dual {
		background-color: #efefef;
		display: none;
	}
	uimodeLayer .content .page .single .title {
		height: 72px;
		line-height: 72px;
		font-size: 1.4rem;
		color: #777777;
		padding-left: 17px;
		border-bottom: 1px solid #dbe2e6;
	}

	/* 창 모드 */
	uimodeLayer.ui .content .page {
		grid-template-columns: 1fr;

		display: inline-block;
	}
	uimodeLayer.ui .content .page .single {
		/* resize: both; */
		min-width: 300px;
		min-height: 210px;
		max-width: 1280px;
		max-height: 890px;
	}
	uimodeLayer.ui .content .page .single .title {
		height: 50px;
		line-height: 50px;

		border-bottom: 1px solid #ccc;
	}

	/* 싱글 모드 */
	uimodeLayer.single .content .page {
		grid-template-columns: 400px 1fr;
	}

	/* 듀얼 모드 */
	uimodeLayer.dual .content .page {
		grid-template-columns: 1fr 1fr;
	}
	uimodeLayer.dual .content .page .dual {
		display: block;
	}
</style>
