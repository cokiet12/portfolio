<script>
	// @ts-nocheck
	import UiLayer from './uiLayer.svelte';
	import MapSetup from '/src/lib//js/GIS/MapSetup.cjs';
	import { mapCenters, mapDiv, curMainMap, globGroupOff } from '/src/lib/user_info.mjs';
	import { LcCon, SSE } from '/src/lib/js/classes.mjs';
	import { ajax, asy, getWAStime } from '/src/lib/js/functions.mjs';
	import {
		settings,
		loadList,
		containedLC,
		mainMaps,
		userJson,
		lcStatis,
		opclrs,
		links
	} from '/src/lib/store.mjs';
	import { onMount } from 'svelte';
	import _ from 'lodash';
	import lib from 'window-or-global';

	$: if ($loadList.length == 0) {
		console.time('loadList');
	} else if ($loadList.length == 8) {
		// console.timeLog('loadList', $loadList[$loadList.length - 1])
		console.timeEnd('loadList');
		console.log($loadList);
	} else {
		console.timeLog('loadList', $loadList[$loadList.length - 1]);
	}
	$: curMainMapChanged($curMainMap);
	$: groupOff($globGroupOff);

	function curMainMapChanged(mm) {
		function selectStyle(map, no) {
			if (no == mm) {
				map.getViewport().parentElement.classList.add('selected');
			} else {
				map.getViewport().parentElement.classList.remove('selected');
			}
		}

		if ($mainMaps.length) {
			$mainMaps.forEach((map, no) => {
				if (map) {
					selectStyle(map, no);
				}
			});
		} else {
			setTimeout(() => {
				$mainMaps.forEach((map, no) => {
					if (map) {
						selectStyle(map, no);
					}
				});
			}, 150);
		}
	}

	function groupOff(go) {
		$mainMaps.forEach((v) => {
			if (v) {
				v.linkChange();
			}
		});
	}

	const mapCnt = 4;

	let elems = {
		mapLayer: null,
		uiLayer: null,
		lcmenu: null,
		webrtc: null
	};
	let mapReady = false;
	let ol;
	let neoMap;
	let lcCon = new LcCon(9999);
	const linkopts = [
		{ width: 0, color: [210, 0, 0, 0.0] },
		{ width: 9, color: '#88E222' },
		{ width: 5, color: '#88E222' },
		{ width: 3, color: '#88E222' }
	];
	const saColors = ['#3C95D3', '#88E222', '#FC4900', '#04DD6F'];
	const nodetypes = ['', 'lc', 'detector', 'camera', 'pushbtn'];
	const pathColor = ['#0A84FF', '#F1BC2F', '#9B9B9B', '#D77937', 'blue', 'yellow', 'grey', 'red'];
	const camSVG = function (revA, act) {
		return `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            transform="rotate(${revA},50,50)" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
        <circle fill="${act ? '#1475E8' : '#CCC'}" cx="80" cy="50" r="10"/>
        <g fill="#FFFFFF" transform="scale(0.2) translate(350, 200)">
            <path d="M57.5,66.6H22c-1.6,0-3-1.3-3-3V36.5c0-1.7,1.4-3,3-3h35.5c1.7,0,3,1.3,3,3v27.1C60.5,65.3,59.2,66.6,57.5,66.6z"/>
            <path d="M76.9,33.5L65,44.7v10.7l11.9,11.2c1.3,1.1,3.1-0.4,3.1-2V35.5C80,33.9,78.5,32,76.9,33.5z"/>
        </g>
        </svg>

    `;
	};

	let dbto = new Array(mapCnt);
	function debounce(cb, limit = 111, i) {
		if (dbto[i]) {
			clearTimeout(dbto[i]);
			dbto[i] = null;
		}
		dbto[i] = setTimeout(() => {
			cb.apply(this, arguments);
		}, limit);
	}

	$: if (mapReady) renderMaps($mapDiv);

	function renderMaps(cnt) {
		// console.log(document.lcCon.lcFlows)
		const leng = cnt + 1;
		const mapDivs = elems.mapLayer.querySelectorAll('.mapDiv');
		switch (cnt) {
			case 0:
				mapDivs[0].style = `
                    width: 100%;
                    height: 100%;
                `;
				mapDivs[1].style = '';
				mapDivs[2].style = '';
				mapDivs[3].style = '';
				break;
			case 1:
				mapDivs[0].style = `
                    width: 50%;
                    height: 100%;
                    border-right:1px solid #777;
                `;
				mapDivs[1].style = `
                    width: 50%;
                    height: 100%;
                `;
				mapDivs[2].style = '';
				mapDivs[3].style = '';
				break;
			case 2:
				mapDivs[0].style = `
                    width: 60%;
                    height: 100%;
                    border-right:1px solid #777;
                `;
				mapDivs[1].style = `
                    width: 40%;
                    height: 50%;
                `;
				mapDivs[2].style = `
                    width: 40%;
                    height: 50%;
                    border-top:1px solid #777;
                `;
				mapDivs[3].style = '';
				break;
			case 3:
				mapDivs[0].style = `
                    width: 50%;
                    height: 50%;
                `;
				mapDivs[1].style = `
                    width: 50%;
                    height: 50%; 
                    border-left:1px solid #777;
                `;
				mapDivs[2].style = `
                    width: 50%;
                    height: 50%;
                    border-top:1px solid #777;
                `;
				mapDivs[3].style = `
                    width: 50%;
                    height: 50%;
                    border-top:1px solid #777;
                    border-left:1px solid #777;
                `;
				break;
		}
		for (let i = 0; i < mapCnt; i++) {
			//맵 개수대로
			if (i < leng) {
				//맵 생성
				if (!document.getElementById('map' + (i + 1)).children.length) {
					let _settings = settings;
					_settings.GIS.GIScenter = $mapCenters[i]; //사용자센터
					let setup = new neoMap(new MapSetup(_settings));
					if (!ol) ol = setup.getOL();
					$mainMaps[i] = setup.Map('map' + (i + 1));
					const map = $mainMaps[i]; // ol/Map
					const mapView = map.getView(); // ol/View
					const viewPort = map.getViewport(); //Element
					let saLinks = new Object();

					viewPort.style.setProperty('--resol', mapView.getZoom().toFixed(2));
					// viewPort.style.setProperty('filter', 'invert(1) hue-rotate(190deg) brightness(1.5) contrast(0.9)');
					//링크 성능 개선 필요

					map.linkChange = function () {
						const zoomLev = mapView.getZoom().toFixed(2);
						if ($globGroupOff) {
							if (zoomLev < 12.5) {
								$links[i].forEach((v) => {
									setup.setLineStyle(v, linkopts[0]);
								});
							} else if (zoomLev < 14) {
								$links[i].forEach((v) => {
									setup.setLineStyle(v, linkopts[3]);
								});
							} else if (zoomLev < 15.5) {
								$links[i].forEach((v) => {
									setup.setLineStyle(v, linkopts[2]);
								});
							} else {
								$links[i].forEach((v) => {
									setup.setLineStyle(v, linkopts[1]);
								});
							}
						} else {
							$links[i].forEach((v) => {
								setup.setLineStyle(v, linkopts[0]);
							});
						}
					};
					function zoomEvent() {
						asy(() => {
							const zoomLev = mapView.getZoom().toFixed(2);
							// console.log(zoomLev)
							viewPort.style.setProperty('--resol', zoomLev);
							if (zoomLev < 14) {
								viewPort.classList.add('nameOff');
							} else {
								viewPort.classList.remove('nameOff');
							}

							if (zoomLev < 14.5) {
								viewPort.classList.add('loopOff');
								viewPort.classList.add('smartOff');
								viewPort.classList.add('pushOff');
							} else {
								viewPort.classList.remove('loopOff');
								viewPort.classList.remove('smartOff');
								viewPort.classList.remove('pushOff');
							}

							if (zoomLev < 16) {
								viewPort.classList.add('flowOff');
							} else {
								viewPort.classList.remove('flowOff');
							}

							map.linkChange();
						});
					}
					function moveEvent() {
						debounce(
							() => {
								$containedLC[i] = map.lcMarkers.filter((el) => {
									return ol.extent.containsCoordinate(mapView.calculateExtent(), el.getPos());
								});
								$userJson.mapcenters[i] = mapView.getCenter();
							},
							50,
							i
						);
					}
					map.getView().on('change:resolution', zoomEvent);
					map.getView().on('change:center', moveEvent);
					viewPort.addEventListener('click', () => {
						$curMainMap = i;
					});

					map.lcMarkers = new Array();

					const liveLCs = document.lcCon.liveLCs;
					let angle = 35 / 2;
					let radius = 35;
					let rad = (Math.PI / 180) * angle;
					let maxx = 50 + Math.cos(rad) * radius;
					let maxy1 = 50 - Math.sin(rad) * radius;
					let maxy2 = 50 + Math.sin(rad) * radius;

					lcCon.lcnodesArr.forEach((v) => {
						//교차로 마커 생성
						const lcinfo = lcCon.LCs[v.lcno];
						const lcFlow = lcCon.lcFlows[v.lcno];
						const lcCam = lcCon.cameras[v.lcno];
						const roadAngles = lcFlow
							? [
									lcFlow.angle_n,
									lcFlow.angle_e,
									lcFlow.angle_s,
									lcFlow.angle_w,
									lcFlow.angle_ne,
									lcFlow.angle_se,
									lcFlow.angle_sw,
									lcFlow.angle_nw
							  ]
							: [];
						// const raLeng = roadAngles.length;
						if (lcinfo) {
							const markerEl = document.createElement('div');
							let html = new String();

							//이동류 그림
							if (lcFlow) {
								// const ptAngle = lcFlow.ptAngle;
								//길모양
								html += `<svg class="road" style="transform : translate(-41%,-41%);" width="100" height="100" viewBox="0 0 100 100">`;

								for (let i = 0; i < 8; i++) {
									if (roadAngles[i]) {
										// <circle fill="${lcCam[i] ? '#1475E8' : '#BBB'}" cx="72" cy="50" r="7"/>
										html += `
											<g transform="rotate(${Number(roadAngles[i]) + 270},50,50)">
												<use id="transformed" xlink:href="#arrowRotate" />
												<path d="M${maxx}, ${maxy1} A44, 44 0 0,1 ${maxx}, ${maxy2}" stroke-width="7" stroke="${
												pathColor[i]
											}"  fill="none" stroke-linecap="round" />
												<svg viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
													<circle fill="${true ? '#1475E8' : '#BBB'}" cx="72" cy="50" r="7"/>
													<g fill="#FFFFFF" transform="scale(0.15) translate(430, 283)">
														<path d="M57.5,66.6H22c-1.6,0-3-1.3-3-3V36.5c0-1.7,1.4-3,3-3h35.5c1.7,0,3,1.3,3,3v27.1C60.5,65.3,59.2,66.6,57.5,66.6z"/>
														<path d="M76.9,33.5L65,44.7v10.7l11.9,11.2c1.3,1.1,3.1-0.4,3.1-2V35.5C80,33.9,78.5,32,76.9,33.5z"/>
													</g>
												</svg>
											</g>
										`;
									}
									//transform="rotate(${roadAngles[i]},50,50)"
									//길, 게이지, 카메라
									// <g transform="rotate(${roadAngles[i]},50,50)">
								}

								//이동류
								// html += `
								// <div class="flow">
								//     <svg class="flowA flows" style="transform : translate(-41%,-41%) rotate(${ptAngle}deg);" width="100" height="100" viewBox="0 0 100 100">
								//         <rect fill="url(#gradient2)" width="50" height="10" x="50" y="40" transform="rotate(90, 0, 0)"></rect>
								//         <rect fill="url(#gradient3)" width="50" height="10" x="50" y="50" transform="rotate(90, 0, 0)"></rect>
								//     </svg>
								//     <svg class="flowB flows" style="transform : translate(-41%,-41%) rotate(${ptAngle}deg);" width="100" height="100" viewBox="0 0 100 100">
								//         <rect fill="url(#gradient4)" width="50" height="10" x="50" y="40" transform="rotate(90, 0, 0)"></rect>
								//         <rect fill="url(#gradient5)" width="50" height="10" x="50" y="50" transform="rotate(90, 0, 0)"></rect>
								//     </svg>
								// </div>`
							}
							// ${lcFlow.phases[lcFlow.curPhase[0]][0].head_angle
							//<use xlink:href="#arrowRotate2" fill="url(#gradient3)" "></use>

							//이름과 교차로 마커
							html += `
								<div class="lcnameTag${v.bottom ? ' bottom' : ''}">
									${lcinfo.lcno}. ${lcinfo.lcname}
								</div>
								<div class="lcMarker"></div>
							`;
							const info = document.lcCon.LCs[v.lcno];
							markerEl.classList.add('lcnode', `lc${v.lcno}`);
							markerEl.style.setProperty('--ol', saColors[info.sa_no - 9998]);
							// markerEl.style.setProperty('--bg', '#f44336');
							markerEl.insertAdjacentHTML('afterbegin', html);

							function closeLcMenu() {
								elems.lcmenu.classList.remove('open');
								document.onmousedown = null;
							}

							const params = {
								lcno: info.lcno,
								sano: info.sa_no,
								year: info.lctype == 1 ? 2004 : 2010
							};
							markerEl.onclick = (e) => {
								e.preventDefault();
								closeLcMenu();
								document.createWindow('liveMonitor', false, e, params);
							};
							// markerEl.onclick = (e)=>{
							//     if (!document.onclick) {
							//         e.stopPropagation();
							//         const tgrt = e.target.getBoundingClientRect();

							//         let Y = scrollY + tgrt.top;
							//         let X = scrollX + tgrt.left;
							//         elems.lcmenu.style.top = Y + 'px';
							//         elems.lcmenu.style.left = X + 'px';

							//         const menus = elems.lcmenu.querySelectorAll('.menu');
							//         menus[0].onmousedown = ()=>{document.createWindow('lcMonitor', false, e, params)};
							//         menus[1].onmousedown = ()=>{document.createWindow('grMonitor', false, e, params)};
							//         menus[2].onmousedown = ()=>{document.createWindow('dbUpDown', false, e, {tabValue:1, stats:params})};
							//         menus[3].onmousedown = ()=>{document.createWindow('lcEdit', false, e, params)};
							//         menus[4].onmousedown = ()=>{document.createWindow('historyInq', false, e, params)};
							//         menus[5].onmousedown = ()=>{document.createWindow('eventInq', false, e, params)};

							//         document.onmousedown = closeLcMenu;

							//         elems.lcmenu.classList.add('open')
							//     }
							// }

							if (lcFlow) {
								if (!lcFlow.flowEls) {
									lcFlow.flowEls = new Array(mapCnt);
								}

								if (typeof liveLCs[v.lcno].markerEl == 'undefined') {
									liveLCs[v.lcno].markerEl = new Array(mapCnt);
								}
								liveLCs[v.lcno].markerEl[i] = markerEl;
								lcFlow.flowEls[i] = markerEl.querySelectorAll('.flow rect');
							}
							const marker = setup.Marker([v.node_lng, v.node_lat], map, markerEl, false); //Overlay 생성
							if (!saLinks[info.sa_no]) {
								saLinks[info.sa_no] = new Array();
							}
							saLinks[info.sa_no].push([v.node_lng, v.node_lat]);
							marker.lcno = lcinfo.lcno;
							map.lcMarkers.push(marker);
						}
						
					});

					// console.log(saLinks)

					Object.values(lcCon.nodenew).forEach((v) => {
						//기타 노드마커 생성
						if (v.node_type > 1) {
							const img = document.createElement('img');

							switch (v.node_type) {
								case 2: //검지기
									img.src = '/images/detector.png';
									break;
								case 3: //카메라
									img.src = '/images/camera.png';
									img.onclick = function () {
										console.log('dflj');
									};
									break;
								case 4: //압버튼
									img.src = '/images/pushbtn.png';
									break;
							}

							setup.Marker(
								[v.node_lng, v.node_lat],
								map,
								img,
								false,
								nodetypes[v.node_type] + ' node'
							);
						}
					});

					// Object.values(saLinks).forEach((v) => {
					// 	//링크 생성
					// 	const link = setup.MultiLine(map, v, linkopts[0]);
					// 	$links[i].push(link);
					// });

					zoomEvent();
					moveEvent();
				} else {
					$mainMaps[i].updateSize();
				}
			} else if (i > cnt && document.getElementById('map' + (i + 1)).children.length) {
				//맵 제거
				if ($curMainMap > cnt) {
					$curMainMap = cnt;
					$userJson.curmainmap = cnt;
					curMainMapChanged($curMainMap);
				}
				$links[i] = new Array();
				$mainMaps[i].setTarget(null);
				$mainMaps[i] = null;
				$containedLC[i] = new Array();
			}
		}
	}
	getWAStime();

	onMount(() => {
		import('$lib/js/GIS/NeoMap.cjs').then((res) => {
			//맵로드
			neoMap = res.default;
			mapReady = true;
			$loadList.push('maps done : mapLayer');
		});
		document.lcCon = lcCon;
		// document.SSECon = new SSE();
		$loadList.push('LCs done : mapLayer');
		const flowout = 'rotate(90, 0, 0)';
		// setInterval(()=>{ // 이동류 표출 인터벌
		//     const lcFlows = document.lcCon.lcFlows;
		//     const LCs = document.lcCon.LCs;
		//     $containedLC.forEach((lcs,i)=>{
		//         if ($mainMaps[i]) { //표출된 맵인 경우
		//             lcs.forEach((lc)=>{ //해당맵의 lc작업
		//                 const lcno = lc.lcno;
		//                 let lcFlow = lcFlows[lc.lcno];
		//                 let sublc = LCs[lcno].sublc;
		//                 const curphaseno = lcFlow.curPhase;

		//                 for (let o=0; o < 2; o++) {
		//                     if (lcFlow && curphaseno) {
		//                         const Aphase = lcFlow.phases[curphaseno[0]];
		//                         const Bphase = lcFlow.phases[curphaseno[1]];
		//                         const flowEls = lcFlow.flowEls[i];
		//                         if (Aphase && Bphase && flowEls.length) {
		//                             let Atail = `rotate(${Aphase[0].end_angle}, 50, 50)`;
		//                             let Btail = `rotate(${Bphase[1].end_angle}, 50, 50)`;
		//                             let Ahead = `rotate(${Aphase[0].head_angle}, 50, 50)`;
		//                             let Bhead = `rotate(${Aphase[1].head_angle}, 50, 50)`;

		//                             if (Aphase[0].flownumber > 16) {
		//                                 Atail = flowout;
		//                                 Ahead = flowout;
		//                             }
		//                             if (Bphase[1].flownumber > 16) {
		//                                 Btail = flowout;
		//                                 Bhead = flowout;
		//                             }
		//                             flowEls[0].setAttribute('transform', Atail);
		//                             flowEls[1].setAttribute('transform', Ahead);
		//                             flowEls[2].setAttribute('transform', Btail);
		//                             flowEls[3].setAttribute('transform', Bhead);
		//                             //겹침 판단
		//                             flowEls[2].setAttribute('fill', Atail == Btail ? "url(#gradient6)" : "url(#gradient4)")
		//                         } else {
		//                             flowEls.forEach((fl)=>fl.setAttribute('transform', flowout))
		//                         }
		//                     }
		//                     if (sublc) {
		//                         lcFlow = lcFlows[sublc.lcno];
		//                         sublc = null;
		//                     } else {
		//                         break;
		//                     }
		//                 }
		//             })
		//         }
		//     })
		// }, 1000)

		//0 SCU, 1 로컬, 2 로컬감응, 3 현시유지, 4 센터감응, 5 센터, 6 수동운영, 7 점멸
		const opstr = ['SCU', 'opmode1', 'opmode2', 'fixed', 'opmode4', 'opmode5', 'manual', 'flash'];
		const errclrs = ['#10b0e8', '#181515', 'red', '#e97199', 'white']; //정상, 소등, 고장점멸, 모순, 문 열림
		const errstr = ['norm', 'lightout', 'errflash', 'conflict', 'opened']; //정상, 소등, 고장점멸, 모순, 문 열림
		setInterval(() => {
			// 통계 및 교차로 색상표시 인터벌
			const lcLives = Object.values(document.lcCon.liveLCs);
			const _statistics = {
				sum: 0,
				connErr: 0,

				norm: 0,
				lightout: 0,
				errflash: 0,
				conflict: 0,
				opened: 0,

				SCU: 0,
				fixed: 0,
				opmode1: 0, //오프라인
				opmode2: 0,
				opmode4: 0,
				opmode5: 0,
				manual: 0,
				flash: 0,

				push_norm: 0,
				push_err: 0
			};
			lcLives.forEach((liv) => {
				if (liv.markerEl && false) {
					if (liv.connErr) {
						//통신에러경우
						liv.markerEl.forEach((mk) => {
							if (mk) {
								mk.style.setProperty('--ol', '#0000');
								mk.style.setProperty('--bg', '#f44336');
							}
						});
						_statistics.connErr++;
					} else {
						let ol = liv.op_mode; //운영모드
						let bg = 0; //
						let flash = Boolean(liv.flash_state);

						//운영모드
						if (liv.fixed_phase_no) {
							ol = 3;
						} //현시 유지
						if (liv.pp_psv) {
							ol = 6;
						} //수동 운영

						//에러모드
						if (liv.lightout_state) {
							bg = 1;
						} //소등
						if (flash) {
							if (liv.flash_reason < 4 || liv.flash_reason == 6) {
								//고장점멸 판단
								ol = 7;
							} else {
								bg = 2;
							}
						}
						if (liv.conflict_state) {
							bg = 3;
						} //모순 감지
						if (liv.door_state) {
							bg = 4;
						} //항체개폐

						if (liv.pushbtn_state) {
							//압버튼|보행감응
							if (liv.walk_error_lsu_state) {
								_statistics.push_err++;
							} else {
								_statistics.push_norm++;
							}
						}

						//통계수집
						_statistics[opstr[ol]]++;
						_statistics[errstr[bg]]++;

						liv.markerEl.forEach((mk, i) => {
							//마커색 변경
							if (mk && $mainMaps[i]) {
								mk.style.setProperty('--ol', opclrs[ol]);
								mk.style.setProperty('--bg', errclrs[bg]);
								if (flash) {
									mk.classList.add('flash');
								} else {
									mk.classList.remove('flash');
								}
							}
						});
					}
					_statistics.sum++;
				}
			});
			$lcStatis = _statistics;
		}, 1500);
	});

	function openWin(e) {
		//창 드랍오픈 이벤트
		e.preventDefault();
		let data = e.dataTransfer.getData('text/plain');
		let split = data.split('!@');
		if (split.length > 1) {
			document.createWindow(split[1], false, e);
		} else {
			console.log('잘못된 드롭다운');
		}
	}

	const flowColors = ['777', 'D1D', '1DD', '3s'];
