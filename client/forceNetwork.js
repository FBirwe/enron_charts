function createForceNetwork() {
    console.log(`/data/${files[usedFile].file}`)

    fetch(`/data/${files[usedFile].file}`)
    .then(res => res.json())
    .then(data => {
        var width = 600, height = 600
        const { nodes, edges } = data;

        edges.sort((a, b) => b.weight - a.weight);

        const edgeQuantil = new QuantilScale( edges.map(el => el.weight), ['#ccc','#eee'], ['#555','#bbb'], ['#000','#444']);
        const edgeScaleQuantil = new QuantilScale( edges.map(el => el.weight), [0.25, 1], [1, 3], [3, 7]);

        const edgeScale = d3.scaleLinear()
        .domain([edges[ edges.length - 1].weight, edges[0].weight])
        .range(0.25, 5);

        const edgeColor = d3.scaleLinear()
        .domain([edges[ edges.length - 1].weight, edges[0].weight])
        .range('#ddd', '#111');

        nodes.sort((a, b) => b.value - a.value);
        let maxValue = nodes[0].value;
        let minValue = nodes[ nodes.length - 1].value;

        setToolbar( nodes );

        const nodeScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([2, 25]);

        const nodeColor = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range(['#332299', '#aa0033'])

        const nodeColorQuantil = new QuantilScale( nodes.map(el => el.value), ['#332299','#aa0033'],['#733b3b','#f1aa12'],['#baf112','#12f185']);

        var svg = d3.select('#svg_wrapper')
        .append('svg')
        // .attr('width', width)
        // .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
        var forceCollide = d3.forceCollide()
        .radius(d => {
            const extraOffset = 1;

            if( d.value < minValue ) {
                return 5 + extraOffset;
            } else {
                return nodeScale(d.value) + extraOffset;
            }
        })
        .iterations(1);

        var simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', forceCollide)
        .force("link", d3.forceLink().links(edges))
        // .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(20))
        .on('tick', ticked);
    
        var l = svg
        .selectAll('line')
        .data(edges)
        .enter()
        .append('line')
        .attr('stroke', d => {
            return edgeQuantil.getValue(d.weight);
        } )
        .attr('stroke-width', (d) => {
            // return edgeScale(d.weight)   
            return edgeScaleQuantil.getValue(d.weight);
        } )
    
        var u = svg
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('id', (d, i) => `node_${i}`)
        .attr('r', d => {
            if( d.value < minValue ) {
                return 5;
            } else {
                return nodeScale(d.value);
            }
        })
        .attr('fill', d => nodeColorQuantil.getValue(d.value))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .on('mouseover', (d, i) => {
            scrollTo(i);
            highlightDatapoint( i );
        })
        .on('mouseout', (d, i) => {
            dehighlightDatapoint( i );
        });

        var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);	
	
        //same as using .call on the node variable as in https://bl.ocks.org/mbostock/4062045 
        drag_handler(u)

        //drag handler
        //d is the node 
        function drag_start(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3	).restart();
        d.fx = d.x;
        d.fy = d.y;
        }

        function drag_drag(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        }


        function drag_end(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        // d.fx = null;
        // d.fy = null;
        }

        function ticked() {
            u.merge(u)
            .attr('cx', function(d) {
            return d.x
            })
            .attr('cy', function(d) {
            return d.y
              })
    
            l
            .attr('x1', d => {
                return d.source.x
            })
            .attr('y1', d => {
                return d.source.y
            })
            .attr('x2', d => {
                return d.target.x
            })
            .attr('y2', d => {
                return d.target.y
            })
    
            // <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
    
    
            l.exit().remove();
            u.exit().remove();
        }
    })
}

function setToolbar( data ) {
    const table = document.createElement("table");

    for(let i = 0; i < data.length; i++ ) {
        const tr = document.createElement('tr');

        if( i%2 === 0 ) {
            tr.classList.add("even");
        } else {
            tr.classList.add("odd");
        }

        const name_td = document.createElement("td");
        name_td.innerHTML = data[i].name;
        tr.appendChild(name_td);

        const value_td = document.createElement("td");
        value_td.innerHTML = data[i].value;
        tr.appendChild(value_td);

        table.appendChild(tr);

        tr.onmouseover = () => {
            highlightDatapoint( i );
        }

        tr.onmouseleave = () => {
            dehighlightDatapoint( i );
        }
    }

    document.querySelector('#toolbar .table_wrapper').appendChild(table);
}

function highlightDatapoint( i ) {
    document.getElementById(`node_${i}`).classList.add("highlighted");
    document.querySelectorAll('#toolbar tr')[i].classList.add("highlighted");
}

function dehighlightDatapoint( i ) {
    document.getElementById(`node_${i}`).classList.remove("highlighted");
    document.querySelectorAll('#toolbar tr')[i].classList.remove("highlighted");
}

class QuantilScale {

    constructor( data, ...range ) {
        data.sort();
        this.data = [];

        for(let i in data) {
            if( !this.data.includes(data[i]) ) {
                this.data.push( data[i] );
            }
        }

        this.data.sort((a, b) => {
            return a - b
        });


        this.numberOfQuantils = range.length;
        this.elementsPerQuantil = Math.round(this.data.length / this.numberOfQuantils);
        this.limits = [];
        

        for( let i = 1; i <= this.numberOfQuantils; i++ ) {
            if( i < this.numberOfQuantils ) {
                this.limits.push(this.data[ this.elementsPerQuantil * i ]);
            } else {
                this.limits.push(this.data[ this.data.length - 1])
            }
        }
    
        this.quantils = [];
        let lowerBound = 0;

        for(let i = 0; i < this.numberOfQuantils; i++) {
            this.quantils.push(
                d3.scaleLinear()
                .domain([ lowerBound, this.limits[i] ])
                .range( range[i] )
            )
            
            lowerBound = this.limits[i] + 1;
        }
    }

    getQuantil( value ) {
        let i = 0;

        while( value > this.limits[i] && i < this.limits.length - 1 ) {
            i++;
        }

        return i;
    }

    getValue( value ) {
        const quantil = this.getQuantil( value );

        return this.quantils[quantil](value);
    }
    
}