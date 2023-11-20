<svelte:options accessors />

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Button from '$lib/nested/button.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	// 지도
	import MapSetup from '/src/lib//js/GIS/MapSetup.cjs';
	import { settings } from '$lib/store.mjs';
	import { computeDestinationPoint } from 'geolib';

	export let winMode = false;
	export let params;

	const consts = {
		map: null,
		evpause: false
	};
	let stats = {};
	let elems = {
		md: null,
		standardMarker: [],
		editedMarker: [],
		svgMarker: [],
		flowArr_A_Bool: null,
		flowArr_B_Bool: null
	};

	// Map
	let setup;
	let ol;
	let neoMap;

	// Make Map
	function makeMap() {
		let _settings = settings;
		const node = document.lcCon.lcnodes[params[0]];
		// 좌표
		// let latlng = [Number(node.node_lat), Number(node.node_lng)] //36, 126
		let latlng = [Number(node.node_lng), Number(node.node_lat)]; //126, 36

		const mapset = new MapSetup({
			GIS: {
				GISurl: _settings.GIS.GISurl,
				GIScenter: latlng,
				defZoom: 18,
				minZoom: 7,
				maxZoom: 18,
				GISextent: [125.8985671, 34.0471297, 130.0075154, 38.0952572],
				// GISextent:[34.0471297, 125.8985671, 38.0952572, 130.0075154],
				switchXY: false
			}
		});
		mapset.dragPan = false;
		mapset.mouseWheelZoom = false;

		setup = new neoMap(mapset);
		if (!ol) ol = setup.getOL();
		let mapData = setup.Map('flowMap');
		consts.map = mapData;

		// 교차로 마커 생성
		const markerEl = document.createElement('div');
		markerEl.classList.add('lcMarker');
		const marker = setup.Marker(latlng, consts.map, markerEl, false);
		consts.map.marker = marker;

		// 초기화
		elems.standardMarker = [];
		elems.editedMarker = [];
		elems.svgMarker = [];
	}

	// 기본 함수
	// 우클릭 팝업 제거
	function removeFlowContext() {
		elems.md.querySelectorAll('.context').forEach((v, i) => {
			v.remove();
		});
	}

	// 각도에 따른 방위 산출
	function flowConfigSortCardinalPoints(angle) {
		let angleText;
		if (angle >= 0 && angle < 22.5) {
			angleText = '북';
		} else if (angle >= 22.5 && angle < 67.5) {
			angleText = '북동';
		} else if (angle >= 67.5 && angle < 112.5) {
			angleText = '동';
		} else if (angle >= 112.5 && angle < 157.5) {
			angleText = '남동';
		} else if (angle >= 157.5 && angle < 202.5) {
			angleText = '남';
		} else if (angle >= 202.5 && angle < 247.5) {
			angleText = '남서';
		} else if (angle >= 247.5 && angle < 292.5) {
			angleText = '서';
		} else if (angle >= 292.5 && angle < 337.5) {
			angleText = '북서';
		} else {
			angleText = '북';
		}
		return angleText;
	}

	// 마커 이동시 방위에 따른 실시간 텍스트 변경
	function flowConfigChangeText(marker) {
		let angle = getAngle(
			consts.map.marker.getPosition()[1],
			consts.map.marker.getPosition()[0],
			marker.getPosition()[1],
			marker.getPosition()[0]
		);
		let cardinalPoints = flowConfigSortCardinalPoints(angle); // '북', '서' ...

		elems.standardMarker.some((v, index) => {
			if (v.marker == marker) {
				if (v.modified == false) {
					marker.getElement().innerHTML = cardinalPoints;
					v.cardinalPoints = cardinalPoints;
					v.angle = angle;
				} else {
					v.angle = angle;
				}
			}
		});
	}

	// 마커 수정시 배열 내 JSON 수정 함수
	function flowConfigObjectEdit(arr, some, arg, chg) {
		const itemToFind = arr.find(function (item) {
			return item[arg] === some;
		});
		itemToFind.cardinalPoints = chg;
		itemToFind.modified = true;
		return arr;
	}

	// 각도 산출 함수
	function getAngle(x1, y1, x2, y2) {
		const constant = 0.11111111111111;
		let rad = Math.atan2(y2 - y1, x2 - x1);
		let deg = (rad * 180) / Math.PI;
		let result;
		if (deg < 0) {
			deg += 360;
		}

		if (deg > 0 && deg < 90) {
			if (deg <= 45) {
				result = deg - constant * deg;
			} else {
				result = deg - constant * (90 - deg);
			}
		} else if (deg > 90 && deg < 180) {
			if (deg <= 135) {
				result = deg + constant * (deg - 90);
			} else {
				result = deg + constant * (180 - deg);
			}
		} else if (deg > 180 && deg < 270) {
			if (deg <= 225) {
				result = deg - constant * (deg - 180);
			} else {
				result = deg - constant * (270 - deg);
			}
		} else if (deg > 270 && deg < 360) {
			if (deg <= 315) {
				result = deg + constant * (deg - 270);
			} else {
				result = deg + constant * (360 - deg);
			}
		}

		return result;
	}

	// 마커 삭제시 배열 내 JSON 삭제 함수
	function flowConfigObjectSplice(arr, some, arg) {
		const itemToFind = arr.find(function (item) {
			return item[arg] === some;
		});
		const idx = arr.indexOf(itemToFind);
		if (idx > -1) arr.splice(idx, 1);
		return arr;
	}

	function flowConfigDistance(lat, lng, deg, meter, name) {
		let startPoint = { latitude: lat, longitude: lng };
		let distanceMeters = meter;
		let bearing = deg;

		let destination = computeDestinationPoint(startPoint, distanceMeters, bearing);

		let mapEl = consts.map.getTargetElement();
		let html = new String();
		const markerEl = document.createElement('div');
		markerEl.classList.add('dummyFlow');

		let cardinalPoints;
		if (name == 'n') {
			cardinalPoints = '북';
		} else if (name == 'ne') {
			cardinalPoints = '북동';
		} else if (name == 'e') {
			cardinalPoints = '동';
		} else if (name == 'se') {
			cardinalPoints = '남동';
		} else if (name == 's') {
			cardinalPoints = '남';
		} else if (name == 'sw') {
			cardinalPoints = '남서';
		} else if (name == 'w') {
			cardinalPoints = '서';
		} else if (name == 'nw') {
			cardinalPoints = '북서';
		}
		markerEl.innerHTML = cardinalPoints;

		markerEl.insertAdjacentHTML('afterbegin', html);
		const marker = setup.Marker(
			[destination.longitude, destination.latitude],
			consts.map,
			markerEl,
			true
		);
		setup.markerVisiblity(consts.map, marker, 'visible');

		// 이동후 각도에 맞춰서 텍스트 변경
		function dragendText(evt) {
			flowConfigChangeText(marker);
		}
		setup.markerEvent(consts.map, marker, 'mouseup', dragendText);

		// 이동이 시작되면 기존의 Context 제거
		function dragRmText(evt) {
			removeFlowContext();
		}
		setup.markerEvent(consts.map, marker, 'click', dragRmText);

		// 생성된 마커에 우클릭 이벤트
		setup.markerEvent(consts.map, marker, 'contextmenu', (e) => {
			e.preventDefault();
			consts.evpause = true;
			setTimeout(() => {
				consts.evpause = false;
			});
			removeFlowContext();
			let div = document.createElement('div');
			let p1 = document.createElement('p');
			let div1 = document.createElement('div');
			let div2 = document.createElement('div');
			let div3 = document.createElement('div');
			let div4 = document.createElement('div');
			let div5 = document.createElement('div');
			let div6 = document.createElement('div');
			let div7 = document.createElement('div');
			let div8 = document.createElement('div');
			let div9 = document.createElement('div');
			let div10 = document.createElement('div');
			div.classList.add('context');
			div.append(p1);
			div.append(div1);
			div.append(div2);
			div.append(div3);
			div.append(div4);
			div.append(div5);
			div.append(div6);
			div.append(div7);
			div.append(div8);
			div.append(div9);
			div.append(div10);
			p1.innerHTML = '마커 방위 변경';
			div1.innerHTML = '북';
			div2.innerHTML = '동';
			div3.innerHTML = '남';
			div4.innerHTML = '서';
			div5.innerHTML = '북동';
			div6.innerHTML = '남동';
			div7.innerHTML = '남서';
			div8.innerHTML = '북서';
			div9.innerHTML = '마커 삭제';
			div10.innerHTML = '취소';
			setTimeout(() => {
				div.style = `
                    left:${e.layerX + 270}px;
                    top:${e.layerY + 430}px;
                    opacity:1;
                `;
			});
			mapEl.append(div);
			div1.onclick = () => {
				marker.getElement().innerHTML = '북';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '북');
				removeFlowContext();
			};
			div2.onclick = () => {
				marker.getElement().innerHTML = '동';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '동');
				removeFlowContext();
			};
			div3.onclick = () => {
				marker.getElement().innerHTML = '남';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '남');
				removeFlowContext();
			};
			div4.onclick = () => {
				marker.getElement().innerHTML = '서';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '서');
				removeFlowContext();
			};
			div5.onclick = () => {
				marker.getElement().innerHTML = '북동';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '북동');
				removeFlowContext();
			};
			div6.onclick = () => {
				marker.getElement().innerHTML = '남동';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '남동');
				removeFlowContext();
			};
			div7.onclick = () => {
				marker.getElement().innerHTML = '남서';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '남서');
				removeFlowContext();
			};
			div8.onclick = () => {
				marker.getElement().innerHTML = '북서';
				flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '북서');
				removeFlowContext();
			};
			div9.onclick = () => {
				flowConfigObjectSplice(elems.standardMarker, marker, 'marker');
				marker.setMap(null);
				removeFlowContext();
			};
			div10.onclick = () => {
				removeFlowContext();
			};
		});

		let markerJson = { cardinalPoints: cardinalPoints, angle: deg, marker: marker, modified: true };
		elems.standardMarker.push(markerJson);

		return marker;
	}

	// 이동류 맵 내부이벤트
	function flowConfigMapEvent() {
		ajax(`/ntcs_m_node_dir_id?nodeid=${params[1]}`).then((res) => {
			if (res.length) {
				let dir = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];
				dir.forEach((v, i) => {
					if (res[0][`angle_${v}`]) {
						flowConfigDistance(
							consts.map.marker.getPosition()[1],
							consts.map.marker.getPosition()[0],
							res[0][`angle_${v}`],
							70,
							v
						);
					}
				});
			}
		});

		consts.map.on('contextmenu', (e) => {
			//지도 우클릭 이벤트
			e.preventDefault();
			let mapEl = consts.map.getTargetElement();
			if (!consts.evpause) {
				removeFlowContext();
				let div = document.createElement('div');
				let div1 = document.createElement('div');
				let div2 = document.createElement('div');
				let latLng = e.coordinate;
				div.classList.add('context');
				div.append(div1);
				div.append(div2);
				div1.textContent = '여기에 마커추가';
				div2.textContent = '취소';

				setTimeout(() => {
					div.style = `
                        left:${e.pixel[0] + 34}px;
                        top:${e.pixel[1] + 80}px;
                        opacity:1;
                    `;
				});

				mapEl.append(div);
				div1.addEventListener('click', () => {
					//마커추가
					elems.md.parentElement.style.overflow = 'visible';
					let html = new String();
					const markerEl = document.createElement('div');
					markerEl.classList.add('dummyFlow');
					markerEl.insertAdjacentHTML('afterbegin', html);
					const marker = setup.Marker([latLng[0], latLng[1]], consts.map, markerEl, true);

					// 방위각
					let angle = getAngle(
						consts.map.marker.getPosition()[1],
						consts.map.marker.getPosition()[0],
						marker.getPosition()[1],
						marker.getPosition()[0]
					);
					let cardinalPoints = flowConfigSortCardinalPoints(angle); // '북', '서' ...

					// IconHTML 설정
					marker.getElement().innerHTML = cardinalPoints;

					// 이동후 각도에 맞춰서 텍스트 변경
					function dragendText(evt) {
						flowConfigChangeText(marker);
					}
					setup.markerEvent(consts.map, marker, 'mouseup', dragendText);

					// 이동이 시작되면 기존의 Context 제거
					function dragRmText(evt) {
						removeFlowContext();
					}
					setup.markerEvent(consts.map, marker, 'click', dragRmText);

					// 생성된 마커에 우클릭 이벤트
					setup.markerEvent(consts.map, marker, 'contextmenu', (e) => {
						e.preventDefault();
						consts.evpause = true;
						setTimeout(() => {
							consts.evpause = false;
						});
						removeFlowContext();
						let div = document.createElement('div');
						let p1 = document.createElement('p');
						let div1 = document.createElement('div');
						let div2 = document.createElement('div');
						let div3 = document.createElement('div');
						let div4 = document.createElement('div');
						let div5 = document.createElement('div');
						let div6 = document.createElement('div');
						let div7 = document.createElement('div');
						let div8 = document.createElement('div');
						let div9 = document.createElement('div');
						let div10 = document.createElement('div');
						div.classList.add('context');
						div.append(p1);
						div.append(div1);
						div.append(div2);
						div.append(div3);
						div.append(div4);
						div.append(div5);
						div.append(div6);
						div.append(div7);
						div.append(div8);
						div.append(div9);
						div.append(div10);
						p1.innerHTML = '마커 방위 변경';
						div1.innerHTML = '북';
						div2.innerHTML = '동';
						div3.innerHTML = '남';
						div4.innerHTML = '서';
						div5.innerHTML = '북동';
						div6.innerHTML = '남동';
						div7.innerHTML = '남서';
						div8.innerHTML = '북서';
						div9.innerHTML = '마커 삭제';
						div10.innerHTML = '취소';
						setTimeout(() => {
							div.style = `
                                left:${e.layerX + 270}px;
                                top:${e.layerY + 430}px;
                                opacity:1;
                            `;
						});
						mapEl.append(div);
						div1.onclick = () => {
							marker.getElement().innerHTML = '북';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '북');
							removeFlowContext();
						};
						div2.onclick = () => {
							marker.getElement().innerHTML = '동';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '동');
							removeFlowContext();
						};
						div3.onclick = () => {
							marker.getElement().innerHTML = '남';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '남');
							removeFlowContext();
						};
						div4.onclick = () => {
							marker.getElement().innerHTML = '서';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '서');
							removeFlowContext();
						};
						div5.onclick = () => {
							marker.getElement().innerHTML = '북동';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '북동');
							removeFlowContext();
						};
						div6.onclick = () => {
							marker.getElement().innerHTML = '남동';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '남동');
							removeFlowContext();
						};
						div7.onclick = () => {
							marker.getElement().innerHTML = '남서';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '남서');
							removeFlowContext();
						};
						div8.onclick = () => {
							marker.getElement().innerHTML = '북서';
							flowConfigObjectEdit(elems.standardMarker, marker, 'marker', '북서');
							removeFlowContext();
						};
						div9.onclick = () => {
							flowConfigObjectSplice(elems.standardMarker, marker, 'marker');
							marker.setMap(null);
							removeFlowContext();
						};
						div10.onclick = () => {
							removeFlowContext();
						};
					});

					let markerJson = {
						cardinalPoints: cardinalPoints,
						angle: angle,
						marker: marker,
						modified: false
					};
					elems.standardMarker.push(markerJson);

					removeFlowContext();
				});
				div2.addEventListener('click', () => {
					//취소
					removeFlowContext();
				});
			}
		});
		consts.map.on('click', (e) => {
			removeFlowContext();
		});
	}

	// 이동류 생성
	function makeFlow() {
		// 기본 마커
		const arr = elems.standardMarker;

		// 방위명
		const cardinal = arr.map((v) => v.cardinalPoints);

		// 중복 체크
		const set = Array.from(new Set(cardinal));

		console.log(cardinal);
		console.log(set);

		if (cardinal.length < 2) {
			document.createMsg('기준점이 부족합니다.\n빈 지도를 우클릭하여 기준점을 생성해주세요.');
		} else if (cardinal.length != set.length) {
			document.createMsg('방위가 중복되었습니다.\n기준점을 이동하거나 우클릭하여 방위를 변경해주세요.');
		} else if (
			!set.includes('북') ||
			!set.includes('동') ||
			!set.includes('남') ||
			!set.includes('서')
		) {
			if (
				set.includes('북서') ||
				set.includes('북동') ||
				set.includes('남동') ||
				set.includes('남서')
			) {
				document.createMsg('방위가 잘못되었습니다.\n기준점을 이동하거나 우클릭하여 방위를 변경해주세요.');
			} else {
				flowConfigSave();
			}
		} else {
			flowConfigSave();
		}
	}

	// 이동류 저장
	function flowConfigSave() {
		let json = new Object();
		json.node_id = params[1];
		json.node_name = params[2];
		console.log(elems.standardMarker);
		json.angle_n = elems.standardMarker.find((v) => v.cardinalPoints == '북')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '북').angle))
			: '';
		json.angle_e = elems.standardMarker.find((v) => v.cardinalPoints == '동')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '동').angle))
			: '';
		json.angle_s = elems.standardMarker.find((v) => v.cardinalPoints == '남')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '남').angle))
			: '';
		json.angle_w = elems.standardMarker.find((v) => v.cardinalPoints == '서')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '서').angle))
			: '';
		json.angle_ne = elems.standardMarker.find((v) => v.cardinalPoints == '북동')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '북동').angle))
			: '';
		json.angle_nw = elems.standardMarker.find((v) => v.cardinalPoints == '북서')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '북서').angle))
			: '';
		json.angle_se = elems.standardMarker.find((v) => v.cardinalPoints == '남동')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '남동').angle))
			: '';
		json.angle_sw = elems.standardMarker.find((v) => v.cardinalPoints == '남서')
			? String(Math.round(elems.standardMarker.find((v) => v.cardinalPoints == '남서').angle))
			: '';

		ajax('/SaveDir', 'POST', json).then((res) => {
			res.success ? document.createMsg('방향이 저장되었습니다.') : document.createMsg('오류가 발생했습니다.');
		});
	}

	// 초기 조회
	onMount(() => {
		// 맵생성
		import('$lib/js/GIS/NeoMap.cjs').then((res) => {
			// 맵로드
			neoMap = res.default;
			setTimeout(() => {
				makeMap();
				flowConfigMapEvent();
			}, 150);
		});
	});
