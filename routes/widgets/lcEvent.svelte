<script>
    import { ajax } from "$lib/functions.js";
    import preset from "../../settings.json"
    import { onDestroy } from 'svelte';

    export let pagename;
    export let width = 1920;
    export let data = new Array();

    let i = 0;
    function getData () {
        ajax('rtime_event').then((res)=>{
            let _data = new Array();
            res.forEach((v, i)=>{
                _data.push(v)
                _data[i].isNew = data ? Boolean( v.credate > data[0].credate ) : true;
            })
        })
        // if (i % 2 == 1) {
        //     data = [
        //         {
        //             credate : new Date(new Date()-800000),
        //             explain : '교차로 정상',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-700000),
        //             explain : '교차로 업데이트',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-600000),
        //             explain : '교차로 업데이트',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-500000),
        //             explain : '교차로 업데이트',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-400000),
        //             explain : '이벤트 내용 안내',
        //             level : 1,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-300000),
        //             explain : '테스트 교차로',
        //             level : 2,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-100000),
        //             explain : '새로운것1',
        //             level : 2,
        //             isNew : false
        //         }
        //     ]
        // } else {
        //     data = [
        //         {
        //             credate : new Date(new Date()-800000),
        //             explain : '교차로 정상',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-700000),
        //             explain : '교차로 업데이트',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-600000),
        //             explain : '교차로 업데이트',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-500000),
        //             explain : '교차로 업데이트',
        //             level : 0,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-400000),
        //             explain : '새로운것1',
        //             level : 1,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-300000),
        //             explain : '새로운것2',
        //             level : 2,
        //             isNew : false
        //         },
        //         {
        //             credate : new Date(new Date()-100000),
        //             explain : '새로운것3',
        //             level : 2,
        //             isNew : false
        //         }
        //     ]
        // }
        // setTimeout(()=>{
        //     const len = data.length;
        //     for (let i=0;i < len;i++) {
        //         if (data[i].credate > (new Date()-400000)) {
        //             data[i].isNew = true;
        //         }
        //     }
        // }, 70)
        // i++;
    }

    getData();
    const interval = setInterval(getData, preset.getCycle[0])

    onDestroy(() => {
        clearInterval(interval)
    });


    $:wide = Boolean(width > 1000);

    // const levColors = ['#23CB95','#CB73E4','#0A84FF','#FF2968']
    const levColors = ['#CCCCCC','#DCD267','#FF2968']
</script>

<div class="frame">
    <div class="title">
        <img src="widgetIcon/{pagename}.png" />
        실시간 이벤트
    </div>
    <div class="content">
        <div class="grid" class:wide>
            <div>
                {#each data as dt, ind}
                    {#if ind > data.length - 6}
                    {@const fullDate = new Date(dt.credate)}
                    {@const hours = fullDate.getHours()}
                    {@const min = fullDate.getMinutes()}
                    {@const sec = fullDate.getSeconds()}
                    <div style="order:{data.length-ind}; color:{levColors[dt.level]};" class:new={dt.isNew}>
                        <div>
                            <div style="background-color:{levColors[dt.level]};"></div>
                        </div>
                        <div>
                            <div>{dt.explain}</div>
                            <div>{`${fullDate.getFullYear()-2000}. ${fullDate.getMonth()+1}. ${fullDate.getDate()} / ${hours < 10 ? '0' + hours: hours}:${min < 10 ? '0' + min: min}:${sec < 10 ? '0' + sec: sec}`}</div>
                        </div>
                        <div>
                            <!-- <div class="chkbox" class:checked="{dt.checked}" style="border: 4px solid {levColors[dt.lev]};" ind="{ind}">
                                <div style="background-color:{levColors[dt.lev]};">
                                    <img src="check.png" />
                                </div>
                            </div> -->
                        </div>
                    </div>
                    {/if}
                {/each}
            </div>
            {#if wide}
            <div>
                {#each data as dt, ind}
                    {#if ind > data.length - 11 && ind < data.length - 5 }
                    {@const fullDate = new Date(dt.credate)}
                    {@const hours = fullDate.getHours()}
                    {@const min = fullDate.getMinutes()}
                    {@const sec = fullDate.getSeconds()}
                    <div style="order:{data.length-ind}; color:{levColors[dt.level]};" class:new={dt.isNew}>
                        <div>
                            <div style="background-color:{levColors[dt.level]};"></div>
                        </div>
                        <div>
                            <div>{dt.explain}</div>
                            <div>{`${fullDate.getFullYear()-2000}. ${fullDate.getMonth()+1}. ${fullDate.getDate()} / ${hours < 10 ? '0' + hours: hours}:${min < 10 ? '0' + min: min}:${sec < 10 ? '0' + sec: sec}`}</div>
                        </div>
                        <div>
                            <!-- <div class="chkbox" class:checked="{dt.checked}" style="border: 4px solid {levColors[dt.lev]};" ind="{ind}">
                                <div style="background-color:{levColors[dt.lev]};">
                                    <img src="check.png" />
                                </div>
                            </div> -->
                        </div>
                    </div>
                    {/if}
                {/each}
            </div>
            {/if}
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
                vertical-align: baseline;
            }
        .content {

        }
            .content .grid {
                display: grid;
                grid-template-columns: 1fr;
                gap:12px;
                width: 100%;
                height: 100%;
            }
            .content .grid.wide {
                grid-template-columns: 1fr 1fr;
                gap: 42px;
            }
                .grid > div {
                    display: grid;
                    gap: 12px;
                    grid-template-rows: repeat(5, 1fr);
                }
                    .grid > div > div {
                        display: grid;
                        grid-template-columns: 70px 1fr 110px;
                        border-radius: 12px;
                        color: white;
                        background-color: #1C1C1E;
                        box-sizing: border-box;
                        cursor: default;
                    }
                    .grid > div > div.new {
                        animation-name: fadein;
                        animation-duration: 0.7s;
                        animation-delay:0;
                        animation-timing-function: ease-out;
                        animation-iteration-count: 1;
                    }
                    @keyframes fadein {
                        from {
                            opacity: 0;
                            background-color: white;
                        }
                        to {
                            opacity: 1;
                            background-color: #1C1C1E;
                        }
                    }
                    .grid > div > div:hover {
                        background-color: #252434;
                    }
                        .grid > div > div > div:nth-of-type(1) > div {
                            margin: 35% auto;
                            box-sizing: border-box;
                            border-radius: 15px;
                            width:15%;
                            height:75%;
                        }
                        .grid > div > div > div:nth-of-type(2) {
                            display: grid;
                            grid-template-rows: 2fr 1fr;
                        }
                            .grid > div > div > div:nth-of-type(2) > div:nth-of-type(1) {
                                font-size: 1.2rem;
                                padding-top: 35px;
                            }
                            .grid > div > div > div:nth-of-type(2) > div:nth-of-type(2) {
                                font-size: 1rem;
                                color: #999999;
                            }
                        .grid > div > div > div:nth-of-type(3) .chkbox {
                            overflow: hidden;
                            border-radius: 100%;
                            margin: 40px auto;
                            width: 24px;
                            height: 24px;
                        }

                            .grid > div > div > div:nth-of-type(3) .chkbox > div {
                                display: none;
                                padding-top: 6px;
                                width:100%;
                                height:100%;
                            }
                                .grid > div > div > div:nth-of-type(3) .chkbox > div > img {
                                    display: block;
                                    margin: 0 auto;
                                    width:70%;
                                }
                            .grid > div > div > div:nth-of-type(3) .chkbox.checked > div {
                                display: block;
                            }
</style>