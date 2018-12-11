const fs = require('fs');
const path = require('path');
const constants = require('./modules/constants');

getMostImportantPersons();

function writeClientFiles() {
    generateJSON( constants.FILES.CONNECTIONS_FILE )
    .then( data => {
    
        generateClientFile(data, constants.FILES.BETWEENESS_CENTRALITY_FILE, data => {
            fs.writeFile( path.join( constants.FILES.CLIENT_DATA_DIR, "betweeness_centrality.json"), JSON.stringify(data), err => err ? console.log(err) : console.log("file written!"));
        })
    
        generateClientFile(data, constants.FILES.INBOUND_DEGREE_FILE, data => {
            fs.writeFile( path.join( constants.FILES.CLIENT_DATA_DIR, "inbound_degree.json"), JSON.stringify(data), err => err ? console.log(err) : console.log("file written!"));
        })
    
        generateClientFile(data, constants.FILES.OUTBOUND_DEGREE_FILE, data => {
            fs.writeFile( path.join( constants.FILES.CLIENT_DATA_DIR, "outbound_degree.json"), JSON.stringify(data), err => err ? console.log(err) : console.log("file written!"));
        })
    
        generateClientFile(data, constants.FILES.CLOSENESS_CENTRALITY_FILE, data => {
            fs.writeFile( path.join( constants.FILES.CLIENT_DATA_DIR, "closeness_centrality.json"), JSON.stringify(data), err => err ? console.log(err) : console.log("file written!"));
        })
    
        generateClientFile(data, constants.FILES.NORM_EIGENVECTOR_FILE, data => {
            fs.writeFile( path.join( constants.FILES.CLIENT_DATA_DIR, "norm_eigenvector.json"), JSON.stringify(data), err => err ? console.log(err) : console.log("file written!"));
        })
    
        generateClientFile(data, constants.FILES.EIGENVECTOR_FILE, data => {
            fs.writeFile( path.join( constants.FILES.CLIENT_DATA_DIR, "eigenvector.json"), JSON.stringify(data), err => err ? console.log(err) : console.log("file written!"));
        })
    })
}


function generateJSON( inputPath ) {
    return new Promise( (res, rej) => {
        fs.readFile(inputPath, { encoding : 'utf8' }, (err, data) => {
            if( err ) {
                rej( err );
            } else {
                data = data.split('\n');

                const isConnections = data[0].match(/From: (.+) TO: (.+) Weight: (.+)/) !== null;
                
                // connections
                if( isConnections ) {
                    // From: rosalee.fleming@enron.com TO: sally.beck@enron.com Weight: 14
                    const nodes = [];
                    const edges = [];

                    for(let i in data) {
                        const row = data[i].match(/From: (.+) TO: (.+) Weight: (.+)/);

                        if(row !== null && parseFloat(row[3]) > 0 ) {
                            if( !includes(nodes, el => el.name === row[1]) ) {
                                nodes.push( {
                                    name : row[1]
                                } );
                            }
    
                            if( !includes(nodes, el => el.name === row[2]) ) {
                                nodes.push( {
                                    name : row[2]
                                } );                            }
    
                            edges.push({
                                source : indexOf(nodes, el => el.name === row[1]),
                                target : indexOf(nodes, el => el.name === row[2]),
                                weight : parseFloat(row[3])
                            });
                        }
                    }

                    res({
                        nodes,
                        edges
                    });
                } else {
                    const nodes = [];

                    for( let i in data ) {
                        // Employee: k..allen@enron.com Betweenness: 136,62
                        const row = data[i].match(/Employee: (.+) (.+): (.+)/);

                        if(row !== null ) {
                            nodes.push({
                                name : row[1],
                                [row[2].trim().toLowerCase()] : parseFloat(row[3].replace(',','.'))
                            });                         
                        }
                    }

                    res(nodes);
                }
            }
        });
    });
} 

function generateClientFile( data, inputFile, callback) {
    generateJSON( inputFile )
    .then( betweeness_data => {
    
        for(let i in betweeness_data) {
            const data_row_index = indexOf( data.nodes, el => {
                return el.name === betweeness_data[i].name;
            });
    
            if( data_row_index !== -1 ) {
                const data_row = data.nodes[data_row_index];
                for(let j in Object.keys(betweeness_data[i])) {
                    if(Object.keys(betweeness_data[i])[j] !== 'name') {
                        data_row.value = betweeness_data[i][[Object.keys(betweeness_data[i])[j]]]
                    }
                }
            } else {
                const data_row = {};
                
                for(let j in Object.keys(betweeness_data[i])) {
                    if(Object.keys(betweeness_data[i])[j] !== 'name') {
                        data_row.value = betweeness_data[i][[Object.keys(betweeness_data[i])[j]]]
                    } else {
                        data_row.name = betweeness_data[i][[Object.keys(betweeness_data[i])[j]]]
                    }
                }
    
                data.nodes.push(data_row);
            }
    
    
        }

        if( callback !== undefined && typeof callback === 'function') {
            callback(data);
        }    
    })
}


function getMostImportantPersons() {
    const promises = [
        generateJSON( constants.FILES.BETWEENESS_CENTRALITY_FILE ),
        generateJSON( constants.FILES.INBOUND_DEGREE_FILE ),
        generateJSON( constants.FILES.OUTBOUND_DEGREE_FILE ),
        generateJSON( constants.FILES.CLOSENESS_CENTRALITY_FILE ),
        generateJSON( constants.FILES.EIGENVECTOR_FILE ),
        generateJSON( constants.FILES.NORM_EIGENVECTOR_FILE ),
    ]
    
    Promise.all( promises )
    .then( data => {
        const topFive = {};
        const betweeness = [];
    
        for(let i in data) {
            for( let j = 0; j <= 5 && j < data[i].length; j++ ) {
                if(i == 0) {
                    betweeness.push(data[i][j].name);
                }
    
                if(topFive[ data[i][j].name ] === undefined) {
                    topFive[ data[i][j].name ] = 1;
                } else {
                    topFive[ data[i][j].name ]++;
                }
            }
        }
    
        const out = [];
    
        for(let i in topFive) {
            if ( topFive[i] > 1 || betweeness.includes(i) ) {
                out.push( i );
            } 
        }
    
        for(let i in out) {
            console.log(out[i]);
        }
        console.log(`${out.length} persons`);
    })
}


function includes( arr, callback ) {
    for( let i in arr ) {
        if( callback(arr[i]) === true) {
            return true;
        }
    }

    return false;
}

function indexOf( arr, callback ) {
    for( let i = 0; i < arr.length; i++ ) {
        if( callback(arr[i]) === true) {
            return i;
        }
    }

    return -1;
}