<script>
    import { pageList, isMap } from "$lib/consts.js";
    import { createEventDispatcher } from "svelte";

    export let settingOpen = new Boolean();
    export let mapPos = new Array();
    export let widgetDisp = new Array();

    let level = 0;
    let lev1val = '3x2';
    let lev2val = [[-1, -1], [-1, -1]];
    let lev3val = [];
    let lev3subval = [];

    $:btnDisabled = (level == 1) && !lev2val.every(arr=>arr.every(arr2=>arr2 > -1));
    $:lev1valParse = lev1val.split('x').map(el=>Number(el));
    $:lev2layout = new Array(lev1valParse.reduce((acc, cur)=>acc*cur)).fill(0);
    $:btnContext = level == 2 ? '완료' : '다음';

    const dispatch = createEventDispatcher();

    const context = ['화면 레이아웃을 선택해주세요','지도를 표출할 범위를 설정합니다. 시작지점과 끝지점을 차례로 클릭해주세요','각 화면에 표출할 위젯을 선택해주세요'];
    
    function cancel () {
        level = 0;
        lev2val = [[-1, -1], [-1, -1]];
        lev2layout = new Array(lev1valParse.reduce((acc, cur)=>acc*cur)).fill(0);
        lev3val = [];
        lev3subval = [];
        settingOpen = false;
    }

    function confirm () {
        level++;
        if (level == 1 && !isMap) {
            level = 2;
        }
        if (level == 2) {
            lev3val = Array.from({length: lev1valParse[1]}, e => Array(lev1valParse[0]).fill(null));
            lev3subval = Array.from({length: lev1valParse[1]}, e => Array(lev1valParse[0]).fill(null));
        }
        
        if (level > 2) {
            mapPos = lev2val;
            widgetDisp = lev3val;
            for (let i=0; i < widgetDisp.length; i++) {
                for (let o=0; o < widgetDisp[i].length; o++) {
                    if (lev3subval[i][o]) {widgetDisp[i][o] = [widgetDisp[i][o], lev3subval[i][o]]}
                }
            }
            // console.log(mapPos)
            // console.log(widgetDisp)
            dispatch('confirm');
            cancel();
        }
    }

    function lev2process (ind) {
        let progress = 0;
        lev2val[0].forEach((v)=>{if (v > -1) {progress++;}})
        const len = lev2layout.length;
        switch (progress) {
            case 0:
                lev2layout[ind] = true;
                lev2val[0][0] = ind % lev1valParse[0]; //x
                lev2val[1][0] = Math.floor(ind / lev1valParse[0]); //y
                break;
            case 1:
                const x = ind % lev1valParse[0];
                const y = Math.floor(ind / lev1valParse[0]);
                if (x < lev2val[0][0] || y < lev2val[1][0]) {
                    lev2val[0][0] = -1;
                    lev2val[1][0] = -1;
                    for (let i=0; i < len; i++) {
                        lev2layout[i] = 0;
                    }
                    lev2process(ind);
                } else {
                    lev2val[0][1] = x;
                    lev2val[1][1] = y;
                    for (let i=0; i < len; i++) {
                        const curX = i % lev1valParse[0];
                        const curY = Math.floor(i / lev1valParse[0])
                        lev2layout[i] = ((curX >= lev2val[0][0] && curX <= x) && (curY >= lev2val[1][0] && curY <= y)) ? 2 : 0;
                    }
                }
                break;
            case 2:
                lev2val = [[-1, -1], [-1, -1]];
                for (let i=0; i < len; i++) {
                    lev2layout[i] = 0;
                }
                lev2process(ind);
                break;
        }
    }
</script>

