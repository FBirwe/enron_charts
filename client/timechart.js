const heightPerPerson = 300;
const fontSize = 15;
const offset = [200, 50];
const BACKGROUND_COLORS = ["#dddddd", "#ffffff"];

let curYear = 0;
let minYear = 0;
let maxYear = 0;

let timechartData;
let attributes = {
    person : 'sender',
    week : 'weekOfSending'    
}
let color = '#332299';

function startTimechart() {
    let mode = 'received';
    
    if( files[usedFile].file === 'sendedByDate.json' ) {
        mode = 'sended';
    }

    color = mode === 'sended' ? '#332299' : '#f1aa12';

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

    fetch(`/data/${files[usedFile].file}`)
    .then(res => res.json())
    .then(data => {

        minYear = getMinYear( data );
        maxYear = getMaxYear( data ); 
        curYear = parseWeekAndYear(data[0][attributes.week])[0];
        timechartData = data;

        setCurYear();
        showButtons();
        
    })
}

function createTimechart( data, year, splitByPerson ) {
    let width = 600, height = 600;

    const dataToUse = {};

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

    // get common
    dataToUse.common = getCommon( data, min, max );

    if( splitByPerson ) {
        const clusteredByPerson = clusterByPerson( data );

        for( let i in clusteredByPerson ) {
            dataToUse[i] = clusteredByPerson[i];
        }
    }



    const pixelPerWeek = width / getNumberOfWeeksOfYear(year);

    const yScale = d3.scaleLinear()
    .domain([0, max])
    .range([0, heightPerPerson]);

    var svg = d3.select('#svg_wrapper')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`);

    const wrapper_group = svg
    .append('g')
    .attr('id', 'wrapper_group')
    .attr('transform', 'translate(0,0)');

    const table = document.createElement('table');
    document.querySelector('#toolbar .table_wrapper').appendChild(table);

    let count = 0;
    for( let i in dataToUse ) {
        const id = i.replace(/\./g,'').replace('@','AT')

        // add to table
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('id',`td_${count}`);
        td.set
        td.innerHTML = i;
        td.addEventListener('click', ev => {
            const index = parseInt( td.getAttribute('id').replace('td_', '') );

            wrapper_group
            .attr('transform', `translate(0,${ index * heightPerPerson * -1 })`);
        })
        tr.appendChild(td);
        table.appendChild(tr);

        d3.select('#table_wrapper table')
        .append()

        const yOffset = heightPerPerson * count;

        const g = wrapper_group
        .append('g')
        .attr('transform', `translate(0,${ yOffset })`)
        .attr('id', `group_${id}`);

        const dataOfYear = dataToUse[i].filter(val => {
            return parseInt(parseWeekAndYear(val[attributes.week])[0]) === year;
        });
    
        g
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', heightPerPerson / 2)
        .attr('y2', heightPerPerson / 2)
        .attr('stroke', '#555')
        .attr('stroke-width', 0.5)
    
        g
        .selectAll('rect')
        .data( dataOfYear )
        .enter()
        .append('rect')
        .attr('x', d => {
            week = parseInt(parseWeekAndYear(d[attributes.week])[1]);
    
            return pixelPerWeek * (week - 1);
        })
        .attr('y', d => {
            if( yScale(d.countOfMessages) < 2 && yScale(d.countOfMessages) > 0 ) {
                return heightPerPerson / 2 - 2;
            } else {
                return heightPerPerson / 2 - yScale(d.countOfMessages) / 2;
            }
        })
        .attr('width', pixelPerWeek)
        .attr('height', d => {
            if( yScale(d.countOfMessages) < 2 && yScale(d.countOfMessages) > 0 ) {
                return 2;
            } else {
                return yScale(d.countOfMessages);
            }
        })
        .attr('fill', color );
    
        g
        .append('text')
        .attr('x', 5)
        .attr('y', heightPerPerson * 0.65 )
        .style('font-family', 'Roboto')
        .style('font-size', 12)
        .text(i)

        count++;
    }
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

    clear();
    createTimechart( timechartData, curYear, true );

}

function getCommon( data, min, max ) {
    const clusteredByWeek = clusterByWeek( data );
    const common = [];
    for( let i in clusteredByWeek ) {
        const nextEl = {
            sender : 'common',
            [attributes.week] : i,
            countOfMessages : 0
        }

        for( let j in clusteredByWeek[i] ) {
            nextEl.countOfMessages += clusteredByWeek[i][j].countOfMessages;
        }

        common.push(nextEl);
    }

    // getMinMax
    let dataMax = common[0].countOfMessages;
    let dataMin = common[0].countOfMessages;

    for( let i in common) {
        if(common[i].countOfMessages > dataMax) {
            dataMax = common[i].countOfMessages;
        }

        if(common[i].countOfMessages < dataMin) {
            dataMin = common[i].countOfMessages;
        }
    }

    const scale = 1 / ( dataMax - dataMin ) * ( max - min );

    for(let i in common ) {
        common[i].countOfMessages *= scale;
    }

    return common;

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