<script>
    import { ajax } from "$lib/functions.js";
    import { LOScolors } from "$lib/consts.js";
    // import preset from "../../settings.json"
    import { onDestroy } from 'svelte';

    let credate = '';

    function getData () {
        ajax('losrank').then((res)=>{
            data = [0,0,0,0,0,0,0,0];
            res.forEach((v)=>{
                switch (v.los) {
                    case 'A' :
                        data[0]++;
                        break;
                    case 'B' :
                        data[1]++;
                        break;
                    case 'C' :
                        data[2]++;
                        break;
                    case 'D' :
                        data[3]++;
                        break;
                    case 'E' :
                        data[4]++;
                        break;
                    case 'F' :
                        data[5]++;
                        break;
                    case 'FF' :
                        data[6]++;
                        break;
                    case 'FFF' :
                        data[7]++;
                        break;
                }
            })
            const fullDate = new Date(res[0].cre_date);
            const year = fullDate.getFullYear()-2000;
            const month = fullDate.getMonth()+1;
            const date = fullDate.getDate();
            let hours = fullDate.getHours();
            let prehours = hours > 0 ? hours-1 : 23;
            if (hours < 10) {hours = '0' + hours}
            if (prehours < 10) {prehours = '0' + prehours}

            credate = `${year}. ${month}. ${date} / ${prehours}-${hours}시 기준`
        })
    }

    let interval = null;

    getData();
    const curTime = new Date();
    const leftMin = (61 - curTime.getMinutes());
    const leftSec = (60 - curTime.getSeconds());

    setTimeout(()=>{
        interval = setInterval(getData, 3600000)
    }, (leftMin * 60000) + (leftSec * 1000))

    onDestroy(() => {
        if (interval) clearInterval(interval)
    });

    export let pagename;
    export let data = [0, 1, 14, 0, 1, 14, 0, 1];
</script>

<div class="frame">
    <div class="title">
        <img src="widgetIcon/{pagename}.png" />
        스마트교차로 LOS 통계 
        <div>{credate}</div>
    </div>
    <div class="content">
        <div class="grid">
            <div>
                <div>
                    <div style="border:2px solid {LOScolors[0]}">
                        <div>{data[0]}</div>
                        <div style="color:{LOScolors[0]}">A</div>
                    </div>
                </div>
                <div>
                    <div style="border:2px solid {LOScolors[1]}">
                        <div>{data[1]}</div>
                        <div style="color:{LOScolors[1]}">B</div>
                    </div>
                </div>
                <div>
                    <div style="border:2px solid {LOScolors[2]}">
                        <div>{data[2]}</div>
                        <div style="color:{LOScolors[2]}">C</div>
                    </div>
                </div>
            </div>
            <div>
                <div>
                </div>
                <div>
                    <div style="border:2px solid {LOScolors[3]}">
                        <div>{data[3]}</div>
                        <div style="color:{LOScolors[3]}">D</div>
                    </div>
                </div>
                <div>
                    <div style="border:2px solid {LOScolors[4]}">
                        <div>{data[4]}</div>
                        <div style="color:{LOScolors[4]}">E</div>
                    </div>
                </div>
                <div>
                </div>
            </div>
            <div>
                <div>
                    <div style="border:2px solid {LOScolors[5]}">
                        <div>{data[5]}</div>
                        <div style="color:{LOScolors[5]}">F</div>
                    </div>
                </div>
                <div>
                    <div style="border:2px solid {LOScolors[6]}">
                        <div>{data[6]}</div>
                        <div style="color:{LOScolors[6]}">FF</div>
                    </div>
                </div>
                <div>
                    <div style="border:2px solid {LOScolors[7]}">
                        <div>{data[7]}</div>
                        <div style="color:{LOScolors[7]}">FFF</div>
                    </div>
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
            position: relative;
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
            .title > div {
                position: absolute;
                bottom: 0px;
                right: 15px;
                font-size: 1rem;
            }
        .content {
            padding: 80px 7% 0 7%;
            background-color: #1C1C1E;
            border-radius: 15px;
        }
            .content .grid {
                display: grid;
                grid-template-rows: repeat(3, 1fr);
                width: 100%;
                height: 100%;
            }
                .content .grid > div {
                    display: grid;
                    grid-template-columns: 2fr 2fr 2fr;
                }
                .content .grid > div:nth-of-type(2) {
                    grid-template-columns: 1fr 2fr 2fr 1fr;
                }
                    .content .grid > div > div > div {
                        display: grid;
                        grid-template-rows: 5fr 4fr;
                        box-sizing: border-box;
                        padding: 0 40px;
                        width: 215px;
                        height: 215px;
                        margin: 15px auto;
                        background: transparent radial-gradient(closest-side at 50% 50%, #000000 0%, #022C57 100%) 0% 0% no-repeat padding-box;
                        border-radius: 100%;
                        color: #CCCCCC;
                        overflow: hidden;
                    }       
                        .content .grid > div > div > div > div {
                            padding-top: 25%;
                            text-align: center;
                            font-weight: bold;
                            font-size: 2rem;
                        }
                        .content .grid > div > div > div > div:nth-of-type(2) {
                            padding-top: 5%;
                            border-top: 1px solid #5975B4;
                            font-size: 1.5rem;
                        }

</style>