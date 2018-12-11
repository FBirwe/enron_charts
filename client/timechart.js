const mode = "received";

const heightPerPerson = 300;
const fontSize = 15;
const offset = [200, 50];
const BACKGROUND_COLORS = ["#dddddd", "#ffffff"];
const dataPath = mode === 'sended' ? 'sendedByDate.json' : 'receivedByDate.json';
const color = mode === 'sended' ? 'blue' : 'red';
let attributes;
if(mode === 'sended') {
    attributes = {
        person : 'sender',
        week : 'weekOfSending'    
    }
} else {
    attributes = {
        person : 'receiver',
        week : 'weekOfReceiving'    
    }
}

let curYear = 0;
let minYear = 0;
let maxYear = 0;

let timechartData;

function startTimechart() {
    fetch(`/data/${dataPath}`)
    .then(res => res.json())
    .then(data => {

        // createTimechart( data,  );
        minYear = getMinYear( data );
        maxYear = getMaxYear( data ); 
        curYear = parseWeekAndYear(data[0][attributes.week])[0];
        timechartData = data;

        setCurYear();
        showButtons();


        // const clusteredByWeek = clusterByWeek(data);

        // for( let i in clusteredByWeek ) {
        //     console.log(i , clusteredByWeek[i] );
        //     // console.log(i, clusterByPerson( clusteredByWeek[i] ) );
        // }
        
    })
}

