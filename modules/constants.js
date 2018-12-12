const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'client');
const DATA_DIR = path.join(__dirname,'..', 'data');
const DEGREE_DIR = path.join( DATA_DIR, "centrality" );
const DEGREE_JSON_DIR = path.join( DATA_DIR, "centrality_json" );
const ALL_MESSAGES = 2064442;
const MESSAGE_STEP = 500000;
const BOUNDING_YEARS = [1999, 2002]

module.exports.ALL_MESSAGES = ALL_MESSAGES;
module.exports.MESSAGE_STEP = MESSAGE_STEP;

module.exports.FILES = {
    CLIENT_DIR,
    CLIENT_DATA_DIR : path.join( CLIENT_DIR, "data"),
    DATA_DIR,
    DEGREE_DIR,
    PERSONS_FILE : path.join( DATA_DIR, 'java_persons.json'),
    SPECTRAL_CLUSTER_FILE : path.join( DATA_DIR, 'spectralCluster.csv'),
    CONNECTIONS_FILE : path.join( DEGREE_DIR, 'connections.txt'),
    INBOUND_DEGREE_FILE : path.join( DEGREE_DIR, 'inbound_degree.txt' ),
    OUTBOUND_DEGREE_FILE : path.join( DEGREE_DIR, 'outbound_degree.txt' ),
    BETWEENESS_CENTRALITY_FILE : path.join( DEGREE_DIR, 'betweeness_centrality.txt'),
    CLOSENESS_CENTRALITY_FILE : path.join( DEGREE_DIR, 'closeness_centrality.txt'),
    EIGENVECTOR_FILE : path.join( DEGREE_DIR, 'eigenvector.txt'),
    NORM_EIGENVECTOR_FILE : path.join( DEGREE_DIR, 'norm_eigenvector.txt'),
    EMPLOYEES_FILE : path.join(DATA_DIR, 'empoyees.json'),
    NETWORK_FILE : path.join(DATA_DIR, "network.json"),
    JAVA_NETWORK : path.join(DATA_DIR, 'java_network.json'),
    JAVA_PERSONS : path.join(DATA_DIR, 'java_persons.json'),
    RECEIVED_BY_DATE : path.join(DATA_DIR, 'receivedByDate.json'), 
    SENDED_BY_DATE : path.join(DATA_DIR, 'sendedByDate.json') 
}

module.exports.SQL = {
    SELECT_ALL_EMPLOYEES : "SELECT * FROM employee",
    SELECT_LIMITED_MESSAGES : lowerBound => `SELECT message.sender, recipientinfo.rvalue AS receiver FROM message INNER JOIN recipientinfo ON message.mid = recipientinfo.mid LIMIT ${lowerBound},${lowerBound + MESSAGE_STEP > ALL_MESSAGES ? ALL_MESSAGES - lowerBound : MESSAGE_STEP}`,
    SELECT_BY_DATE_AND_REICEIVER : `SELECT recipientinfo.rvalue AS receiver, CONCAT(YEAR(CAST(message.date AS DATE)), '/', WEEK(CAST(message.date AS DATE))) AS weekOfReceiving, count(recipientinfo.rvalue) AS countOfMessages 
    FROM message INNER JOIN recipientinfo ON message.mid = recipientinfo.mid 
    WHERE recipientinfo.rvalue IN (SELECT Email_id FROM employee) AND year(message.date) >= ${BOUNDING_YEARS[0]} AND year(message.date) <= ${BOUNDING_YEARS[1]} 
    GROUP BY receiver, weekOfReceiving 
    ORDER BY weekOfReceiving`,
    SELECT_BY_DATE_AND_SENDER : `SELECT message.sender, CONCAT(YEAR(CAST(message.date AS DATE)), '/', WEEK(CAST(message.date AS DATE))) AS weekOfSending, count(recipientinfo.rvalue) AS countOfMessages 
    FROM message INNER JOIN recipientinfo ON message.mid = recipientinfo.mid 
    WHERE message.sender IN (SELECT Email_id FROM employee) AND year(message.date) >= ${BOUNDING_YEARS[0]} AND year(message.date) <= ${BOUNDING_YEARS[1]}
    GROUP BY message.sender, weekOfSending 
    ORDER BY weekOfSending`,
    SELECT_MESSAGES_GROUPED_BY_YEARS : `SELECT count(*), year(message.date) AS yearOfReceiving, count(recipientinfo.rvalue) AS countOfMessages 
    FROM message INNER JOIN recipientinfo ON message.mid = recipientinfo.mid 
    WHERE recipientinfo.rvalue IN (SELECT Email_id FROM employee) AND year(message.date) >= ${BOUNDING_YEARS[0]} AND year(message.date) <= ${BOUNDING_YEARS[1]} 
    GROUP BY yearOfReceiving 
    ORDER BY yearOfReceiving`
}



// SELECT message.sender, CAST(message.date AS DATE), count(message.sender) FROM message INNER JOIN recipientinfo ON message.mid = recipientinfo.mid GROUP BY message.sender, CAST(message.date AS DATE) ORDER BY message.sender