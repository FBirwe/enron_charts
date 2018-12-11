document.addEventListener("DOMContentLoaded", function(event) {
    setMainWrapper();
    initializeDropdown();

    createForceNetwork();
    
    document.querySelector('#files_dropdown').addEventListener('change', () => {
        clear();

        if( files[ usedFile ].type === 'force-network' ) {
            createForceNetwork();
        } else {
            startTimechart();
        }
    })
});