<div class="grid">
    <div>
        <div>   
            맞춤 레이아웃 설정 ({isMap ? `${level+1}/3` : `${level ? 2 : 1}/2`})
        </div>
        <div class="btns" style="background-color:#303030;" on:click={cancel}>취소</div>
        <div class="btns" class:disabled={btnDisabled} style="background-color:#568AFF;" on:click={confirm}>{btnContext}</div>
    </div>
    <div>
        <div>  
            <div class="context">
                * {context[level]}
            </div>
            {#if level == 0}
                <div class="lev1">
                    <label>
                        <input bind:group={lev1val} value="1x2" type="radio"/>
                        <div>
                            <div></div>
                            <div></div>
                        </div>
                    </label>
                    <label>
                        <input bind:group={lev1val} value="2x2" type="radio"/>
                        <div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </label>
                    <label>
                        <input bind:group={lev1val} value="3x2" type="radio"/>
                        <div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </label>
                </div>
            {:else if level == 1}
                <div class="lev2" style="width:{(lev1valParse[0] * 335) - 15}px; grid-template-columns: repeat({lev1valParse[0]}, 320px); grid-template-rows: repeat({lev1valParse[1]}, 180px);">
                    {#each lev2layout as active, ind}
                        <div role="button" tabindex="{ind}" class:active1={active==1} class:active2={active==2} on:click={()=>{lev2process(ind)}}></div>
                    {/each}
                </div>
            {:else if level == 2}
                <div class="lev3" style="width:{(lev1valParse[0] * 495) - 15}px; grid-template-columns: repeat({lev1valParse[0]}, 480px); grid-template-rows: repeat({lev1valParse[1]}, 270px);">
                    {#each lev2layout as active, ind}
                        <div class:map={active==2}>
                            {#if active == 2}
                                지도
                            {:else}
                                <div>
                                    <select bind:value={lev3val[Math.floor(ind / lev1valParse[0])][ind % lev1valParse[0]]}>
                                        <option value={null} style="color:#999;">비어있음</option>
                                        {#each pageList as page}
                                        <option value={page.eng}>{page.kor}</option>
                                        {/each}
                                    </select>
                                </div>
                                <div>
                                    {#if lev3val[Math.floor(ind / lev1valParse[0])][ind % lev1valParse[0]] }
                                    <select bind:value={lev3subval[Math.floor(ind / lev1valParse[0])][ind % lev1valParse[0]]}>
                                        <option value={null} style="color:#999;">비어있음</option>
                                        {#each pageList as page}
                                        <option value={page.eng}>{page.kor}</option>
                                        {/each}
                                    </select>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .grid {
        width:100%;
        height:100%;
        display: grid;
        grid-template-rows: 130px 1fr;
    }
        .grid > div:nth-of-type(1) {
            display: grid;
            grid-template-columns: 1fr 170px 170px;
            padding: 30px;
            box-sizing: border-box;
            font-size: 1.1rem;
            gap:15px;
            text-align: center;
            line-height: 70px;
        }
            .btns {
                line-height: 70px;
                border-radius: 5px;
                text-align: center;
                user-select: none;
                font-size: 0.9rem;
            }
            .btns.disabled {
                pointer-events: none;
                filter:brightness(0.4)
            }
            .btns:not(.disabled):hover {
                cursor: default;
                filter:brightness(0.8)
            }
            .btns:not(.disabled):active {
                filter:brightness(0.5)
            }
        .grid > div:nth-of-type(2) {
            padding: 0 70px 70px 70px;
        }
        .grid > div:nth-of-type(2) > div {
            display: grid;
            grid-template-rows: 110px 1fr;
            width:100%;
            height: 100%;
            border-radius: 15px;
            background-color: #131517;
        }
            .grid .context {
                color:#DDD;
                padding-top: 110px;
                text-align: center;
            }
            .grid .lev1 {
                display: grid;
                padding-top: 50px;
                grid-template-columns: repeat(3, 1fr);
            }   
                .lev1 > label > input {
                    display: block;
                    margin: 90px auto;
                    width: 24px;
                    height: 24px;
                }
                    .lev1 > label:hover {
                        filter: brightness(0.7);
                        /* opacity: 0.5; */
                    }
                .lev1 > label > div {
                    margin:0 auto;
                }
                    .lev1 > label > div > div {
                        border-radius: 5px;
                        background-color: #FFF7;
                    }
                .lev1 > label:nth-of-type(1) > div {
                    display: grid;
                    gap:7px;
                    width:160px;
                    grid-template-columns: 160px;
                    grid-template-rows: 90px 90px;
                }
                .lev1 > label:nth-of-type(2) > div {
                    display: grid;
                    gap:7px;
                    width:327px;
                    grid-template-columns: 160px 160px;
                    grid-template-rows: 90px 90px;
                }
                .lev1 > label:nth-of-type(3) > div {
                    display: grid;
                    gap:7px;
                    width:494px;
                    grid-template-columns: 160px 160px 160px;
                    grid-template-rows: 90px 90px;
                }
            .grid .lev2 {
                margin: 75px auto;
                display: grid;
                gap: 15px;
                padding-top: 50px;
            }
                .grid .lev2 > div {
                    border-radius: 7px;
                    background-color: #FFF7;
                }
                .grid .lev2 > div.active1 {
                    background-color: #FFFB;
                }
                .grid .lev2 > div.active2 {
                    background-color: #FFFE;
                }
                .grid .lev2 > div:hover {
                    filter:brightness(0.7);
                }
            .grid .lev3 {
                margin: 75px auto;
                display: grid;
                gap: 15px;
                padding-top: 50px;
            }
                .grid .lev3 > div {
                    cursor: default;
                    text-align: center;
                    border-radius: 7px;
                    background-color: #FFF7;
                }
                .grid .lev3 > div:not(.map) {
                    display: grid;
                    grid-template-rows: 1fr 1fr;
                }
                    .grid .lev3 > div > div > select {
                        background-color: #333;
                        color: #DDD;
                        border-radius: 7px;
                        margin-top:30px;
                        font-size: 1rem;
                        height: 50px;
                    }
                        .grid .lev3 > div > div > select > option {
                            background-color: #444;
                            margin: 15px 3px;
                        }
                    .grid .lev3 > div > div:nth-of-type(1) > select {
                        margin-left: 15px; 
                        float: left;
                    }
                    .grid .lev3 > div > div:nth-of-type(2) > select {
                        margin-right: 15px; 
                        float: right;
                    }
                .grid .lev3 > div.map {
                    padding-top: 110px;
                    color: white;
                    filter:brightness(0.7);
                }

</style>