<script>
    import { ajax } from "$lib/functions.js";
    import preset from "../../settings.json"
    import { onDestroy } from 'svelte';

    function getData () {
        ajax('lcstatus').then((res)=>{
            data = {
                normal : res.conSuc,
                trans : 0,
                connErr : res.conErr,
                lightOut : res.lightoff,
                errFlash : res.flash,
                DBerror : res.dbErr,
                conflict : res.mosun,
                open : res.dooropen,
                detector : [res.detSuc, res.detErr],
                pushbtn : [res.pedSuc, res.pedErr],
                smartlc : [res.smartlc, res.camcnt]
            }
        })
    }
    
    getData();
    const interval = setInterval(getData, preset.getCycle[0])

    onDestroy(() => {
        clearInterval(interval)
    });

    export let pagename;
    export let data = {
        normal : 34,
        trans : 3,
        connErr : 1,
        lightOut : 1,
        errFlash : 2,
        DBerror : 3,
        conflict : 1,
        open : 1,
        detector : [15, 1],
        pushbtn : [17, 0],
        smartlc : [34, 125]
    }
</script>

<div class="frame">
    <div class="title">
        <img src="widgetIcon/{pagename}.png" />
        현황 통계 정보
    </div>
    <div class="content">
        <div>
            <div dtnm="정상">{data.normal}</div>
            <div dtnm="트랜스">{data.trans}</div>
            <div dtnm="통신이상">{data.connErr}</div>
            <div dtnm="소등">{data.lightOut}</div>
            <div dtnm="점멸">{data.errFlash}</div>
            <!-- <div dtnm="고장점멸">{data.errFlash}</div> -->
            <div dtnm="DB에러">{data.DBerror}</div>
            <div dtnm="모순">{data.conflict}</div>
            <div dtnm="함체개방">{data.open}</div>
        </div>
        <div>
            <div>
                <div>
                    검지기
                </div>
                <div class="black">
                    <!-- <div dtnm="정상">{data.detector[0]}</div> -->
                    <div dtnm="에러">{data.detector[1]}</div>
                </div>
            </div>
            <div>
                <div>
                    보행자<br/>버튼
                </div>
                <div class="black">
                    <!-- <div dtnm="정상">{data.pushbtn[0]}</div> -->
                    <div dtnm="에러">{data.pushbtn[1]}</div>
                </div>
            </div>
        </div>
        <div>
            <div>
                스마트 교차로
            </div>
            <div class="black">
                <div dtnm="스마트운영">{data.smartlc[0]}</div>
                <div dtnm="카메라">{data.smartlc[1]}</div>
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
        .black {
            background-color: #000000;
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
            display: grid;
            gap:12px;
            width: 100%;
            height: 100%;
            grid-template-rows: 2fr 1fr 1fr;

            text-align: center;
            color: white;
        }
            .content > div {
                background-color: #1C1C1E;
                border-radius: 12px;
            }
            .content > div:nth-of-type(1) {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
            }
                .content > div:nth-of-type(1) > div {
                    font-size: 3rem;
                    font-weight: bold;
                    color: #DC6967;
                }
                .content > div:nth-of-type(1) > div:nth-of-type(-n+4) {
                    color:white;
                }
                .content > div:nth-of-type(1) > div::before {
                    display:block;
                    margin-top:15%;
                    font-size: 1rem;
                    font-weight: normal;
                    color: #CCCCCC;
                    content: attr(dtnm);
                }
                .content > div:nth-of-type(1) > div:nth-of-type(5):before {
                    color: #DC6967;
                }
            .content > div:nth-of-type(2) {
                background-color: transparent;
                display: grid;
                gap:12px;
                grid-template-columns: 1fr 1fr;
            }
                .content > div:nth-of-type(2) > div {
                    display: grid;
                    grid-template-columns: 170px 1fr;
                    background-color: #1C1C1E;
                    border-radius: 12px;
                }
                    .content > div:nth-of-type(2) > div > div {
                        border-radius: 12px;
                        margin: 12px;
                    }
                    .content > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) {
                        padding-top: 80px;
                    }
                    .content > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) {
                        padding-top: 60px;
                    }
                    .content > div:nth-of-type(2) > div > div:nth-of-type(2) {
                        display: grid;
                        font-size: 2rem;
                        font-weight: bold;
                        line-height: 8rem;
                        grid-template-rows: 1fr;
                        /* line-height: 4rem;
                        grid-template-rows: 1fr 1fr; */
                    }
                        .content > div:nth-of-type(2) > div > div:nth-of-type(2) > div{
                            position: relative;
                        }
                        .content > div:nth-of-type(2) > div > div:nth-of-type(2) > div::before {
                            position: absolute;
                            color:#CCCCCC;
                            left: 30px;
                            top: 3px;
                            font-size: 1rem;
                        }
                        .content > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) {
                            /* color:#648CFA; */
                            color:#FF5C5C;
                        }
                        .content > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1)::before {
                            content:attr(dtnm);
                        }
                        .content > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) {
                            color:#FF5C5C;
                        }
                        .content > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2)::before {
                            content:attr(dtnm)
                        }
            .content > div:nth-of-type(3) {
                display: grid;
                grid-template-columns: 300px 1fr;
            }
                .content > div:nth-of-type(3) > div:nth-of-type(1) {
                    padding-top: 90px;
                }
                .content > div:nth-of-type(3) > div:nth-of-type(2) {
                    margin: 12px;
                    border-radius: 12px;
                    display: grid;
                    grid-template-rows: 1fr 1fr;
                    font-size: 2rem;
                    font-weight: bold;
                }
                    .content > div:nth-of-type(3) > div:nth-of-type(2) > div {
                        position: relative;
                        line-height: 4rem;
                    }
                    .content > div:nth-of-type(3) > div:nth-of-type(2) > div::before {
                        position: absolute;
                        left: 30px;
                        top: 3px;
                        content: attr(dtnm);
                        color: #CCCCCC;
                        font-size: 1rem;
                        margin-right: 1rem;
                    }
                    .content > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) {
                        color:#23CB95;
                    }
                    .content > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(2) {
                        color:#00DFE5;
                    }
</style>