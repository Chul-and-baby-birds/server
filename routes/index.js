let express = require('express');
let router = express.Router();
let axios = require('axios');
let qs = require('querystring');
let async = require('async');

const API_KEY = '%2B3ga%2FvKkNafMlRsTf%2FGGTD5yoCTSrmnOGw3mZ2k1jslGAeCbFbhHxstUD04CtYmRxMMmBDAzEt9aLREkAM5obw%3D%3D';
const API_DUST_INFO1 = 'http://openapi.airkorea.or.kr/openapi/services/rest';


/* GET home page. */
// 측정시간 : dataTime
// 미세먼지수치 : pm10Value
// 미세먼지단계 : pm10Grade
// 초미세먼지수치 : pm25Value
// 초미세먼지단계 : pm25Grade
// 오존 : o3Value
// 이산화질소 : no2Value
// 일산화탄소 : coGrade
// 아황산가스 : so2Grade
// 1:좋음 2:보통 3:나쁨 4.매우나쁨

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/main1', function (req, res, next) {
    let date= req.headers.date;
    let location = req.headers.location;


    console.log(date);
    console.log(location);
    let encodedate = qs.escape(date);
    let retAirStatus=new Array();

    let API_FORECAST_QUERY = `/ArpltnInforInqireSvc/getMinuDustFrcstDspth?searchDate=${encodedate}&ServiceKey=${API_KEY}&_returnType=json`;

    axios.get(`${API_DUST_INFO1}${API_FORECAST_QUERY}`)
        .then(result => {
            console.log('good');

            for(let i = 1; i<=3;++i){
                let infoGrade = result.data.list[i].informGrade;
                let startString = infoGrade.indexOf(location, 0);
                retAirStatus[i] = infoGrade.slice(startString + 5, 7);

            }
            retAirStatus[0]="보통";
            res.status(200).send(retAirStatus);
        }).catch(e => {
        console.log('err');
        console.log(e);
        res.status(400).send(e.data);
    });

});

router.get('/main2', function (req, res, next) {

    async.waterfall([
        func1,
        func2,
    ], (err, result) => {
       console.log(result);
    });

    //가까운 측정소 찾기
    function func1(callback) {
        //TODO get location
        console.log('func1 enter');
        let XVal= req.headers.XVal;
        let YVal= req.headers.YVal;
        let location ;

        let API_FIND_STATION = `/MsrstnInfoInqireSvc/getNearbyMsrstnList?tmX=${XVal}&tmY=${YVal}&pageNo=1&numOfRows=10&ServiceKey=${API_KEY}&_returnType=json`;


        console.log(API_FIND_STATION);
        axios.get(`${API_DUST_INFO1}${API_FIND_STATION}`)
            .then(result => {
                console.log(result.data);
                location = result.data.list[0].stationName;

                callback(null, location);
                console.log(location);

            }).catch(e => {
            console.log('err');
            console.log(e);
            res.status(400).send(e.data)
        });
    }

    //location 값을 받아와서 미세먼지 수치 추출
    function func2(location, callback) {
        console.log('func2 enter');
        console.log(location);
       let d = new Date();
       let tabacco;
        let encodelocation = qs.escape(location); //한글 인코딩
        console.log(encodelocation);

        let API_DUST_INFO01_QUERY = `/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=${encodelocation}&dataTerm=month&pageNo=1&numOfRows=10&ServiceKey=${API_KEY}&ver=1.3&_returnType=json`;
        let retData ;

        axios.get(`${API_DUST_INFO1}${API_DUST_INFO01_QUERY}`)
            .then(result => {

                retData = {
                    "dataTime": result.data.list[0].dataTime,
                    "pm10Value": result.data.list[0].pm10Value,
                    "pm10Grade": result.data.list[0].pm10Grade,
                    "pm25Value": result.data.list[0].pm25Value,
                    "pm25Grade": result.data.list[0].pm25Grade,
                    "o3Value": result.data.list[0].o3Value,
                    "o3Grade": result.data.list[0].o3Grade,
                    "no2Value": result.data.list[0].no2Value,
                    "no2Grade": result.data.list[0].no2Grade,
                    "coValue": result.data.list[0].coValue,
                    "coGrade": result.data.list[0].coGrade,
                    "so2Value": result.data.list[0].so2Value,
                    "so2Grade": result.data.list[0].so2Grade

                };

                retData.tabbaco= ((d.getHours()* retData.pm10Value)/319).toFixed(1);
                //let a = tabacco.toFixed(1);
                //console.log(a);
               console.log(tabacco);
                res.status(200).send(retData);



            }).catch(e => {
            console.log('err');
            console.log(e);
            res.status(400).send(e.data);
        });

        console.log('location :', location);
        let result = 'complete';
        callback(null, result)




    }
});


module.exports = router;
