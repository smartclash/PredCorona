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

    function manipulateData (coronaData) {
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

    function predictDeathsWhenCase(cases) {

    };

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
                        <input type="number" min="5" max="60" class="input" bind:value={predictForDays}>
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
                        <canvas bind:this={theCanvas}></canvas>
                    </div>
                </div>
            </div>
            <div class="column is-6">
                <div class="card is-3by4">
                    <div class="card-content">
                        <canvas bind:this={thePredictCanvas}></canvas>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section style="padding-top: 45px">
        <div class="columns">
            <div class="column is-4">
                <div class="card has-background-danger">
                    <div class="card-content has-text-white">
                        <p class="is-size-4">Predicted total death cases</p>
                        <small>still under development</small>
                    </div>
                </div>
            </div>
            <div class="column is-4">
                <div class="card has-background-primary">
                    <div class="card-content has-text-white">
                        <p class="is-size-4">Predicted total recovered cases</p>
                        <small>still under development</small>
                    </div>
                </div>
            </div>
            <div class="column is-4">
                <div class="card has-background-warning">
                    <div class="card-content">
                        <p class="is-size-4">Predicted total affected cases</p>
                        <small>still under development</small>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
