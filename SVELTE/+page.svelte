<script>
    import { onMount } from "svelte";
    import Cookies from "js-cookie";
    import Settings from "./windows/settings.svelte";
    import { pageList, defResol, isMap } from "$lib/consts.js";
    import { ajax } from "$lib/functions.js";
    

    let mounted = false;
    let curpage;

    let mapPos = [[1,1],[0,1]] //[[가로시작,가로끝],[세로시작,세로끝]]
    let widgetDisp = [
        [['lcStatus','lcOps'],null, ['priorityDevice','priorityLog']],
        ['lcEvent',null, ['lcLOS','lcRank']]
    ];
    const elm = {   
        frame : undefined,
        mapDiv : undefined,
        map : undefined,
        mapImg : undefined,
        sky : undefined,
        window : undefined,
        winTitle : undefined
    }
    // cameras: [
    //             {
    //                 id: 20000001,
    //                 dir: '북',
    //                 ok: true
    //             },
    //             {
    //                 id: 20000002,
    //                 dir: '동',
    //                 ok: false
    //             },
    //             {
    //                 id: 20000003,
    //                 dir: '남',
    //                 ok: true
    //             },
    //             {
    //                 id: 20000004,
    //                 dir: '서',
    //                 ok: true
    //             },
    //         ]
    const groupNames = ['충정로','서부산업도로']
    const groups = [[2, 13, 9, 8, 35, 5, 7], [13, 10, 12, 55, 18]]
    const losLev = ['A','B','C','D','E','F','FF','FFF'];
    let curgroup = 0;
    const lcs = [
        {
            lcno: 2,
            lcname: '롯데마트4가',
            X: 1640,
            Y: 4270,
            cameras: []
        },
        {
            lcno: 5,
            lcname: '동초교4가',
            X: 4490,
            Y: 2120,
            cameras: []
        },
        {
            lcno: 7,
            lcname: '현대3차사거리',
            X: 5270,
            Y: 1250,
            cameras: []
        },
        {
            lcno: 8,
            lcname: '전화국4가',
            X: 2775,
            Y: 3370,
            cameras: []
        },
        {
            lcno: 9,
            lcname: '잔다리목4가',
            X: 2570,
            Y: 3740,
            cameras: []
        },
        {
            lcno: 10,
            lcname: '농소지하차도4가',
            X: 2695,
            Y: 4230,
            cameras: []
        },
        {
            lcno: 12,
            lcname: '수성사거리',
            X: 3240,
            Y: 4780,
            cameras: []
        },
        {
            lcno: 13,
            lcname: '잔다리목지하차도4가',
            X: 2450,
            Y: 3910,
            cameras: []
        },
        {
            lcno: 18,
            lcname: '삼정산업4가',
            X: 5530,
            Y: 6480,
            cameras: []
        },
        {
            lcno: 35,
            lcname: '제일고4가',
            X: 3300,
            Y: 2750,
            cameras: []
        },
        {
            lcno: 55,
            lcname: '정읍소방서앞',
            X: 4170,
            Y: 5510,
            cameras: []
        },
    ]
    let congs = [[],[]];
    
    let mapResol = [defResol[0] * (mapPos[0][1]-mapPos[0][0] + 1), defResol[1] * (mapPos[1][1]-mapPos[1][0] + 1)] //맵 가로픽셀, 세로픽셀
    let mapBound = [
        [ defResol[0] * mapPos[0][0], defResol[0] * mapPos[0][0] + mapResol[0] ],
        [ defResol[1] * mapPos[1][0], defResol[1] * mapPos[1][0] + mapResol[1] ]
    ]
    let dispTime = new Date();
    let mapScale = 0.4;
    let settingOpen = false;
    let winOpen = false;
    let winEmpty = true;
    let widgets = new Array();



    setTimeout(()=>{
        setInterval(()=>{
            const curTime = new Date();
            // console.dir(curTime.getMilliseconds())
            dispTime = `${curTime.getFullYear()}.${curTime.getMonth()+1}.${curTime.getDate()} ${curTime.toTimeString().substring(0,8)}`;
        }, 1000)
    }, 997 - dispTime.getMilliseconds() )


    onMount(()=>{
        mounted = true;
        if (Cookies.get('mapPos') && Cookies.get('widgetDisp')) {
            mapPos = JSON.parse(Cookies.get('mapPos'));
            widgetDisp = JSON.parse(Cookies.get('widgetDisp'));
        }
        widgetInit(widgetDisp);

        //지도설정
        let pos = [0,0,0,0]
        if (isMap) {
            elm.map.style.left = '-2500px'
            elm.map.style.top = '4500px'
            console.log(mapBound)
            // elm.map.style.left = `${mapResol[0] / 2}px`;
            // elm.map.style.top = `${mapResol[1] / 3}px`;
            
            // @ts-ignore
            elm.map.onmousedown = function (downE) {
                downE.preventDefault();
                pos[2] = downE.clientX;
                pos[3] = downE.clientY;
                elm.map.style.cursor = 'grabbing';
                document.onmousemove = function (e) {
                    e.preventDefault();
                    const dragSpeed = 5 * mapScale;
                    pos[0] = (pos[2] - e.clientX) * dragSpeed; //이동한 값
                    pos[1] = (pos[3] - e.clientY) * dragSpeed;
                    pos[2] = e.clientX; //커서 위치값
                    pos[3] = e.clientY;
                    
                    const X = parseInt(elm.map.style.left) - pos[0];
                    const Y = parseInt(elm.map.style.top) - pos[1];
                    const cr = elm.map.getBoundingClientRect();
                    const imgcr = elm.mapImg.getBoundingClientRect();

                    if (
                        (pos[0] < 0 && (window.scrollX + cr.left - pos[0]) < (mapBound[0][0]) - (imgcr.width / 20) ) 
                        || (pos[0] > 0 && (window.scrollX + cr.left + imgcr.width - pos[0]) > (mapBound[0][1] + (imgcr.width / 20)) )
                        ) {
                        elm.map.style.left = X + 'px';
                    }
                    if (
                        (pos[1] < 0 && ( window.scrollY + cr.top - imgcr.height - pos[1]) < mapBound[1][0]) 
                        || (pos[1] > 0 && ( window.scrollY + cr.top - pos[1]) > mapBound[1][1])
                        ) {
                        elm.map.style.top = Y + 'px';
                    }
                    // elm.sky.style.height = ( Y / 1.3 - 300 )  + 'px'
                }
                document.onmouseup = function () {
                    elm.map.style.cursor = 'grab';
                    document.onmousemove = null;
                    document.onmouseup = null;
                }
            }
            let scaleTO = null;
            elm.map.onmouseover = function () {
                document.onwheel = function (wheelE) {

                    const corVal = 150;

                    if (wheelE.wheelDelta > 0) { //확대
                        if (mapScale < 0.95) {
                            mapScale += 0.1;

                            elm.map.style.left = parseInt(elm.map.style.left) - (corVal * (mapScale + 5)) + 'px';
                            elm.map.style.top = parseInt(elm.map.style.top) + (corVal * (mapScale + 5)) + 'px';
                        }
                    } else if (wheelE.wheelDelta < 0) { //축소
                        if (mapScale > 0.25) {
                            mapScale -= 0.1;

                            elm.map.style.left = parseInt(elm.map.style.left) + (corVal * (mapScale + 5)) + 'px';
                            elm.map.style.top = parseInt(elm.map.style.top) - (corVal * (mapScale + 5)) + 'px';
                            if (scaleTO == null) {
                                scaleTO = setTimeout(()=>{
                                    const cr = elm.map.getBoundingClientRect();
                                    const imgcr = elm.mapImg.getBoundingClientRect();
                                    const imgWidth = imgcr.width;
                                    const imgHeight = imgcr.height;
                                    
                                    if ((window.scrollX + cr.left) > mapBound[0][0] - (imgWidth / 20) ) {
                                        // console.log('왼쪽 침범')
                                        elm.map.style.left = - (imgWidth / 20) + 'px';
                                    } else if ((window.scrollX + cr.left + imgWidth) < mapBound[0][1] + (imgWidth / 20)) {
                                        // console.log('오른쪽 침범')
                                        elm.map.style.left = - imgWidth + mapResol[0] + (imgWidth / 20) + 'px';
                                    }
                                    if ((window.scrollY + cr.top - imgHeight) > mapBound[1][0]) {
                                        // console.log('위쪽 침범')
                                        elm.map.style.top = imgHeight * (19 / 20) + 'px';
                                    } else if ((window.scrollY + cr.top) < mapBound[1][1]) {
                                        // console.log('아래쪽 침범')
                                        elm.map.style.top = mapResol[1] + 'px';
                                    }
                                    scaleTO = null;
                                }, 50)
                            }
                        }
                    }
                }
                elm.map.onmouseout = function () {
                    document.onwheel = null;
                    elm.map.onmouseout = null;
                }
            }
        }
    })

    function widgetInit (_widgetDisp) {
        if (mounted) {
            mapResol = [defResol[0] * (mapPos[0][1]-mapPos[0][0] + 1), defResol[1] * (mapPos[1][1]-mapPos[1][0] + 1)] //맵 가로픽셀, 세로픽셀
            mapBound = [
                [ defResol[0] * mapPos[0][0], defResol[0] * mapPos[0][0] + mapResol[0] ],
                [ defResol[1] * mapPos[1][0], defResol[1] * mapPos[1][0] + mapResol[1] ]
            ]
            const colleng = widgetDisp[0].length;
            const rowleng = widgetDisp.length;
            if (isMap) {
                elm.mapDiv.style.width = mapResol[0] + 'px'
                elm.mapDiv.style.height = mapResol[1] + 'px'
                elm.mapDiv.style.left = (defResol[0] * mapPos[0][0]) + 'px'
                elm.mapDiv.style.top = (defResol[1] * mapPos[1][0]) + 'px'
            }
            elm.frame.style.gridTemplateColumns = `repeat(${colleng}, 1fr)`
            elm.frame.style.gridTemplateRows = `repeat(${rowleng}, 1fr)`

            elm.frame.style.width = ( defResol[0] * colleng ) + 'px';
            elm.frame.style.height = ( defResol[1] * rowleng ) + 'px';

            widgets.forEach((v)=>{console.log(v);v.$destroy()});
            widgets = new Array();
            document.querySelectorAll('#frame > .eachscreen').forEach((v)=>v.remove())

            widgetDisp.forEach((row, rowi)=>{
                row.forEach((col, coli)=>{
                    const eachscreen = document.createElement('div');
                    eachscreen.classList.add('eachscreen');
                    eachscreen.style.width = defResol[0] + 'px';
                    eachscreen.style.height = defResol[1] + 'px';

                    if (Array.isArray(col)) { //화면분할인 경우
                        const _colleng = col.length;
                        eachscreen.style.gridTemplateColumns = `repeat(${_colleng}, 1fr)`
                        col.forEach((colleaf)=>{
                            const content = document.createElement('div');
                            content.classList.add('content');
                            import(`/src/routes/widgets/${colleaf}.svelte`).then((res)=>{
                                widgets.push(new res.default({
                                    target: content,
                                    props: {
                                        pagename: colleaf,
                                        korname: pageList.find(el=>el.eng==colleaf),
                                        width: defResol[0] / _colleng,
                                        height: defResol[1]
                                    }
                                }))
                            })
                            eachscreen.append(content)
                        })
                    } else { //한 화면 전체
                        if (col) { //맵표현
                            eachscreen.style.gridTemplateColumns = '1fr'
                            const content = document.createElement('div');
                            content.classList.add('content');

                            import(`/src/routes/widgets/${col}.svelte`).then((res)=>{
                                widgets.push(new res.default({
                                    target: content,
                                    props: {
                                        pagename: col,
                                        korname: pageList.find(el=>el.eng==col),
                                        width: defResol[0],
                                        height: defResol[1]
                                    }
                                }))
                            })
                            eachscreen.append(content);
                        }
                    }
                    elm.frame.append(eachscreen);
                    
                })
            })
            
            Cookies.set('mapPos', JSON.stringify(mapPos));
            Cookies.set('widgetDisp', JSON.stringify(widgetDisp));
        }
    }
    
    function getPage (name, props) {
        if (curpage) curpage.$destroy();
        import(`/src/routes/windows/${name}.svelte`).then((res)=>{
            curpage = new res.default({
                target: elm.window,
                props: props
            })
        })
    }

    function lcClick (lc) {
        elm.window.innerHTML = '';
        winOpen = true;
        winEmpty = true;
        getPage('lcCameras', {lc:lc, winOpen:winOpen});
        curgroup = groups.findIndex(gr=>Boolean(gr.find(el=>el==lc.lcno)));
        getCong();
    }

    function getCongByLOS (los) {
        let los2num = losLev.findIndex(el=>el==los);
        if (los2num > 4) {
            return 3;
        } else if (los2num > 2) {
            return 2;
        } else if (los2num > -1) {
            return 1;
        } else {
            return 0;
        }
    }

    function getCong () {
        congs = [[],[]];
        groups[curgroup].forEach((lcno, ind)=>{
            ajax(`s_lclos_lt?lcno=${lcno}`).then((res)=>{
                let done = 0;
                if (curgroup == 0) {
                    for (let i=0;i<res.length;i++) {
                        const v = res[i]
                        if (v.dir==0) { //동쪽카메라(하행)
                            congs[1][ind] = getCongByLOS(v.los);
                            done++;
                        } else if (v.dir==1) { //서쪽카메라(상행)
                            congs[0][ind] = getCongByLOS(v.los);
                            done++;
                        }
                        if (done==2) { break; }
                    }
                } else if (curgroup == 1) {
                    for (let i=0;i<res.length;i++) {
                        const v = res[i]
                        if (v.dir==2) { //남쪽카메라(하행)
                            congs[1][ind] = getCongByLOS(v.los);
                            done++;
                        } else if (v.dir==3) { //북쪽카메라(상행)
                            congs[0][ind] = getCongByLOS(v.los);
                            done++;
                        }
                        if (done==2) { break; }
                    }
                }
            })
        })
    }