function createTimechart( data, year, splitByPerson ) {
    let width = 600, height = 600;

    // getMin
    let min = data[0].countOfMessages;
    for ( let i in data ) {
        if ( data[i].countOfMessages < min ) {
            min = data[i].countOfMessages;
        }
    }

    // getMax
    let max = data[0].countOfMessages;
    for ( let i in data ) {
        if ( data[i].countOfMessages > max ) {
            max = data[i].countOfMessages;
        }
    }



    const pixelPerWeek = width / getNumberOfWeeksOfYear(year);

    const yScale = d3.scaleLinear()
    .domain([0, max])
    .range([0, heightPerPerson]);

    var svg = d3.select('#svg_wrapper')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`);

    const dataToUse = data.filter((val, i) => {
        return parseInt(parseWeekAndYear(val[attributes.week])[0]) === year;
    });

    const dataByPerson = getDataByPersons( dataToUse );

    svg
    .selectAll('rect')
    .data( dataToUse )
    .enter()
    .append('rect')
    .attr('x', d => {
        week = parseInt(parseWeekAndYear(d[attributes.week])[1]);

        return pixelPerWeek * (week - 1);
    })
    .attr('y', d => heightPerPerson / 2 - yScale(d.countOfMessages) / 2)
    .attr('width', pixelPerWeek)
    .attr('height', d => yScale(d.countOfMessages))
    .attr('fill', 'red');
}

function showButtons() {
    document.querySelector('#button_wrapper').style.display = 'block';
    document.querySelector('#year_view').innerHTML = curYear;
}

function getMinYear( data ) {
    let min = parseInt( parseWeekAndYear( data[0][attributes.week] )[0] );

    for( let i in data ) {
        if( parseInt( parseWeekAndYear( data[i][attributes.week] )[0] ) < min ) {
            min = parseInt( parseWeekAndYear( data[i][attributes.week] )[0] );
        }
    }

    return min;
}

function getMaxYear( data ) {
    let max = parseInt( parseWeekAndYear( data[0][attributes.week] )[0] );

    for( let i in data ) {
        if( parseInt( parseWeekAndYear( data[i][attributes.week] )[0] ) > max ) {
            max = parseInt( parseWeekAndYear( data[i][attributes.week] )[0] );
        }
    }

    return max;
}

function setCurYear( year ) {
    const prev_button = document.querySelector('#prev_button');
    const next_button = document.querySelector('#next_button');
    const year_view = document.querySelector('#year_view');

    if( year <= maxYear && year >= minYear ) {
        curYear = year;
    }

    if( year === maxYear ) {
        next_button.classList.add("disabled");
    } else {
        next_button.classList.remove("disabled");
    }

    if( year === minYear ) {
        prev_button.classList.add("disabled");
    } else {
        prev_button.classList.remove("disabled");
    }

    year_view.innerHTML = curYear;

    console.log(curYear, year, minYear, maxYear);

    clear();
    createTimechart( timechartData, curYear );

}

document.addEventListener('DOMContentLoaded', ev => {
    const prev_button = document.querySelector('#prev_button');
    const next_button = document.querySelector('#next_button');


    prev_button.addEventListener('click', ev => {
        setCurYear( curYear - 1 );
    })

    next_button.addEventListener('click', ev => {
        setCurYear( curYear + 1 );
    })
});

// document.addEventListener("DOMContentLoaded", function(event) {
//     const promises = [
//         fetchData(),
//         fetchMin(),
//         fetchMax()
//     ];

//     let data = [];
//     let minMax = [];
    
//     Promise.all(promises)
//     .then(fetchedData => {
//         data = fetchedData[0];
//         minMax = [ fetchedData[1], fetchedData[2] ]
        
//         const weekRange = getWeekRange(minMax);
//         const persons = getPersons(data);
//         const yScale = d3.scaleLinear()
//         .domain([0, getDataMax(data)])
//         .range([0, heightPerPerson]);

//         // sort Data by Persons
//         const dataByPersons = getDataByPersons(data);

//         console.log( weekRange );

//         const svg = d3.select('body')
//         .append('svg')
//         .attr('width', pixelPerWeek * weekRange + offset[0])
//         .attr('height', heightPerPerson * persons.length + offset[1])
//         .attr('viewBox', `0 0 ${pixelPerWeek * weekRange + offset[0]} ${heightPerPerson * persons.length + offset[1]}`)

//         // add columns
//         let prev = 0;
//         let cl1 = true;

//         for(let i = parseWeekAndYear(minMax[0])[0]; i <= parseWeekAndYear(minMax[1])[0]; i++) {
//             svg
//             .append('rect')
//             .attr('x', offset[0] + prev)
//             .attr('y', offset[1])
//             .attr('width', getNumberOfWeeksOfYear(i) * pixelPerWeek)
//             .attr('height', heightPerPerson * persons.length)
//             .attr('fill', cl1 ? BACKGROUND_COLORS[0] : BACKGROUND_COLORS[1])

//             svg
//             .append('text')
//             .text(i)
//             .attr('x', offset[0] + prev + (getNumberOfWeeksOfYear(i) * pixelPerWeek) / 2)
//             .attr('y', (offset[1] + fontSize)/2)
//             .attr('text-align', 'center')
//             .attr('font-size', fontSize)
//             .attr('font-family', 'Calibri')

//             prev += getNumberOfWeeksOfYear(i) * pixelPerWeek;
//             cl1 = !cl1;
//         }

//         // add rows
//         svg
//         .selectAll('g')
//         .data(persons)
//         .enter()
//         .append('g')
//         .attr('transform', (d, i) => `translate(0 ${i * heightPerPerson  + offset[1]})`)

//         // add Persons
//         svg
//         .selectAll('g')
//         .append('text')
//         .attr('y', heightPerPerson/2 + fontSize/2)
//         .text((d, i) => d)
//         .attr('text-align', 'center')
//         .attr('font-size', fontSize)
//         .attr('font-family', 'Calibri')

//         svg.selectAll('g')
//         .append('line')
//         .attr('x1', offset[0])
//         .attr('x2', pixelPerWeek * weekRange + offset[0])
//         .attr('y1', heightPerPerson/2)
//         .attr('y2', heightPerPerson/2)
//         .style('stroke', 'black')
//         .style('stroke-width', 1)

//         // draw Plots
//         svg.selectAll('g')
//         .each(function (d, i) {
//             console.log(d,i);

//             const maxYear = parseWeekAndYear(minMax[1])[0];
//             let year = parseWeekAndYear(minMax[0])[0];
//             let week = 0;
//             let pos = 0;
//             let counter = 0

//             while(year <= maxYear && counter < dataByPersons[d].length) {
//                 const weekParsed = parseWeekAndYear(dataByPersons[d][counter][attributes.week]);

//                 if(weekParsed[0] === year && weekParsed[1] === week) {
//                     const data_row = dataByPersons[d][counter];

//                     let height = yScale(data_row.countOfMessages);
//                     if(height < 2) {
//                         height = 5;
//                     }

//                     d3.select(this)
//                     .append('rect')
//                     .attr('x', offset[0] + pos * pixelPerWeek )
//                     .attr('y', (heightPerPerson - height) / 2)
//                     .attr('width', pixelPerWeek)
//                     .attr('height', height)
//                     .style('fill', color)

//                     counter++;
//                 }

//                 week++;

//                 if(week > getNumberOfWeeksOfYear(year)) {
//                     year++;
//                     week = 0;
//                 }

//                 pos++;

//             }
//         })

        
//         // <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
//     })
// });

function clusterByWeek( data ) {
    const out = {};

    for( let i in data ) {
        if ( out[data[i][attributes.week]] === undefined ) {
            out[data[i][attributes.week]] = [];
        }

        out[data[i][attributes.week]].push(data[i]);
    }

    return out;
}

function clusterByPerson( data ) {
    const out = {};

    for( let i in data ) {
        if ( out[data[i][attributes.person]] === undefined ) {
            out[data[i][attributes.person]] = [];
        }

        out[data[i][attributes.person]].push(data[i]);
    }
    
    return out;
}

function getDataByPersons( data ) {
    const out = {};

    for( let i in data ) {
        if( out[data[i][attributes.person]] === undefined ) {
            out[data[i][attributes.person]] = [];
        }

        out[data[i][attributes.person]].push(data[i]);
    }

    return out;
}

function getDataMax( data ) {
    let max = data[0].countOfMessages;

    for(let i in data) {
        if(data[i].countOfMessages > max) {
            max = data[i].countOfMessages;
        }
    }

    return max;
}

function fetchData() {
    return new Promise((res, rej) => {
        fetch(dataPath)
        .then(resp => resp.json())
        .then(data => res(data))
        .catch(err => rej(err));
    });
}

function fetchMin() {
    return new Promise((res, rej) => {
        fetch('/minDate')
        .then(resp => resp.text())
        .then(data => res(data))
        .catch(err => rej(err));
    });
}

function fetchMax() {
    return new Promise((res, rej) => {
        fetch('/maxDate')
        .then(resp => resp.text())
        .then(data => res(data))
        .catch(err => rej(err));
    });
}

function getPersons( data ) {
    const persons = {};

    for(let i in data) {
        if(persons[data[i][attributes.person]] === undefined) {
            persons[data[i][attributes.person]] = true;
        }
    }

    const out = [];

    for(let i in persons) {
        out.push(i);
    }

    return out;
} 

function getWeekRange(minMax) {
    let minYear = parseWeekAndYear(minMax[0])[0];
    let maxYear = parseWeekAndYear(minMax[1])[0];

    let sumWeeks = 0;

    for (let i = minYear; i <= maxYear; i++) {
        sumWeeks += getNumberOfWeeksOfYear(i);
    }

    // sumWeeks += maxWeek;
    // sumWeeks -= minWeek;

    return sumWeeks;
}

function getNumberOfWeeksOfYear(year) {
    // US-Version
    // Die erste und die letzte Kalenderwoche eines Jahres müssen nicht vollständig sein, das heißt, sie können weniger als sieben Tage enthalten
    // Jedes Jahr, das kein Schaltjahr ist oder dessen 31. Dezember kein Sonntag ist, hat 53 Kalenderwochen
    // Falls der 31. Dezember eines Schaltjahres ein Sonntag ist, so liegt dieser Sonntag als einziger Tag in der 54. Kalenderwoche (dieser Fall tritt relativ selten ein: zuletzt im Jahr 2000, das nächste Mal 2028).

    if( !isLeapYear(year) || new Date(year, 11, 31).getDay() !== 0) {
        return 53;
    } else if( isLeapYear(year) && new Date(year, 11, 31).getDay() === 0 ) {
        return 54;
    } else {
        return 52;
    }
}

function isLeapYear(year) {
    let is = false;

    if(year%4 === 0) is = true;
    if(year%100 === 0) is = false;
    if(year%400 === 0) is = true;

    return is;
}

function parseWeekAndYear( input ) {
    let splitted = input.split('/');

    for(let i in splitted) {
        splitted[i] = parseInt(splitted[i]);
    }

    return splitted;
}