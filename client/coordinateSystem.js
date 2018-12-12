function renderSpectralCluster() {
    fetch(`/data/${files[usedFile].file}`)
    .then( res => res.json())
    .then( data => {
        createCoordinateSystem( data );
    })
}

function createCoordinateSystem( data ) {
    const persons = getPersonList( data );
    const clusters = getClusters( data );
    const width = 600, height = 600;
    const margin = 10;
    const sizePerPerson = (width - margin * 2) / persons.length;

    const svg = d3.select('#svg_wrapper')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`);

    const colors = ['#332299','#aa0033','#733b3b','#f1aa12','#baf112','#12f185', '#52af66', '#268dbd', '#e33225'];

    // marker
    svg
    .append('rect')
    .attr('x', margin)
    .attr('y', margin)
    .attr('height', sizePerPerson * 2)
    .attr('width', (width - margin * 2))
    .attr('transform', 'translate(0 ,' + sizePerPerson * -1 + ')')
    .attr('fill', '#999')
    .attr('id', 'marker_hor')
    .attr('display', 'none');

    svg
    .append('rect')
    .attr('x', margin)
    .attr('y', margin)
    .attr('height', (width - margin * 2))
    .attr('width', sizePerPerson * 2)
    .attr('transform', 'translate(' + sizePerPerson * -1 + ',0)')
    .attr('fill', '#999')
    .attr('id', 'marker_vert')
    .attr('display', 'none');


    // build SVG
    for(let i = 0; i < persons.length; i++ ) {
        svg
        .append('line')
        .attr('x1', margin + i * sizePerPerson)
        .attr('x2', margin + i * sizePerPerson)
        .attr('y1', margin)
        .attr('y2', height - margin)
        .attr('stroke', '#aaa')
        .attr('stroke-width', 0.25)

        svg
        .append('line')
        .attr('y1', margin + i * sizePerPerson)
        .attr('y2', margin + i * sizePerPerson)
        .attr('x1', margin)
        .attr('x2', height - margin)
        .attr('stroke', '#aaa')
        .attr('stroke-width', 0.25)
    }

    svg
    .selectAll('circle')
    .data( data )
    .enter()
    .append('circle')
    .attr('cx', d => margin + persons.indexOf(d.p1) * sizePerPerson)
    .attr('cy', d => margin + persons.indexOf(d.p2) * sizePerPerson)
    .attr('r', sizePerPerson / 2 )
    .attr('fill', d => colors[d.cluster]);

    // build Table Row
    const table = document.createElement('table');

    for(let i in persons) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');

        td.innerHTML = persons[i];
        td.setAttribute('id', 'person_' + i);

        td.addEventListener('mouseover', ev => {
            console.log(ev.target);
            const index = parseInt( ev.target.getAttribute('id').replace('person_', '') );

            d3.select(`#marker_hor`)
            .attr('y', index * sizePerPerson)
            .attr('display', 'inline');

            d3.select(`#marker_vert`)
            .attr('x', index * sizePerPerson)
            .attr('display', 'inline');

        })

        td.addEventListener('mouseleave', ev => {
            d3.select(`#marker_hor`)
            .attr('display', 'none');

            d3.select(`#marker_vert`)
            .attr('display', 'none');
        })

        tr.appendChild(td);
        table.append(tr);
    }

    document.querySelector('#toolbar .table_wrapper').appendChild(table);

}

function getPersonList( data ) {
    const persons = [];

    for(let i in data) {
        if(!persons.includes(data[i].p1)) {
            persons.push( data[i].p1 );
        }

        if(!persons.includes(data[i].p2)) {
            persons.push( data[i].p2 );
        }
    }

    return persons;
}

function getClusters( data ) {
    const clusters = [];

    for(let i in data) {
        if(!clusters.includes(data[i].cluster)) {
            clusters.push( data[i].cluster );
        }
    }

    return clusters;
}