</script>

<svelte:head>
	<link href="/src/lib/js/GIS/ol.css" rel="stylesheet" />
	<link href="/src/lib/js/GIS/mainMap.css" rel="stylesheet" />
</svelte:head>

<mapLayer
	bind:this={elems.mapLayer}
	on:dragover={(e) => {
		e.preventDefault();
	}}
	on:drop={openWin}
>
	<svg class="grad">
		<defs>
			<rect id="arrowRotate" fill="url(#gradient)" width="21" height="14" x="50" y="43" />
			<!-- 검정도로 -->
			<linearGradient id="gradient" x1="100%" y1="0%" x2="0%" y2="0%">
				<stop offset="0%" stop-color="#{flowColors[0]}0" />
				<stop offset="15%" stop-color="#{flowColors[0]}5" />
				<stop offset="50%" stop-color="#{flowColors[0]}C" />
				<stop offset="70%" stop-color="#{flowColors[0]}" />
				<stop offset="100%" stop-color="#{flowColors[0]}" />
			</linearGradient>
			<!-- 플로우A1 -->
			<linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="0%">
				<stop offset="0%" stop-color="#{flowColors[1]}0" />
				<stop offset="1%" stop-color="#{flowColors[1]}" />
				<stop offset="15%" stop-color="#{flowColors[1]}" />
				<stop offset="20%" stop-color="#{flowColors[1]}0" />
				<stop offset="40%" stop-color="#{flowColors[1]}0" />
				<stop offset="41%" stop-color="#{flowColors[1]}" />
				<stop offset="55%" stop-color="#{flowColors[1]}" />
				<stop offset="60%" stop-color="#{flowColors[1]}0" />
				<stop offset="80%" stop-color="#{flowColors[1]}0" />
				<stop offset="81%" stop-color="#{flowColors[1]}" />
				<stop offset="95%" stop-color="#{flowColors[1]}" />
				<stop offset="100%" stop-color="#{flowColors[1]}0" />
				<animate
					attributeName="x1"
					values="100%;-200%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
				<animate
					attributeName="x2"
					values="300%;0%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
			</linearGradient>
			<!-- 플로우A2 -->
			<linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="0%">
				<stop offset="0%" stop-color="#{flowColors[1]}0" />
				<stop offset="5%" stop-color="#{flowColors[1]}" />
				<stop offset="19%" stop-color="#{flowColors[1]}" />
				<stop offset="20%" stop-color="#{flowColors[1]}0" />
				<stop offset="40%" stop-color="#{flowColors[1]}0" />
				<stop offset="45%" stop-color="#{flowColors[1]}" />
				<stop offset="59%" stop-color="#{flowColors[1]}" />
				<stop offset="60%" stop-color="#{flowColors[1]}0" />
				<stop offset="80%" stop-color="#{flowColors[1]}0" />
				<stop offset="85%" stop-color="#{flowColors[1]}" />
				<stop offset="99%" stop-color="#{flowColors[1]}" />
				<stop offset="100%" stop-color="#{flowColors[1]}0" />
				<animate
					attributeName="x1"
					values="-200%;100%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
				<animate
					attributeName="x2"
					values="0%;300%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
			</linearGradient>
			<!-- 플로우B1 -->
			<linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="0%">
				<stop offset="0%" stop-color="#{flowColors[2]}0" />
				<stop offset="1%" stop-color="#{flowColors[2]}" />
				<stop offset="15%" stop-color="#{flowColors[2]}" />
				<stop offset="20%" stop-color="#{flowColors[2]}0" />
				<stop offset="40%" stop-color="#{flowColors[2]}0" />
				<stop offset="41%" stop-color="#{flowColors[2]}" />
				<stop offset="55%" stop-color="#{flowColors[2]}" />
				<stop offset="60%" stop-color="#{flowColors[2]}0" />
				<stop offset="80%" stop-color="#{flowColors[2]}0" />
				<stop offset="81%" stop-color="#{flowColors[2]}" />
				<stop offset="95%" stop-color="#{flowColors[2]}" />
				<stop offset="100%" stop-color="#{flowColors[2]}0" />
				<animate
					attributeName="x1"
					values="100%;-200%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
				<animate
					attributeName="x2"
					values="300%;0%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
			</linearGradient>
			<!-- 플로우B2 -->
			<linearGradient id="gradient5" x1="0%" y1="0%" x2="0%" y2="0%">
				<stop offset="0%" stop-color="#{flowColors[2]}0" />
				<stop offset="5%" stop-color="#{flowColors[2]}" />
				<stop offset="19%" stop-color="#{flowColors[2]}" />
				<stop offset="20%" stop-color="#{flowColors[2]}0" />
				<stop offset="40%" stop-color="#{flowColors[2]}0" />
				<stop offset="45%" stop-color="#{flowColors[2]}" />
				<stop offset="59%" stop-color="#{flowColors[2]}" />
				<stop offset="60%" stop-color="#{flowColors[2]}0" />
				<stop offset="80%" stop-color="#{flowColors[2]}0" />
				<stop offset="85%" stop-color="#{flowColors[2]}" />
				<stop offset="99%" stop-color="#{flowColors[2]}" />
				<stop offset="100%" stop-color="#{flowColors[2]}0" />
				<animate
					attributeName="x1"
					values="-200%;100%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
				<animate
					attributeName="x2"
					values="0%;300%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
			</linearGradient>
			<!-- 겹침 -->
			<linearGradient id="gradient6" x1="0%" y1="0%" x2="0%" y2="0%">
				<stop offset="9%" stop-color="#{flowColors[2]}0" />
				<stop offset="10%" stop-color="#{flowColors[2]}" />
				<stop offset="15%" stop-color="#{flowColors[2]}" />
				<stop offset="20%" stop-color="#{flowColors[2]}0" />
				<stop offset="49%" stop-color="#{flowColors[2]}0" />
				<stop offset="50%" stop-color="#{flowColors[2]}" />
				<stop offset="55%" stop-color="#{flowColors[2]}" />
				<stop offset="60%" stop-color="#{flowColors[2]}0" />
				<stop offset="89%" stop-color="#{flowColors[2]}0" />
				<stop offset="90%" stop-color="#{flowColors[2]}" />
				<stop offset="95%" stop-color="#{flowColors[2]}" />
				<stop offset="100%" stop-color="#{flowColors[2]}0" />
				<animate
					attributeName="x1"
					values="100%;-200%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
				<animate
					attributeName="x2"
					values="300%;0%;"
					dur={flowColors[3]}
					repeatCount="indefinite"
				/>
			</linearGradient>
		</defs>
	</svg>
	<div id="map1" class="mapDiv" />
	<div id="map2" class="mapDiv" />
	<div id="map3" class="mapDiv" />
	<div id="map4" class="mapDiv" />
	<div bind:this={elems.lcmenu} id="lcmenu">
		<div>
			<div>교차로<br />DB운영</div>
			<div>
				<div class="menu"><img src="/svg/pageIcon/lcMonitor.svg" />교차로 모니터링</div>
				<div class="menu"><img src="/svg/pageIcon/grMonitor.svg" />그룹 모니터링</div>
				<div class="menu"><img src="/svg/pageIcon/dbUpDown.svg" />DB 업다운로드</div>
			</div>
		</div>
		<div>
			<div>신호제어<br />편집</div>
			<div>
				<div class="menu"><img src="/svg/pageIcon/lcEdit.svg" />교차로 편집</div>
			</div>
		</div>
		<div>
			<div>조회</div>
			<div>
				<div class="menu"><img src="/svg/pageIcon/historyInq.svg" />운영이력 조회</div>
				<div class="menu"><img src="/svg/pageIcon/eventInq.svg" />이벤트 조회</div>
			</div>
		</div>
	</div>
	<div bind:this={elems.webrtc} id="webrtc">
		<div>
			<div>교차로<br />DB운영</div>
			<div>
				<div class="menu"><img src="/svg/pageIcon/lcMonitor.svg" />교차로 모니터링</div>
				<div class="menu"><img src="/svg/pageIcon/grMonitor.svg" />그룹 모니터링</div>
				<div class="menu"><img src="/svg/pageIcon/dbUpDown.svg" />DB 업다운로드</div>
			</div>
		</div>
		<div>
			<div>신호제어<br />편집</div>
			<div>
				<div class="menu"><img src="/svg/pageIcon/lcEdit.svg" />교차로 편집</div>
			</div>
		</div>
		<div>
			<div>조회</div>
			<div>
				<div class="menu"><img src="/svg/pageIcon/historyInq.svg" />운영이력 조회</div>
				<div class="menu"><img src="/svg/pageIcon/eventInq.svg" />이벤트 조회</div>
			</div>
		</div>
	</div>
	<UiLayer bind:this={elems.uiLayer} on:message />
