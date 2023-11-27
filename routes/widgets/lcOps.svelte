<script>
    import CircleProgress from '$lib/circleProgress.svelte'
    import { ajax } from "$lib/functions.js";
    import preset from "../../settings.json"
    import { onDestroy } from 'svelte';

    export let pagename;
    export let data = [95, 56, 75, 80, 42, 56, 38, 20] //0 SCU, 1 로컬, 2 로컬감응, 3 현시유지, 4 센터감응, 5 센터, 6 수동운영, 7 점멸

    // let i = 0;
    let sum = 0;
    $: sumdata = [data[0], data[1], data[2], data[4], data[5]]

    function getData () {
        ajax('lcstatus').then((res)=>{
            data = [
                res.scu,
                res.offline,
                res.off_idu,
                res.keep,
                res.on_idu,
                res.online,
                res.manual,
                res.flash
            ]
            sum = res.scu + res.offline + res.off_idu + res.on_idu + res.online;
        })

        // 가짜데이터
        // if (i % 2 == 1) {
        //     data = [95, 56, 75, 80, 42, 56, 38, 20];
        // } else {
        //     data = [23, 14, 15, 34, 52, 77, 13, 50];
        // }
        // i++;
    }

    getData();
    const interval = setInterval(getData, preset.getCycle[0])

    onDestroy(() => {
        clearInterval(interval)
    });

    let diameter = 200;
    let radius = diameter * 9 / 20;
    let circumference = 2 * Math.PI * radius;

    const colors = ['#8916FF', '#DC6967', '#DC67CE', '#568AFF','#DC67AB', '#DC6788', '#DC8C67', '#DCD267'];

    // $: sum = data.reduce((sum, cur, i)=> sum + cur )
</script>

<div class="frame">
    <div class="title">
        <img src="widgetIcon/{pagename}.png" />
        교차로 운영 현황
    </div>
    <div class="content">
        <div class="grid">
            <div>
                <CircleProgress diameter="{diameter}" val="{data[3]}" max="{sum}" color="{colors[3]}" tag="현시유지"/>
            </div>
            <div>
                <CircleProgress diameter="{diameter}" val="{data[6]}" max="{sum}" color="{colors[6]}" tag="수동운영"/>
            </div>
            <div>
                <CircleProgress diameter="{diameter}" val="{data[7]}" max="{sum}" color="{colors[7]}" tag="점멸"/>
            </div>
            <div>
                <CircleProgress diameter="{diameter}" val="{data[0]}" max="{sum}" color="{colors[0]}" tag="SCU 고정주기"/>
            </div>
            <div>
                <CircleProgress diameter="{diameter}" val="{data[1]}" max="{sum}" color="{colors[1]}" tag="오프라인"/>
            </div>
            <div>
                <CircleProgress diameter="{diameter}" val="{data[5]}" max="{sum}" color="{colors[5]}" tag="온라인"/>
            </div>
            <div>
                <CircleProgress diameter="{diameter}" val="{data[2]}" max="{sum}" color="{colors[2]}" tag="로컬-감응"/>
            </div>
            <div>
                <CircleProgress diameter="{diameter}" val="{data[4]}" max="{sum}" color="{colors[4]}" tag="센터-감응"/>
            </div>
            <div>
                <div class="circle_progress_wrap" style="width:{diameter}px; height:{diameter}px;">
                    <svg class="circle_progress" width="{diameter}" height="{diameter}" viewBox="0 0 {diameter} {diameter}">
                        {#each sumdata as dt, ind}
                        <circle title="{dt}" class="bar" cx="{diameter / 2}" cy="{diameter / 2}" r="{radius}" stroke-width="{diameter / 10}" stroke="{colors[ind]}"
                            style="stroke-dasharray: {2 * Math.PI * radius}; stroke-dashoffset: {circumference * (1.00 - (dt / sum))}; 
                            transform: rotate({ 
                                ( ( ind == 0 ? 0 : sumdata.reduce((acc, cur, i)=>{ 
                                    if (i >= ind) {
                                        return acc 
                                    }; 
                                    return (acc + cur) 
                                }) ) / sum * 360 )
                            }deg)"/>
                        {/each}
                    </svg>
                    <strong class="value" style="line-height:{diameter * 19 / 20}px;">{sum}</strong>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .frame {
        background-color: #131517;
        display: grid;
        padding: 21px;
        box-sizing: border-box;
        grid-template-rows: 60px 1fr;
        width:100%;
        height:100%;
    }
        .title {
            line-height: 60px;
            padding-left: 15px;
            font-size: 1.5rem;
            color: #CCCCCC;
            font-weight: bold;
        }
            .title > img {
                height:60%;
                margin-right: 5px;
                vertical-align: baseline;
            }
        .content {
            padding: 80px 7% 0 7%;
            background-color: #1C1C1E;
            border-radius: 15px;
        }
            .content .grid {
                box-sizing: border-box;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap:12px;
                width: 100%;
                height: 100%;
            }
                .circle_progress_wrap {
                    position: relative;
                    margin: auto;
                }
                    .circle_progress {
                        transform: rotate(-90deg);
                    }
                        .bar {
                            fill: none;
                            /* stroke-linecap: round; */
                            transform-origin: center;
                        }
                    .value {
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        top: 0;
                        font-weight: bold;
                        color:#EEE;
                        text-align: center;
                        font-size: 2rem;
                        pointer-events: none;
                    }
</style>