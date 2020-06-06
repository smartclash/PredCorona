<script>
    import { onMount, afterUpdate } from 'svelte';
    import Chart from 'chart.js';
    import axios from 'axios';
    import moment from 'moment';

    let theRawData;

    let theCanvas;
    let thePredictCanvas;
    let theChart;
    let thePredictChart;

    let predictForDays = 10;
    let thePredictedDates;
    let thePredictedCases;
    let labels = [], data = [], rawGF = [], rawGFSum = 0, avgGF = 0, totalDeaths = 0, totalRecovered = 0;

    function manipulateData(coronaData) {
        coronaData.data.forEach(element => {
            labels.push(moment(element.day).format('DD-MM'));
            data.push(element.summary.total);
            totalDeaths += element.summary.deaths;
            totalRecovered += element.summary.discharged;
        });

        for (let i = 0; i <= data.length; i++) {
            if (typeof data[i + 1] !== 'undefined') {
                let calc = data[i + 1] / data[i];
                rawGFSum += calc;
                rawGF.push(calc);
            }
        }

        avgGF = rawGFSum / rawGF.length;
    }

    function returnDatesToPredict(days) {
        let listOfDays = [];
        for (let i = 1; i <= days; i++) {
            listOfDays.push(moment(labels.slice(-1)[0], 'DD-M').add(i, 'days').format('DD-MM'));
        }

        return listOfDays;
    }

    function returnPredictedCase(days) {
        let listOfCases = [];
        for (let i = 1; i <= days; i++) {
            let cases = data.slice(-1)[0] * Math.pow(avgGF, i);
            listOfCases.push(Math.round(cases));
        }

        return listOfCases;
    }

    onMount(() => {
        axios.get('https://api.rootnet.in/covid19-in/stats/history')
            .then((response) => {
                manipulateData(response.data);
                thePredictedDates = returnDatesToPredict(predictForDays);
                thePredictedCases = returnPredictedCase(predictForDays);

                thePredictChart = new Chart(thePredictCanvas, {
                    type: 'line',
                    data: {
                        labels: thePredictedDates,
                        datasets: [
                            {
                                label: 'Predicted Total Cases',
                                data: thePredictedCases,
                                borderColor: 'rgb(255, 46, 99)'
                            },
                        ],
                    },
                });

                theChart = new Chart(theCanvas, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            {
                                label: 'Present Total Cases',
                                data,
                                borderColor: 'rgb(75, 192, 192)'
                            },
                        ],
                    },
                });
            })
            .catch(err => console.log(err));
    });

    afterUpdate(() => {
        if (predictForDays !== 10) {
            thePredictedDates = returnDatesToPredict(predictForDays);
            thePredictedCases = returnPredictedCase(predictForDays);

            thePredictChart.data.labels = thePredictedDates;
            thePredictChart.data.datasets[0].data = thePredictedCases;
            thePredictChart.update();
        }
    });
</script>

<div class="container">
    <section style="padding-top: 45px;">
        <div class="card">
            <div class="card-content">
                <p class="title is-size-3">PredCorona</p>
                <p class="subtitle">A simple web app that predicts corona cases, deaths and recovery cases for the
                    number of days you specify.</p>
            </div>
        </div>
    </section>
    <section style="padding-top: 45px">
        <div class="card">
            <div class="card-content">
                <div class="columns">
                    <div class="column is-8 has-text-centered">
                        <span class="subtitle is-size-4">Enter number of days for which you want to predict the corona
                            cases</span>
                    </div>
                    <div class="column is-4">
                        <div class="columns is-mobile">
                            <div class="column is-4">
                                <button class="button is-fullwidth is-link is-outlined" on:click={()=> predictForDays <=
                                        0 ? '' : predictForDays--}>-</button>
                            </div>
                            <div class="column is-4">
                                <input type="text" class="input" bind:value={predictForDays} readonly>
                            </div>
                            <div class="column is-4">
                                <button class="button is-fullwidth is-link is-outlined" on:click={()=>
                                    predictForDays++}>+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section style="padding-top: 45px">
        <div class="columns">
            <div class="column is-6">
                <div class="card is-3by4">
                    <div class="card-content">
                        <canvas bind:this={thePredictCanvas}></canvas>
                    </div>
                </div>
            </div>
            <div class="column is-6">
                <div class="card is-3by4">
                    <div class="card-content">
                        <canvas bind:this={theCanvas}></canvas>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section style="padding-top: 45px; padding-bottom: 60px;">
        <div class="card">
            <div class="card-content">
                <div class="content">
                    <p class="is-title is-size-3">About</p>
                    <p>Hi, I am <a href="https://twitter.com/@xXAlphaManXx">AlphaMan</a>. I made this small website in
                        two hours or less just because I was bored of quarantine days. This whole website is made using
                        Javascript and has no backend powering it.</p>
                    <p>The prediction is based on the formula <code>y = ab^x</code> where <code>a</code> will be the
                        case count of present day, <code>b</code> will be the growth factor which now is <b>{avgGF}</b>
                        and <code>x</code> will be the number of day from today for when you want to predict</p>
                    <p>Since this formula can plot only exponential growth, it cannot really find out when the growth
                        stalls and flattens because we are practicing various measures such as Social Distancing,
                        Staying at Home etc. If you would love to learn more, I recommend checking out these videos</p>
                    <ul>
                        <li><a href="https://www.youtube.com/watch?v=Kas0tIxDvrg" target="_blank">3blue1brown -
                                Exponential Growth and Epidemics</a></li>
                        <li><a href="https://www.youtube.com/watch?v=54XLXg4fYsc" target="_blank">MinutePhysics - How to
                                tell if we are beating COVID-19</a></li>
                    </ul>
                    <p class="subtitle">Special thanks</p>
                    <p>This website was made possible due to these following libraries and APIs.</p>
                    <p class="is-size-6">Libraries</p>
                    <ul>
                        <li><a href="https://svelte.dev/" tagret="_blank">Svelte</a> - The whole frontend</li>
                        <li><a href="https://momentjs.com/" tagret="_blank">Moment.js</a> - Handling Dates</li>
                        <li><a href="https://chartjs.org/" tagret="_blank">Chart.js</a> - Drawing charts</li>
                        <li><a href="https://bulma.io/" tagret="_blank">Bulma CSS</a> - Design Framework</li>
                    </ul>
                    <p class="is-size-6">API</p>
                    <ul>
                        <li>
                            <a href="https://github.com/amodm/api-covid19-in" tagret="_blank">COVID-19 API</a> by <a
                                href="https://github.com/amodm/" tagret="_blank">Amod</a>
                        </li>
                    </ul>
                    <p class="subtitle">Good news</p>
                    <p>This website, itself is open source. You can make changes or suggest them at the official Github repository</p>
                    <ul>
                        <li><a href="https://github.com/smartclash/PredCorona" tagret="_blank">PredCorona</a> - Github</li>
                    </ul>
                    <p>You can follow me or contact me through social media. I will link them down too.</p>
                    <ul>
                        <li><a href="https://twitter.com/@xXAlphaManXx" tagret="_blank">Twitter</a></li>
                        <li><a href="https://instagram.com/_xalphamanx_" tagret="_blank">Instagram</a></li>
                    </ul>
                    <p>And also consider checkout out my other website</p>
                    <ul>
                        <li><a href="https://alphaman.me/" tagret="_blank">My Portfolio</a></li>
                        <li><a href="https://blog.alphaman.me/" tagret="_blank">My Blog</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</div>