</script>

<div id="frame" bind:this={elm.frame}>
    {#if !isMap}
        <div class="title">
            <div class="content">
                <div on:click={()=>{settingOpen = true;}}><img src="setting.png" width="35px"/></div>
                <div>{dispTime}</div>
            </div>
        </div>
        <div class="settings" style="top:-{mapResol[1]}px; width:{defResol[0]}px; height:{defResol[1]}px;" class:isopen={settingOpen}>
            <Settings bind:settingOpen={settingOpen} bind:mapPos={mapPos} bind:widgetDisp={widgetDisp} on:confirm={()=>{widgetInit(widgetDisp);}}></Settings>
        </div>
    {/if}
    {#if isMap}
    <div id="mainmap" bind:this={elm.mapDiv}>
        <div class="title">
            <div class="plate">
                <div></div>
                <div></div>
                <div on:click={()=>{settingOpen = true;}}></div>
                <div></div>
            </div>
            <div class="content">
                <div>정읍시 수성동</div>
                <div><img src="logo.png" width="57px"/>통합교통 관제 대시보드</div>
                <div><img src="setting.png" width="35px"/></div>
                <div>{dispTime}</div>
            </div>
        </div>
        <div class="subinfo" class:isopen={winOpen} style="bottom:-{defResol[1]-280}px;">
            <div class="congDiv">
                <div class="cong">
                    <div>실시간 혼잡도</div>
                    <div>
                        <div>{groupNames[curgroup]}</div>
                        <div>
                            {#each congs[0] as lc, ind}
                            <div>
                                <div class="cong{lc}"></div>
                                <div class="cong{congs[1][ind]}"></div>
                                <div>{groups[curgroup][ind] || ''}</div>
                            </div>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <!-- 색깔도움말 -->
                        <div>
                            <div>
                                <div style="background-color: #5C5C5C"></div>
                                <div>정보없음</div>
                            </div>
                            <div>
                                <div style="background-color: #3CC88C"></div>
                                <div>원활</div>
                            </div>
                            <div>
                                <div style="background-color: #D6D02D"></div>
                                <div>서행</div>
                            </div>
                            <div>
                                <div style="background-color: #FF0000"></div>
                                <div>정체</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="window">
                <div class="title" bind:this={elm.winTitle} on:click={()=>{winOpen = !winOpen}}>
                    <div>
                        교차로 카메라 정보
                    </div>
                    <div>
                        {#if winOpen}
                        <img src="svg/arrow_down.svg" />
                        {:else}
                        <img src="svg/arrow_up.svg" />
                        {/if}
                    </div>
                </div>
                <div class="winContent" bind:this={elm.window}>
                    {#if winEmpty}
                    <div class="winEmpty">
                        정보없음
                    </div>
                    {/if}
                </div>
            </div>
        </div>
        <div class="settings" style="top:-{mapResol[1]}px; width:{defResol[0]}px; height:{defResol[1]}px;" class:isopen={settingOpen}>
            <Settings bind:settingOpen={settingOpen} bind:mapPos={mapPos} bind:widgetDisp={widgetDisp} on:confirm={()=>{widgetInit(widgetDisp);}}></Settings>
        </div>
        
        <!-- <div class="sky" bind:this={elm.sky}></div> -->
        <div class="mapcanvas" bind:this={elm.map} style="transform-origin: 50% 50%; transform: translate(-50%, -50%) rotateX(30deg) scale({mapScale});">
            <img src="map20231012.svg" bind:this={elm.mapImg} />
            {#each lcs as lc}
                <div class="lcs" style="left:{lc.X * 2.745}px; bottom:{lc.Y * 2.75}px" title="{lc.lcno + '. ' + lc.lcname}" on:click={()=>{lcClick(lc)}}><img src="TL.png"/></div>
            {/each}
        </div>
    </div>
    {/if}
</div>

<style>
    #frame {
        position:relative;
        background-color:#000C;
        margin: 0 auto;
        display: grid;
    }
    #frame > .title {
        --titleHeight : 55px;
        position: absolute;
        width:100%;
        height:var(--titleHeight);

        z-index: 1;
        color: #CCC;
    }
        #frame > .title .content {
            display: grid;
            opacity: 0.75;
            grid-template-columns: 55px 1fr ;
            gap: 15px;
            width:450px;
            height:100%;
            position: absolute;
            color: #DDD;
            right: 19px;
            top: 15px;
        }
        #frame > .title .content:hover {
            opacity: 1;
        }
            #frame > .title .content > div {
                background-color: #777;
                border-radius:15px;
                float: left;
                box-sizing: border-box;
                text-align: center;
            }
            #frame > .title .content > div:first-of-type {
                /* margin-top:45px; */
                cursor: pointer;
                padding-top:10px;
            }
            #frame > .title .content > div:nth-of-type(2) {
                cursor: default;
                user-select: none;
                font-size: 1.2rem;
                padding-top:7px;
                letter-spacing: -1px;
            }
                #frame > .title .content > div:nth-of-type(2) img {
                    margin: 0 11px;
                    vertical-align: text-bottom;
                }
            #frame > .title .content > div:nth-of-type(3) {
                margin-left:1%;
                margin-top:50px;
                width: 5%;
                height:100%;
            }
            #frame > .title .content > div:nth-of-type(4) {
                margin-left:1%;
                margin-top:45px;
                width: 15%;
                height:100%;
            }
        #mainmap {
            background-color: #060606;
            perspective: 3000px;
            position: absolute;
            overflow: hidden;
        }
            #mainmap > .title {
                --titleHeight : 120px;
                position: absolute;
                width:100%;
                height:var(--titleHeight);

                z-index: 1;
                color: #CCC;
            }
                #mainmap .plate {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width:100%;
                    height:100%;
                }
                    #mainmap .title .plate > div {
                        float: left;
                        box-sizing: border-box;
                        text-align: center;
                    }
                    #mainmap .title .plate > div:first-of-type {
                        margin-left:17%;
                        width: 15%;
                        height:100%;
                    }
                    #mainmap .title .plate > div:nth-of-type(2) {
                        /* margin-left:1%; */

                        border-top: var(--titleHeight) solid #222;
                        border-left: 40px solid transparent;
                        border-right: 40px solid transparent;
                        border-bottom-left-radius: 80px;
                        border-bottom-right-radius: 80px;
                        height: 0;
                        width: 36%;
                    }
                    #mainmap .title .plate > div:nth-of-type(3) {
                        margin-left:-1%;
                        width: 5%;
                        height:100%;
                        cursor: pointer;
                    }
                    #mainmap .title .plate > div:nth-of-type(4) {
                        margin-left:1%;
                        width: 15%;
                        height:100%;
                    }
                #mainmap .content {
                    pointer-events: none;
                    user-select: none;
                    width:100%;
                    height:100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                }
                    #mainmap .title .content > div {
                        float: left;
                        box-sizing: border-box;
                        text-align: center;
                    }
                    #mainmap .title .content > div:first-of-type {
                        margin-left:17%;
                        margin-top:45px;
                        width: 15%;
                        height:100%;
                    }
                    #mainmap .title .content > div:nth-of-type(2) {
                        font-size: 1.7rem;
                        padding-top:30px;
                        font-weight: bold;
                        letter-spacing: -2px;
                        margin-left:1%;

                        width: 33%;
                        height:100%;
                    }
                        #mainmap .title .content > div:nth-of-type(2) img {
                            margin: 0 11px;
                            vertical-align: text-bottom;
                        }
                    #mainmap .title .content > div:nth-of-type(3) {
                        margin-left:1%;
                        margin-top:50px;
                        width: 5%;
                        height:100%;
                    }
                        /* #mainmap .title .content > div:nth-of-type(3):hover {
                            filter: brightness(5)
                        } */
                    #mainmap .title .content > div:nth-of-type(4) {
                        margin-left:1%;
                        margin-top:45px;
                        width: 15%;
                        height:100%;
                    }
            #mainmap .sky {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 250px;
                background: linear-gradient(180deg, #040008 0%, #071c66 5%, #071c66 40%, #000000 100%);
            }
            #mainmap .mapcanvas{
                position: absolute;
                cursor: grab;
                overflow: visible;
            }
                .mapcanvas > img{
                    /* 기본 맵 사이즈 */
                    width:19200px;
                    position: absolute;
                    bottom:0;
                    left:0;
                }
                .mapcanvas .lcs {
                    position:absolute;
                    cursor:pointer;

                    background-color: #FFFFFF;
                    width:140px;
                    height:140px;
                    transform: translate(-50%, -50%);
                    /* transform: translate(-50%, -50%); */
                    border-radius: 100%;
                }
                    .mapcanvas .lcs:hover {
                        filter:brightness(0.9);
                    }
                    .mapcanvas .lcs > img {
                        width: 90px;
                        transform: translate(-50%, -50%);
                        margin: 50%;
                    }

            #mainmap .subinfo {
                position:absolute;
                z-index: 2;
                width:100%;
                left:0;
                color:white;
                transition: bottom 0.2s;
            }
            #mainmap .subinfo.isopen {
                bottom:0 !important;
            }
                #mainmap .subinfo .congDiv {
                    width:100%;
                    height:180px;
                }
                    #mainmap .subinfo .cong {
                        display: grid;
                        grid-template-columns: 1fr 6fr 1fr;
                        background-color: #0a0a0a;
                        border: 2px solid #737474;
                        margin: 0 auto;
                        border-radius: 15px;
                        width: 97%;
                        height: 85%;
                    }
                        /* 실시간 혼잡도 글씨 */
                        #mainmap .subinfo .cong > div:nth-of-type(1) {
                            text-align: center;
                            font-size: 0.9rem;
                            color: #87BBCF;
                            line-height: 150px;
                        }
                        #mainmap .subinfo .cong > div:nth-of-type(2) {
                            display: grid;
                            grid-template-rows: repeat(2, 1fr);
                        }
                            /* 도로명 */
                            #mainmap .subinfo .cong > div:nth-of-type(2) > div:nth-of-type(1) {
                                font-weight: bold;
                                font-size:1.1rem;
                                line-height: 75px;
                            }
                            #mainmap .subinfo .cong > div:nth-of-type(2) > div:nth-of-type(2) {
                                display: grid;
                                color:#8C9BD8;
                                grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
                            }
                                #mainmap .subinfo .cong > div:nth-of-type(2) > div:nth-of-type(2) > div {
                                    display: grid;
                                    font-size: 0.7rem;
                                    text-align: center;
                                    grid-template-rows: repeat(3, 1fr);
                                }
                                    #mainmap .subinfo .cong > div:nth-of-type(2) > div:nth-of-type(2) .cong0 {
                                        background: linear-gradient(180deg, #333 0%, #333 24%, #5C5C5C 25%, #5C5C5C 75%, #333 76%, #333 100%);
                                    }
                                    #mainmap .subinfo .cong > div:nth-of-type(2) > div:nth-of-type(2) .cong1 {
                                        background: linear-gradient(180deg, #333 0%, #333 24%, #3CC88C 25%, #3CC88C 75%, #333 76%, #333 100%);
                                    }
                                    #mainmap .subinfo .cong > div:nth-of-type(2) > div:nth-of-type(2) .cong2 {
                                        background: linear-gradient(180deg, #333 0%, #333 24%, #D6D02D 25%, #D6D02D 75%, #333 76%, #333 100%);
                                    }
                                    #mainmap .subinfo .cong > div:nth-of-type(2) > div:nth-of-type(2) .cong3 {
                                        background: linear-gradient(180deg, #333 0%, #333 24%, #FF0000 25%, #FF0000 75%, #333 76%, #333 100%);
                                    }
                        #mainmap .subinfo .cong > div:nth-of-type(3) > div{
                            display:grid;
                            grid-template-rows: repeat(4, 1fr);
                            gap: 7px;
                            width:55%;
                            height:70%;
                            font-size: 0.6rem;
                            color: #87BBCF;
                            margin:22px auto;
                        }
                            #mainmap .subinfo .cong > div:nth-of-type(3) > div > div{
                                display: grid;
                                gap: 11px;
                                grid-template-columns: 1fr 2fr;
                            }
                                #mainmap .subinfo .cong > div:nth-of-type(3) > div > div > div:first-of-type {
                                    border: 7px solid #0a0a0a;
                                }
                #mainmap .subinfo .window {
                    display: grid;
                    grid-template-rows: 70px 1fr;
                    background-color: #0a0a0a;
                    border-top: 2px solid #737474;
                    width:100%;
                    height:880px;
                }
                    #mainmap .subinfo .window .title{
                        display: grid;
                        grid-template-columns: 1fr 120px;
                        color:#DDD;
                        cursor: pointer;
                    }
                    #mainmap .subinfo .window .title:hover {
                        filter: brightness(3);
                    }
                        #mainmap .subinfo .window .title > div {
                            font-size:1.1rem;
                            padding-left: 30px;
                            line-height: 70px;
                        }
                        #mainmap .subinfo .window .title img {
                            filter:brightness(1.5);
                            height:100%;
                        }

                    #mainmap .subinfo .window .winEmpty{
                        font-size: 0.9rem;
                        line-height: 700px;
                        color:#BBB;
                        text-align: center;
                    }
            .settings {
                background-color: #0a0a0a;
                position:absolute;
                z-index: 3;
                right:0;
                color:white;
                transition: top 0.2s;
                border-bottom:2px solid #737474;
            }
            .settings.isopen {
                top:0 !important;
            }
        #frame :global(.eachscreen) {
            pointer-events: none;
            display: grid;
            grid-template-rows: 1fr;
        }
        #frame :global(.content) {
            pointer-events: auto;
        }

</style>