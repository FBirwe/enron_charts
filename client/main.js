const files = [
    {
        name : "betweeness centrality",
        type : "force-network",
        file : 'betweeness_centrality.json'
    },
    {
        name : "closeness centrality",
        type : "force-network",
        file : 'closeness_centrality.json'
    },
    {
        name : "inbound degree",
        type : "force-network",
        file : 'inbound_degree.json'
    },
    {
        name : "outbound degree",
        type : "force-network",
        file : 'outbound_degree.json'
    },
    {
        name : "eigenvector",
        type : "force-network",
        file : 'eigenvector.json'
    },
    {
        name : "norm eigenvector",
        type : "force-network",
        file : 'norm_eigenvector.json'
    },
    {
        name : "sended map",
        type : "timemap",
        file : 'sendedByDate.json'
    },
    {
        name : "received map",
        type : "timemap",
        file : 'receivedByDate.json'
    }
];

let usedFile = 2;

function initializeDropdown() {
    const dropdown = document.querySelector('#files_dropdown');

    for(let i in files) {
        const option = document.createElement("option");
        option.setAttribute('value', files[i].file);
        option.innerHTML = files[i].name;

        if ( i == usedFile ) {
            option.setAttribute('selected', 'true');
        }

        dropdown.appendChild(option);

        // const option = document.createElement('div');
        // option.setAttribute('data-value', files[i]);
        // option.classList.add('item');
        // option.innerHTML = files[i];

        // console.log(dropdown);

        // dropdown.appendChild( option );
    }

    dropdown.addEventListener('change', () => {
        for(let i = 0; i < files.length; i++) {
            if(files[i].file === dropdown.options[dropdown.selectedIndex].value) {
                usedFile = i;
            }
        }
    })
}

function clear() {
    d3.select('#svg_wrapper svg').remove();
    document.querySelector('#toolbar .table_wrapper').innerHTML = "";
}

function setMainWrapper() {
    const width = window.innerWidth;
    const height = window.innerHeight;


    document.querySelector('#main_wrapper').style.width = `${width}px`;
    document.querySelector('#main_wrapper').style.height = `${height}px`;

    console.log(document.querySelector('#main_wrapper').style.width, width);

}

window.addEventListener("optimizedResize", ev => {
    setMainWrapper();
})

function scrollTo( index ) {
    const showIndex = index - 5 > 0 ? index - 5 : index;

    const el = document.querySelectorAll('#toolbar .table_wrapper table tr')[showIndex];
    el.scrollIntoView(true)
}