</script>

<div bind:this={elems.md} id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="row1">
			{params[1]}
			{params[2]}
		</div>
		<div class="row2">
			<div id="flowMap" style="border: 1px solid #EDEEF0;" />
		</div>
		<div class="row3">
			<div>
				<Button width="70" height="30px" icon="save2db" on:click={makeFlow}>저장</Button>
			</div>
		</div>
	</div>
</div>

<style>
	#main {
		font-size: 1.3rem;
		background-color: #000;
		padding: 15px;

		/* 높이(가변) */
		max-height: 720px;
	}

	.EntireDiv {
		height: calc(100% - 32px);
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #181d22;
		border-radius: 6px;
		background-color: #181d22;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 15px 15px 15px 15px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 402px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	#main .row2 {
		display: grid;
	}

	#main .row2 > div {
		height: 370px;
	}

	#main .row3 {
		display: grid;
		grid-template-columns: 70px;
		grid-column-gap: 5px;
		justify-content: end;
	}

	/* Handsontable Header CSS */
	#main :global(.handsontable tr:first-child td),
	#main :global(.handsontable tr td:nth-child(1)),
	#main :global(.handsontable tr td:nth-child(2)) {
		color: #999999;
		background: #f4f7f9;
	}

	/* Image */
	#main :global(.flowImg) {
		width: 17px;
		line-height: 17px;
	}

	#flowMap {
		width: 370px;
		border: 1px solid #181d22 !important;
	}

	#main :global(.dot) {
		background: rgb(200, 115, 115);
		border-radius: 100%;
		width: 7px;
		height: 7px;
	}

	#main :global(.lcMarker) {
		background: #ccc;
		border-radius: 100%;
		width: 10px;
		height: 10px;
	}

	#main :global(.dummyFlow) {
		width: 30px;
		height: 30px;
		border: 2px solid black;
		border-radius: 100%;
		background: #999999;
		color: white;
		margin: 0;
		padding: 0;
		font-size: 1.4rem;
		line-height: 30px;
		text-align: center;
		cursor: move;
		user-select: none;
	}

	#main :global(.context) {
		/*contextmenu*/
		position: absolute;
		width: 130px;
		overflow: hidden;
		background-color: #474747;
		color: #d7d7d7;
		text-align: center;
		opacity: 0;
		left: 0;
		top: 0;
		transition: opacity 0.21s, height 0.21s;
		user-select: none;
		border-radius: 9px 9px 9px 9px;
		z-index: 999;
	}
	#main :global(.context > div) {
		/*contextmenu*/
		min-height: 27px;
		line-height: 27px;
		padding: 0 2px;
	}
	#main :global(.context > p) {
		/*contextmenu*/
		background-color: #222;
		height: 27px;
		line-height: 27px;
		margin: 0;
	}
	#main :global(.context > div .Cbtn) {
		/*contextmenu*/
		width: 50%;
		line-height: 17px;
	}
	#main :global(.context > div:hover) {
		background-color: #575757;
	}
</style>