</mapLayer>

<style>
	mapLayer {
		position: absolute;
		z-index: 1;
		background-color: #e0dfdb;
		width: 100vw;
		height: 100vh;
	}
	mapLayer #map1 {
		width: 100%;
		height: 100%;
	}
	mapLayer :global(.ol-unselectable) {
		filter: var(--filter);
	}
	#lcmenu {
		position: absolute;
		display: none;
		background-color: #fffd;
		border: 1px solid #7cb0de;
		border-radius: 10px;
		width: 150px;
		height: 0px;
		padding: 5px 7px;
		transition: height 0.2s;
		z-index: 30;
		transform: translate(-15%, 15%);
		overflow: hidden;
	}
	#lcmenu:global(.open) {
		display: block;
		height: 180px;
	}
	#lcmenu img {
		height: 15px;
		vertical-align: text-bottom;
		margin-right: 4px;
	}
	#lcmenu > div {
		display: grid;
		grid-template-columns: 1.5fr 4fr;
		grid-template-rows: 1fr;
		border-bottom: 1px solid #ddd;
	}
	#lcmenu > div:last-of-type {
		border-bottom: none;
	}
	#lcmenu > div > div:nth-of-type(1) {
		text-align: right;
		color: #999;
	}
	#lcmenu > :nth-child(1) > div:nth-of-type(1) {
		padding-top: 29px;
	}
	#lcmenu > :nth-child(3) > div:nth-of-type(1) {
		padding-top: 20px;
	}
	#lcmenu > div > div:nth-of-type(2) {
		padding-left: 4px;
		font-size: 1.3rem;
	}
	#lcmenu > div > div:nth-of-type(2) > div {
		height: 29.4px;
		padding-left: 5px;
		line-height: 29.4px;
		border-radius: 4px;
		cursor: pointer;
	}
	#lcmenu > div > div:nth-of-type(2) > div:hover {
		color: #eee;
		background-color: #40a5ff;
	}
	.mapDiv {
		float: left;
		box-sizing: border-box;
	}
	.grad {
		position: absolute;
		height: 0;
		width: 1px;
		visibility: hidden;
	}
</style>
