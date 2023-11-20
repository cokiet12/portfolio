<svelte:options accessors />

<script>
	// @ts-nocheck

	import { onMount, onDestroy } from 'svelte';

	import { pageWidth, settings } from '$lib/store.mjs';
	import { ajax, asy } from '/src/lib/js/functions.mjs';
	import Button from '$lib/nested/button.svelte';
	import MapSetup from '/src/lib//js/GIS/MapSetup.cjs';
	// import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import Select from '$lib/nested/dropdown.svelte';
	import _ from 'lodash';

	let root;
	export let winMode = false;

	onDestroy(() => {
		nodeMap.setTarget(null);
	});

	$: stats.Small_Node = $pageWidth != 0 && $pageWidth < 893 ? true : false;
	$: if (editMode) {
		if (editMode == 1) {
			nodes.forEach((v, i) => {
				v.draggable = true;
			});
		} else if (editMode == 2) {
			nodes.forEach((v, i) => {
				v.draggable = false;
			});
		}
	}
	$: allcheck(isallcheck);
	$: linkChange(stats.showLink);
	$: linkStartChange(linkStart);
	// $: console.log(nodetasks);
	// $: console.log(linktasks);
	$: if (stats.confOpen) {
		//단축키
		document.addEventListener('keypress', keyConfirm);
	} else {
		document.removeEventListener('keypress', keyConfirm);
	}

	function linkStartChange(ls) {
		if (ls == false && memLink) {
			if (linkMem.length > 1) {
				//길이가 있을때
				let req = {
					datamodetype: 1,
					linkid: ++linkid,
					nodes: linkMem.map((el) => el.node_id)
				};
				if (linkMem[0].type == 1) {
					//교차로일 때
					elems.lclink.style.display = 'grid';
					elems.lclinkcancel.onclick = () => {
						document.removeEventListener('keypress', keyEnter);
						elems.lclink.style.display = '';
						// req.groupnum
					};
					elems.lclinkbtn.onclick = () => {
						document.removeEventListener('keypress', keyEnter);
						elems.lclink.style.display = '';
						req.groupnum = Number(elems.lclinksel.value);
						etgroups.splice(etgroups.indexOf(etgroups.find((el) => el.SA_NO == req.groupnum)), 1);
						etgroups = etgroups;
					};
					const keyEnter = (e) => {
						e.preventDefault();
						elems.lclinkbtn.click();
					};
					document.addEventListener('keypress', keyEnter);
				}
				linktasks.push(req);
				linktasks = linktasks;
			} else {
				memLink.setMap(null);
				nodeMap.removeLayer(memLink);
				links.splice(links.indexOf(memLink), 1);
			}
			linkMem = new Array(); //링크데이터 초기화
			memLink = null;
		}
	}

	function keyConfirm(e) {
		if (e.key == 'Enter') {
			elems.confbtn.click();
		}
	}

	function allcheck(ac) {
		stats.showNode = ac;
		stats.showLC = ac;
		stats.showDet = ac;
		stats.showSmart = ac;
		stats.showBtn = ac;
		// stats.showSub = ac;
		stats.showLink = ac;
		stats.allcheck = ac;
	}

	let elems = {
		nodeMap: null,
		context: null,
		confirm: null,
		confbtn: null,
		lclink: null,
		lclinksel: null,
		lclinkcancel: null,
		lclinkbtn: null
	};
	let isallcheck = true;
	let stats = {
		Small_Node: false, //반응형

		showNode: true,
		showLC: true,
		showDet: true,
		showSmart: true,
		showBtn: true,
		// showSub : true,
		showLink: true,

		contOpen: false,
		confOpen: false
	};

	let editMode = 1;
	let linkStart = false;
	let linkMem = new Array();
	let memLink;

	// 맵관련
	let NEOMAP;
	let setup;
	let nodeMap;
	let mapView;
	let viewPort;
	let ol;

	let nodeid = 0;
	let linkid = 0;
	let links = new Array();
	let linkinfos = new Array();
	let nodes = new Array();
	let nodeinfos = new Array();

	let etnodes = new Object();
	let etgroups = new Array();
	const linkopts = [
		{ width: 0, color: [0, 0, 0, 0] },
		{ width: 9, color: [70, 50, 50, 0.5] }, //기본 1
		{ width: 5, color: [70, 50, 50, 0.5] },
		{ width: 3, color: [70, 50, 50, 0.5] },
		{ width: 9, color: [0, 90, 90, 0.5] }, //추가 4
		{ width: 5, color: [0, 90, 90, 0.5] },
		{ width: 3, color: [0, 90, 90, 0.5] },
		{ width: 9, color: [0, 70, 140, 0.5] }, //수정 7
		{ width: 5, color: [0, 70, 140, 0.5] },
		{ width: 3, color: [0, 70, 140, 0.5] },
		{ width: 9, color: [190, 0, 0, 0.5] }, //삭제 10
		{ width: 5, color: [190, 0, 0, 0.5] },
		{ width: 3, color: [190, 0, 0, 0.5] },
		{ width: 21, color: [0, 90, 90, 0.5] }
	];
	const nodetypes = ['et', 'lc', 'detector', 'camera', 'pushbtn'];
	const nodetypesKO = ['빈노드', '교차로', '검지기', '카메라', '압버튼'];
	let nodetasks = new Array();
	let linktasks = new Array();

	function linkChange() {
		//
		if (mapView) {
			const zoomLev = mapView.getZoom().toFixed(2);
			if (stats.showLink) {
				if (zoomLev < 12.5) {
					links.forEach((v) => {
						setup.setLineStyle(v, linkopts[0]);
					});
				} else if (zoomLev < 14) {
					links.forEach((v) => {
						setup.setLineStyle(v, linkopts[3 + v.stat * 3]);
					});
				} else if (zoomLev < 15.5) {
					links.forEach((v) => {
						setup.setLineStyle(v, linkopts[2 + v.stat * 3]);
					});
				} else {
					links.forEach((v) => {
						setup.setLineStyle(v, linkopts[1 + v.stat * 3]);
					});
				}
			} else {
				links.forEach((v) => {
					setup.setLineStyle(v, linkopts[0]);
				});
			}
		}
	}

	function makeMarker(v, modi) {
		const img = document.createElement('img');
		const tag = document.createElement('div');
		const node_id = v.node_id;
		if (nodeid < Number(node_id)) nodeid = Number(node_id);

		const marker = setup.Marker(
			[v.node_lng, v.node_lat],
			nodeMap,
			img,
			editMode == 1 ? true : false,
			nodetypes[v.node_type] + ' nodeEdit'
		);
		nodes.push(marker);
		img.insertAdjacentElement('beforebegin', tag);

		img.onmousedown = function (e) {
			if (editMode == 1) {
				//노드편집모드일 때
				const initCoord = marker.getPosition();
				e.preventDefault();
				let move = 0;
				viewPort.onmousemove = function (e) {
					//드래그
					e.preventDefault();
					move++;
				};
				document.onmouseup = function (e) {
					e.preventDefault();
					viewPort.onmousemove = null;
					document.onmouseup = null;

					if (move > 4) {
						//이동
						img.classList.add('modi');
						const _coord = marker.getPosition();
						nodetasks.push({
							datamodetype: 2,
							node_id: v.node_id,
							node_name: v.node_name,
							node_lng: _coord[0],
							node_lat: _coord[1],
							node_sano: v.node_sano
						});
						nodetasks = nodetasks;
					} else {
						marker.setPosition(initCoord);
					}
				};
			}
		};
		img.onclick = function (e) {
			if (editMode == 2 && linkStart) {
				if (v.node_type < 2) {
					//교차로와 빈노드만
					if (memLink) {
						// if (linkMem[0].type != v.node_type) {
						//     document.createMsg('같은 타입의 노드끼리만 연결이 가능합니다.')
						//     return;
						// }
						if (linkMem.find((el) => el.node_id == v.node_id)) {
							return;
						}
						memLink.setMap(null);
						nodeMap.removeLayer(memLink);
						links.splice(links.indexOf(memLink), 1);
					}
					linkMem.push({
						type: v.node_type,
						node_id: v.node_id,
						coord: marker.getPosition()
					});
					const coords = linkMem.map((el) => el.coord);

					memLink = setup.MultiLine(
						nodeMap,
						coords.length == 1
							? [
									coords[0].map((el) => String(Number(el) - 0.000001)),
									coords[0].map((el) => String(Number(el) + 0.000001))
							  ]
							: coords,
						linkopts[13]
					);
					memLink.stat = 1;
					links.push(memLink);
					if (coords.length != 1) {
						linkChange();
					}
				} else {
					document.createMsg('교차로와 빈 노드만 연결이 가능합니다.');
				}
			}
		};
		img.onmouseenter = function () {
			showID(v.node_id);
		};
		img.onmouseleave = function () {
			closeID(v.node_id);
		};

		function nodeCont(e) {
			//노드 우클릭
			if (editMode == 1) {
				e.preventDefault();
				e.stopPropagation();
				const cont = elems.context;
				const del = document.createElement('div');

				del.textContent = '노드 제거';
				del.onclick = function () {
					img.classList.add('del');
					nodetasks.push({
						datamodetype: 3,
						node_id: v.node_id,
						node_type: v.node_type
					});
					nodetasks = nodetasks;
					stats.contOpen = false;
				};

				cont.style.top = e.layerY + 'px';
				cont.style.left = e.layerX + 'px';
				cont.innerHTML = '';
				cont.insertAdjacentElement('afterbegin', del);

				if (v.node_type == 1) {
					const edit = document.createElement('div');
					edit.textContent = '방향 편집';
					edit.onclick = function () {
						console.log(v);
						document.createMsgWindow('flowEdit/index.svelte', '방향편집', [
							v.lcno,
							v.node_id,
							v.node_name
						]);
						stats.contOpen = false;
					};
					cont.insertAdjacentElement('afterbegin', edit);
				}

				stats.contOpen = true;
				stats.confOpen = false;
			}
		}

		function makeMarkerType() {
			img.oncontextmenu = nodeCont;

			switch (v.node_type) {
				case 0: //빈 노드 우클릭
					img.src = '/images/node.png';
					img.oncontextmenu = function (e) {
						if (editMode == 1) {
							e.preventDefault();
							e.stopPropagation();
							const cont = elems.context;

							const conn = document.createElement('div');
							conn.textContent = '연결';
							conn.onclick = function () {
								const conf = elems.confirm;
								const content = conf.querySelector('.content');
								const btns = conf.querySelector('.btns').children;

								const selectDiv = document.createElement('div');
								const select = document.createElement('select');
								select.classList.add('etsel');
								let type = 0;

								function tabChange() {
									type = Number(this.getAttribute('val'));
									Array.prototype.forEach.call(tabDiv.children, (v) => {
										v.classList.remove('sel');
									});
									this.classList.add('sel');
									select.innerHTML = '';
									etnodes[type].forEach((v) => {
										const opt = document.createElement('option');
										opt.value = v.lcno || v.tfdt_id;
										opt.textContent = v.lcno
											? `${v.lcno}. ${v.lcname}`
											: `${v.tfdt_id}. ${v.tfdt_name}`;
										select.appendChild(opt);
									});
								}
								const tabDiv = document.createElement('div');
								tabDiv.classList.add('tab');
								const div1 = document.createElement('div');
								div1.textContent = '교차로';
								div1.setAttribute('val', '1');
								div1.onclick = tabChange;
								const div2 = document.createElement('div');
								div2.textContent = '검지기';
								div2.setAttribute('val', '2');
								div2.onclick = tabChange;
								const div3 = document.createElement('div');
								div3.textContent = '카메라';
								div3.setAttribute('val', '3');
								div3.onclick = tabChange;
								const div4 = document.createElement('div');
								div4.textContent = '압버튼';
								div4.setAttribute('val', '4');
								div4.onclick = tabChange;
								tabDiv.append(div1, div2, div3, div4);
								div1.click();

								selectDiv.append(select);

								btns[0].onclick = function (e) {
									//취소
									stats.confOpen = false;
								};
								btns[1].onclick = function (e) {
									//확인
									const val = select.value;
									if (val) {
										nodetasks.push({
											//연결
											datamodetype: 4,
											node_id: String(v.node_id),
											node_type: type,
											id: val
										});
										nodetasks = nodetasks;
										stats.confOpen = false;
										v.node_type = type;
										img.classList.add('new');
										const idx = etnodes[type].indexOf(
											etnodes[type].find((el) => el.lcno == val || el.tfdt_id == val)
										);
										etnodes[type].splice(idx, 1); //빈곳에서 제거
										makeMarkerType();
									} else {
										document.createMsg('값이 없습니다');
									}
								};

								conf.style.top = e.layerY + 'px';
								conf.style.left = e.layerX + 'px';

								content.innerHTML = '';
								content.append(tabDiv, selectDiv);
								stats.contOpen = false;
								stats.confOpen = true;
							};
							const del = document.createElement('div');
							del.textContent = '노드 제거';
							del.onclick = function () {
								img.classList.add('del');
								nodetasks.push({
									datamodetype: 3,
									node_id: v.node_id,
									node_type: v.node_type
								});
								nodetasks = nodetasks;
								stats.contOpen = false;
							};
							cont.style.top = e.layerY + 'px';
							cont.style.left = e.layerX + 'px';
							cont.innerHTML = '';
							cont.append(conn, del);
							stats.contOpen = true;
							stats.confOpen = false;
						}
					};
					break;
				case 1: //교차로
					img.src = '/images/lc.png';
					break;
				case 2: //검지기
					img.src = '/images/detector.png';
					break;
				case 3: //카메라
					img.src = '/images/camera.png';
					break;
				case 4: //압버튼
					img.src = '/images/pushbtn.png';
					break;
			}
		}
		makeMarkerType();

		v.tagEl = marker.getElement().previousElementSibling;
	}

	function makeMap(center, zoom) {
		setup = new NEOMAP(new MapSetup(settings));
		if (!ol) ol = setup.getOL();
		nodeMap = setup.Map(elems.nodeMap);
		mapView = nodeMap.getView(); // ol/View
		if (center) {
			mapView.setCenter(center);
			mapView.setZoom(zoom);
		}
		viewPort = nodeMap.getViewport(); //Element

		viewPort.style.setProperty('--resol', mapView.getZoom().toFixed(2));

		viewPort.onmousedown = (e) => {
			e.preventDefault();
			stats.contOpen = false;
			stats.confOpen = false;
		};

		//링크 성능 개선 필요
		nodeMap.on('contextmenu', (e) => {
			//노드 생성메뉴
			e.preventDefault();
			if (editMode == 1) {
				const coord = e.coordinate;
				const pix = e.pixel;
				const conf = elems.confirm;
				const content = conf.querySelector('.content');
				const btns = conf.querySelector('.btns').children;
				const _nodeid = nodeid + 1;

				const div0 = document.createElement('div');
				div0.insertAdjacentHTML('afterbegin', `<b>노드 생성</b> ( ID : ${_nodeid} )`);
				const div1 = document.createElement('div');
				const input1 = document.createElement('input');
				div1.insertAdjacentText('afterbegin', '노드명 : ');
				div1.insertAdjacentElement('beforeend', input1);
				input1.value = _nodeid;
				const div2 = document.createElement('div');
				const input2 = document.createElement('input');
				div2.insertAdjacentText('afterbegin', '경도 : ');
				div2.insertAdjacentElement('beforeend', input2);
				input2.value = coord[0];
				const div3 = document.createElement('div');
				const input3 = document.createElement('input');
				div3.insertAdjacentText('afterbegin', '위도 : ');
				div3.insertAdjacentElement('beforeend', input3);
				input3.value = coord[1];

				btns[0].onclick = function (e) {
					//취소
					stats.confOpen = false;
				};
				btns[1].onclick = function (e) {
					//확인
					const _coord = [input2.value, input3.value];
					const img = document.createElement('img');
					img.src = '/images/node.png';
					img.classList.add('new');
					nodeid = _nodeid;
					setup.Marker(_coord, nodeMap, img, true, 'et nodeEdit');
					mapView.animate({
						center: _coord,
						duration: 300
					});
					nodetasks.push({
						//추가
						datamodetype: 1,
						node_id: String(nodeid),
						node_name: input1.value,
						node_lng: _coord[0],
						node_lat: _coord[1]
					});
					nodetasks = nodetasks;
					stats.confOpen = false;
				};

				conf.style.left = pix[0] + 'px';
				conf.style.top = pix[1] + 'px';
				content.innerHTML = '';
				content.append(div0, div1, div2, div3);
				stats.contOpen = false;
				stats.confOpen = true;
			}
		});

		function zoomEvent() {
			asy(() => {
				const zoomLev = mapView.getZoom().toFixed(2);
				viewPort.style.setProperty('--resol', zoomLev);

				linkChange();
			});
		}

		nodeMap.getView().on('change:resolution', zoomEvent);
		ajax('/AllnodeBytype').then(async (res) => {
			nodeinfos = _.concat(...Object.values(res));
			nodeinfos.forEach((v) => {
				makeMarker(v); //노드마커 생성
			});

			document.lcCon.updateLinks().then(() => {
				//링크 생성
				linkinfos = Object.values(document.lcCon.linkDetail);
				linkinfos.forEach((v) => {
					const id = Number(v[0].link_id);
					if (linkid < id) linkid = id;
					const link = setup.MultiLine(
						nodeMap,
						v.map((el) => el.coord),
						linkopts[0]
					);
					// const linkinfo = linkinfos[i];
					setup.addLineEvent(nodeMap, link, 'contextmenu', (un, e) => {
						if (editMode == 2) {
							e.preventDefault();
							e.stopPropagation();
							const pixel = e.pixel;
							const cont = elems.context;
							const del = document.createElement('div');
							del.textContent = '링크 제거';
							del.onclick = function () {
								link.stat = 3;
								linkChange();
								linktasks.push({
									datamodetype: 3,
									linkid: Number(v[0].link_id)
									// groupnum: Number(v[0].sa_no),
								});
								linktasks = linktasks;
								stats.contOpen = false;
							};
							cont.style.left = pixel[0] + 'px';
							cont.style.top = pixel[1] + 'px';
							cont.innerHTML = '';
							cont.insertAdjacentElement('afterbegin', del);
							stats.contOpen = true;
							stats.confOpen = false;
						}
					});

					link.stat = 0;
					links.push(link);
					v.forEach((node) => {
						//교차로값 연동
						const nodeinfo = nodeinfos.find((el) => el.node_id == node.node_id);
						node.lcno = nodeinfo.lcno || null;
						node.lcname = nodeinfo.lcname || null;
					});
				});
				linkChange();
			});
		});

		zoomEvent();
	}

	function panToNode(id) {
		const nodeinfo = nodeinfos.find((el) => el.node_id == id);
		mapView.animate({
			center: [nodeinfo.node_lng, nodeinfo.node_lat],
			duration: 300
		});
	}

	function showID(id) {
		const tagEl = nodeinfos.find((el) => el.node_id == id).tagEl;
		tagEl.textContent = id;
		tagEl.style.display = 'block';
		tagEl.parentElement.style.zIndex = 1;
	}

	function closeID(id) {
		const tagEl = nodeinfos.find((el) => el.node_id == id).tagEl;
		tagEl.style.display = '';
		tagEl.parentElement.style.zIndex = '';
	}

	function showIDs(val) {
		val.forEach((v) => {
			const id = v.node_id;
			const tagEl = nodeinfos.find((el) => el.node_id == id).tagEl;
			tagEl.textContent = v.num + '. ' + id;
			tagEl.style.display = 'block';
			tagEl.parentElement.style.zIndex = 1;
		});
	}

	function closeIDs(val) {
		val.forEach((v) => {
			const id = v.node_id;
			const tagEl = nodeinfos.find((el) => el.node_id == id).tagEl;
			tagEl.style.display = '';
			tagEl.parentElement.style.zIndex = '';
		});
	}

	async function init(center, zoom) {
		const res1 = await ajax('/getETNODE');
		etnodes[1] = res1.LC;
		// etnodes[2] = res1.TFDT;
		// etnodes[3] = res1.VIDEO;
		// etnodes[4] = res1.PBTN;
		nodeid = 0;
		linkid = 0;
		const res2 = await ajax('/GET_ETGROUP');
		etgroups = res2;
		makeMap(center, zoom);
	}

	function refresh() {
		nodeMap.setTarget(null);
		nodes = new Array();
		links = new Array();
		nodetasks = new Array();
		linktasks = new Array();
		init(mapView.getCenter(), mapView.getZoom());
	}

	onMount(() => {
		import('$lib/js/GIS/NeoMap.cjs').then((res) => {
			//맵로드
			NEOMAP = res.default;
			init();
		});
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div
			class="contentDiv"
			class:cndiv={stats.Small_Node == true}
			class:hidNode={!stats.showNode}
			class:hidLC={!stats.showLC}
			class:hidDet={!stats.showDet}
			class:hidSmart={!stats.showSmart}
			class:hidBtn={!stats.showBtn}
			class:hidLink={!stats.showLink}
		>
			<div
				class="LeftDiv"
				bind:this={elems.nodeMap}
				class:linkStart
				style:border={editMode == 1 ? '2px solid #0d99' : '2px solid #7af9'}
			>
				<div class="btnDn" class:dn={editMode == 1}>
					<Button
						width="130"
						on:click={() => {
							linkStart = !linkStart;
						}}
						colored={linkStart ? 'blue' : false}
						>{linkStart ? '그룹링크 연결 완료' : '그룹링크 연결 시작'}</Button
					>
				</div>
				<div class="cont context" class:open={stats.contOpen} bind:this={elems.context} />
				<div class="cont confirm" class:open={stats.confOpen} bind:this={elems.confirm}>
					<div class="content" />
					<div class="btns">
						<div class="btn cancel">취소</div>
						<div class="btn submit" bind:this={elems.confbtn}>확인</div>
					</div>
				</div>
				<div class="lclink" bind:this={elems.lclink}>
					<div><b>교차로링크 그룹연결</b></div>
					<div>
						<select bind:this={elems.lclinksel}>
							{#each etgroups as group}
								<option value={group.SA_NO}>{group.SA_NO}. {group.SA_NAME}</option>
							{/each}
						</select>
					</div>
					<div>
						<div class="cancel" bind:this={elems.lclinkcancel}>미연결</div>
						<div class="submit" bind:this={elems.lclinkbtn}>연결</div>
					</div>
				</div>
			</div>
			<div />
			<div class="RightDiv">
				<div style="margin: 0px 0px 0px 8px;">
					<Select
						width="calc(100% - 2px)"
						option={[
							{ id: 1, text: '노드 편집모드' },
							{ id: 2, text: '링크 편집모드' }
						]}
						bind:selected={editMode}
						disabled={linkStart}
					/>
				</div>
				<div />
				<div style="margin: 0px 0px 0px 8px;">
					<!-- <Searcher width="calc(100% - 2px)"></Searcher> -->
				</div>
				<div />
				<div style="display:grid; grid-template-rows:50% 50%">
					<div style="display:grid; grid-template-columns:27% 27% 27% 19%">
						<Input type="checkbox1" bind:checked={isallcheck}>전체</Input>
						<Input type="checkbox1" bind:checked={stats.showNode}>빈 노드</Input>
						<Input type="checkbox1" bind:checked={stats.showLC}>교차로</Input>
						<Input type="checkbox1" bind:checked={stats.showDet}>검지기</Input>
					</div>
					<div style="display:grid; grid-template-columns:27% 27% 27% 19%">
						<Input type="checkbox1" bind:checked={stats.showSmart}>스마트영상</Input>
						<Input type="checkbox1" bind:checked={stats.showBtn}>압버튼</Input>
						<!-- <Input type="checkbox1" bind:checked={stats.showSub}>연동</Input> -->
						<Input type="checkbox1" bind:checked={stats.showLink}>링크</Input>
					</div>
				</div>

				<div />
				<div class="list" class:dn={editMode == 2}>
					<div class="title">
						<div>타입</div>
						<div>ID</div>
						<div>노드ID</div>
						<div>이름</div>
					</div>
					<div class="newScrollBar">
						{#each nodeinfos as val}
							<div
								on:mouseenter={() => {
									showID(val.node_id);
								}}
								on:mouseleave={() => {
									closeID(val.node_id);
								}}
								on:click={() => {
									panToNode(val.node_id);
								}}
								class={nodetypes[val.node_type]}
							>
								<div>{nodetypesKO[val.node_type]}</div>
								<div>{val.node_type == 0 ? val.node_id : val.lcno || val.tfdt_id}</div>
								<div>{val.node_id}</div>
								<div>{val.node_type == 0 ? val.node_name : val.lcname || val.tfdt_name}</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="grlist" class:dn={editMode == 1}>
					<div class="title">
						<div>타입/순번</div>
						<div>링크/노드ID</div>
						<div>그룹/교차로번호</div>
						<div>그룹/교차로명</div>
					</div>
					<div class="newScrollBar">
						{#each linkinfos as val, i}
							<div class="link">
								<div
									on:mouseenter={() => {
										showIDs(val);
									}}
									on:mouseleave={() => {
										closeIDs(val);
									}}
									on:click={() => {}}
								>
									<div>{val[0].sa_no == 9999 ? '노드링크' : '교차로링크'}</div>
									<div>{val[0].link_id}</div>
									<div>{val[0].sa_no == 9999 ? '' : val[0].sa_no}</div>
									<div>{val[0].sa_no == 9999 ? '' : val[0].sa_name}</div>
								</div>
								<div class="nodes">
									{#each val as node}
										<div
											on:mouseenter={() => {
												showID(node.node_id);
											}}
											on:mouseleave={() => {
												closeID(node.node_id);
											}}
											on:click={() => {
												panToNode(node.node_id);
											}}
										>
											<div />
											<div>{node.num}</div>
											<div>{node.node_id}</div>
											<div>{node.lcno || ''}</div>
											<div>{node.lcname || ''}</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
		<div />
		<div class="BtnDiv" class:Nbtndiv={stats.Small_Node == true}>
			<div />
			<Button
				icon="init"
				on:click={refresh}
				disabled={nodetasks.length + linktasks.length ? false : true}>초기화</Button
			>
			<div />
			<Button
				colored="blue"
				icon="save2db"
				on:click={async () => {
					if (nodetasks.length) {
						//노드저장
						let res = await ajax('/SaveNode', 'POST', nodetasks);
						if (Boolean(typeof res.FAIL == 'undefined')) {
							refresh();
						}
						document.isSuccess(res);
					}
					if (linktasks.length) {
						//링크저장
						let res = await ajax('/SaveLink', 'POST', linktasks);
						if (Boolean(typeof res.FAIL == 'undefined')) {
							refresh();
						}
						document.isSuccess(res);
					}
				}}
				disabled={nodetasks.length + linktasks.length && !linkStart ? false : true}>저장</Button
			>
		</div>
	</div>
</div>

<style>
	.dn {
		display: none !important;
	}
	#main {
		min-width: 615px;
		min-height: 610px;
		font-size: 1.3rem;
		/* background-color: #f9fafb; */
		padding: 11px;
		overflow: auto;
	}
	.EntireDiv {
		height: calc(100% - 32px);
		display: grid;
		grid-template-rows: 93% 10px calc(7% - 10px);
		box-shadow: 0px 0px 10px #0000000d;
		/* border: 1px solid #DBE2E6; */
		border-radius: 6px;
		background-color: #212830dd;
		padding: 15px;
	}

	#main.win {
		width: 1032px;
		height: 642px;
	}

	.btnDn {
		width: 130px;
		position: absolute;
		z-index: 2;
		top: 10px;
		right: 10px;
	}

	.cndiv {
		display: grid;
		grid-template-columns: 40% 1px calc(60% - 1px) !important;
		/* background-color: #f9fafb; */
		overflow: auto;
	}

	.contentDiv {
		display: grid;
		grid-template-columns: 57% 1px calc(43% - 1px);
		/* background-color: #f9fafb; */
		overflow: auto;
	}

	.LeftDiv {
		/* border: 1px solid #e9eaeb; */
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}
	/* .LeftDiv :global(.nodeEdit) {
            background-color:red;
            display : inline-block;
        } */
	.cont {
		display: none;
		position: absolute;
		background-color: #fffd;
		border: 1px solid #7cb0de;
		border-radius: 0 10px 10px 10px;
		padding: 2px;
		z-index: 30;
		user-select: none;
	}
	.cont.open {
		display: block;
	}
	.cont.context > :global(div) {
		border-radius: 7px;
		padding: 5px 7px;
		min-width: 70px;
		cursor: pointer;
	}
	.cont.context > :global(div:hover) {
		color: #eee;
		background-color: #40a5ff;
	}
	/* .cont.confirm {
                    top: 300px;
                } */
	.cont.confirm .content > :global(div) {
		padding: 4px 7px;
		text-align: center;
		min-width: 190px;
	}
	.cont.confirm .content :global(.etsel) {
		width: 100%;
		margin: 7px 0;
		padding: 3px;
		border: 1px solid #bbb;
		color: #777;
		font-size: 1.4rem;
	}
	.cont.confirm .content > :global(.tab) {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 2px;
		padding-bottom: 0;
		border-bottom: 1px solid #bcc;
	}
	.cont.confirm .content > :global(.tab > div) {
		padding: 5px 7px;

		border-radius: 3px 3px 0 0;
		background-color: #cdd;
	}
	.cont.confirm .content > :global(.tab > .sel) {
		background-color: #dee;
	}
	.lclink {
		display: none;
		position: absolute;
		z-index: 125;
		min-width: 140px;
		min-height: 70px;
		text-align: center;
		top: 7px;
		right: 7px;
		background: #212830;
		border-radius: 4px;
		border: 1px solid #ccc;
		grid-template-rows: 1fr 1fr 1fr;
	}
	.lclink > div {
		line-height: 24px;
		padding: 7px 11px;
	}
	/* .lclink > :last-child {
                        display:grid;
                        grid-template-columns: 1fr 1fr;
                    } */
	.cont.confirm .btn {
		user-select: none;
		border-radius: 7px;
		padding: 3px 9px;
		cursor: pointer;
		text-align: center;
	}
	.cont.confirm .btn:active {
		color: #eee;
		background-color: #40a5ff;
	}
	.lclink {
		display: none;
		position: absolute;
		z-index: 125;
		min-width: 140px;
		min-height: 70px;
		text-align: center;
		top: 7px;
		right: 7px;
		background: #212830;
		border-radius: 4px;
		border: 1px solid #ccc;
		grid-template-rows: 1fr 1fr 1fr;
	}
	.lclink > div {
		line-height: 24px;
		padding: 7px 11px;
	}
	/* .lclink > :last-child {
                    display:grid;
                    grid-template-columns: 1fr 1fr;
                } */
	.lclink select {
		width: 100%;
		padding: 3px;
		border: 1px solid #bbb;
		background-color: #fff0;
		color: #aaa;
		font-size: 1.4rem;
	}

	.lclink .cancel {
		user-select: none;
		border-radius: 7px;
	}
	.lclink .submit {
		user-select: none;
		border-radius: 7px;
	}
	.lclink :is(.submit, .cancel):active {
		color: #eee;
		background-color: rgb(150, 206, 255);
	}
	.hidNode :global(.et) {
		display: none !important;
	}
	.hidLC :global(.lc) {
		display: none !important;
	}
	.hidDet :global(.detector) {
		display: none !important;
	}
	.hidSmart :global(.camera) {
		display: none !important;
	}
	.hidBtn :global(.pushbtn) {
		display: none !important;
	}
	.hidLink :global(.link) {
		display: none !important;
	}
	.LeftDiv :global(.nodeEdit > img) {
		float: left;
		border-radius: 100px;
		outline: 1px solid black;
		outline-offset: 2px;
		margin: calc((var(--resol) - 15) * 1.5px);
		opacity: 0.55;
		--size: calc((var(--resol) - 7.5) * 1.5px);
		width: var(--size);
		height: var(--size);
	}
	.LeftDiv :global(.nodeEdit > img.new) {
		outline: 2px solid #077;
		outline-offset: 1px;
	}
	.LeftDiv :global(.nodeEdit > img.del) {
		outline: 2px solid #c00;
		outline-offset: 1px;
	}
	.LeftDiv :global(.nodeEdit > img.modi) {
		outline: 2px solid #04a;
		outline-offset: 1px;
	}
	.LeftDiv :global(.nodeEdit > img:hover) {
		background-color: #fff;
	}
	.LeftDiv :global(.nodeEdit > img:active) {
		opacity: 1;
	}
	.LeftDiv :global(.nodeEdit > div) {
		position: absolute;
		left: 50%;
		z-index: 1;
		pointer-events: none;
		top: 0;
		transform: translate(-50%, -100%);
		background-color: white;
		padding: 1px 3px;
		border-radius: 3px;
		outline: 1px solid #ccc;
		display: none;
	}
	.linkStart :global(.ol-overlaycontainer) {
		box-shadow: #0353 0px 0px 50px 5px inset;
		filter: grayscale(0.7);
	}
	/* const nodetypes = ['','lc','detector','camera','pushbtn'];
        .LeftDiv.nodeOff . { display:none; } */

	.RightDiv {
		height: 100%;
		color: #999;
		display: grid;
		grid-template-rows: 6% 5px 6% 5px 9% 5px calc(79% - 15px);
	}
	.RightDiv .newScrollBar {
		height: 398px;
		overflow: auto;
		box-shadow: inset 0 0 3px 1px #7774;
	}
	.RightDiv .list .newScrollBar > div {
		user-select: none;
		cursor: pointer;
		display: grid;
		grid-template-columns: 18% 18% 31% 33%;
	}
	.RightDiv .list .newScrollBar > div:hover {
		background-color: #5551;
	}
	.RightDiv .list .newScrollBar > div:active {
		background-color: #5553;
	}
	.RightDiv .list .newScrollBar > div > div {
		padding: 5px;
		outline: 0.01px solid #7771;
	}

	.RightDiv .grlist .newScrollBar :is(.link, .nodes) > div:not(.nodes) {
		user-select: none;
		cursor: pointer;
		display: grid;
		grid-template-columns: 18% 18% 31% 33%;
	}
	.RightDiv .grlist .newScrollBar .nodes > div {
		grid-template-columns: 3% 15% 18% 31% 33% !important;
	}
	.RightDiv .grlist .newScrollBar :is(.link, .nodes) > div:not(.nodes):hover {
		background-color: #5551;
	}
	.RightDiv .grlist .newScrollBar :is(.link, .nodes) > div:not(.nodes):active {
		background-color: #5553;
	}
	.RightDiv .grlist .newScrollBar :is(.link, .nodes) > div:not(.nodes) > div {
		padding: 5px;
		outline: 0.01px solid #7771;
	}

	.list {
		display: grid;
		grid-template-rows: 35px calc(100% - 35px);
		margin-left: 8px;
		background-color: #212830;
	}

	.title {
		display: grid;
		grid-template-columns: 18% 18% 31% 33%;
		/* background-color: #F4F7F9; */
		font-size: 1.4rem;
		color: #999;
		text-align: center;
		line-height: 35px;
	}

	.NewScrollBar {
		border: 1px solid #e9eaeb;
		border-radius: 2px;
		overflow: auto;
	}

	.grlist {
		display: grid;
		grid-template-rows: 35px calc(100% - 35px);
		margin-left: 8px;
		background-color: #212830;
	}

	.BtnDiv {
		display: grid;
		grid-template-columns: calc(78% - 5px) 11% 5px 11%;
		overflow: auto;
	}

	.Nbtndiv {
		grid-template-columns: calc(100% - 149px) 72px 5px 72px !important;
	}
</style>
