<script>
    import { onMount, afterUpdate } from 'svelte';
    import Chart from 'chart.js';
    import coronaData from './mock.json';
    import moment from 'moment';

    let theCanvas;
    let theChart;
    let predictForDays = 5;
    let labels = [], data = [], rawGF = [], rawGFSum = 0, avgGF = 0;

    coronaData.data.forEach(element => {
        labels.push(element.day);
        data.push(element.summary.total);
    });

    for (let i = 0; i <= data.length; i++) {
        if (typeof data[i + 1] !== 'undefined') {
            let calc = data[i + 1] / data[i];
            rawGFSum += calc;
            rawGF.push(calc);
        }
    }

    avgGF = rawGFSum / rawGF.length;

    function returnDatesToPredict(days) {
        let listOfDays = [];
        for(let i = 1; i <= days; i++) {
            listOfDays.push(moment(labels[labels.length]).add(i, 'days'));
        }

        return listOfDays;
    }

    onMount(async () => {
        theChart = new Chart(theCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Present Total Cases',
                        data,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        lineTension: 0.1,
                    },
                ],
            },
            options: {},
        });
    });

    afterUpdate(() => {
        
    });
</script>

<nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="container">
        <div class="navbar-brand">
            <a class="navbar-item title is-size-3" href="https://predcorona.com/">
                PredCorona
            </a>
        </div>
    </div>
</nav>

<div class="container">
    <section style="padding-top: 45px">
        <div class="card is-3by4">
            <div class="card-content">
                <canvas bind:this={theCanvas}></canvas>
            </div>
        </div>
    </section>
    <section style="padding-top: 45px">
        <div class="card">
            <div class="card-content">
                <div class="columns">
                    <div class="column is-8">
                        <span class="title is-size-4">Enter number of days for which you want to predict the corona
                            cases</span>
                    </div>
                    <div class="column is-4">
                        <input type="number" min="5" max="60" class="input" bind:value={predictForDays}>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>