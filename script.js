document.addEventListener('DOMContentLoaded', function () {
    const statusContainer = document.getElementById('status-container');
    const filterRadios = document.querySelectorAll('input[name="filter"]');
    const searchBox = document.getElementById('search-box');
    const searchButton = document.getElementById('search-button');
    let currentFilter = 'summary'; // Default filter

    // Function to display a loading message
    function showLoadingMessage() {
        statusContainer.innerHTML = '<div class="col-md-12"><p>Loading...</p></div>';
    }

    // Function to display scheduled maintenance data
    function displayScheduledMaintenances(data) {
        statusContainer.innerHTML = ''; // Clear previous data
        if (data.scheduled_maintenances.length === 0) {
            statusContainer.innerHTML = '<div class="col-md-12"><p>No scheduled maintenances</p></div>';
        } else {
            data.scheduled_maintenances.forEach(maintenance => {
                const card = `
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div class="card-header bg-warning text-white">
                                <h5 class="card-title">${maintenance.name}</h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">Status: ${maintenance.status}</p>
                                ${generateIncidentUpdates(maintenance.incident_updates)}
                            </div>
                        </div>
                    </div>
                `;
                statusContainer.innerHTML += card;
            });
        }
    }

    // Function to display incident data
    function displayIncidents(data) {
        statusContainer.innerHTML = ''; // Clear previous data
        if (data.incidents.length === 0) {
            statusContainer.innerHTML = '<div class="col-md-12"><p>No incidents to be reported</p></div>';
        } else {
            data.incidents.forEach(incident => {
                const card = `
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div class="card-header bg-danger text-white">
                                <h5 class="card-title">${incident.name}</h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">Status: ${incident.status}</p>
                                <p class="card-text">Impact: ${incident.impact}</p>
                                <!-- Add more incident properties as needed -->
                            </div>
                        </div>
                    </div>
                `;
                statusContainer.innerHTML += card;
            });
        }
    }

    // Function to display summary data
    function displaySummary(data) {
        statusContainer.innerHTML = ''; // Clear previous data
        if (data.components.length === 0) {
            statusContainer.innerHTML = '<div class="col-md-12"><p>No data available for servers</p></div>';
        } else {
            data.components.forEach(server => {
                const card = `
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div class="card-header bg-dark text-white">
                                <h5 class="card-title">${server.name}</h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">Status: ${server.status}</p>
                                <p class="card-text">Created At: ${new Date(server.created_at).toLocaleDateString()}</p>
                                <p class="card-text">Updated At: ${new Date(server.updated_at).toLocaleDateString()}</p>
                                <p class="card-text">Position: ${server.position}</p>
                                <p class="card-text">Description: ${server.description || 'N/A'}</p>
                                <p class="card-text">Showcase: ${server.showcase}</p>
                                <p class="card-text">Start Date: ${new Date(server.start_date).toLocaleDateString()}</p>
                                <p class="card-text">Group ID: ${server.group_id}</p>
                                <p class="card-text">Page ID: ${server.page_id}</p>
                                <p class="card-text">Group: ${server.group}</p>
                                <p class="card-text">Only Show If Degraded: ${server.only_show_if_degraded}</p>
                            </div>
                        </div>
                    </div>
                `;
                statusContainer.innerHTML += card;
            });
        }
    }

    // Function to generate incident updates HTML
    function generateIncidentUpdates(updates) {
        let updatesHTML = '';
        updates.forEach(update => {
            updatesHTML += `
                <div class="incident-update">
                    <p class="update-status">Status: ${update.status}</p>
                    <p class="update-body">${update.body}</p>
                    <!-- Add more details about the update as needed -->
                </div>
            `;
        });
        return updatesHTML;
    }

    // Function to fetch scheduled maintenance data
    function fetchScheduledMaintenances() {
        const url = 'https://status.digitalocean.com/api/v2/scheduled-maintenances.json';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch scheduled maintenance data');
                }
                return response.json();
            })
            .then(data => {
                displayScheduledMaintenances(data);
            })
            .catch(error => {
                console.error('Error fetching scheduled maintenance data:', error);
            });
    }

    // Function to fetch incident data
    function fetchIncidentData() {
        const url = 'https://status.digitalocean.com/api/v2/incidents/unresolved.json';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch incident data');
                }
                return response.json();
            })
            .then(data => {
                displayIncidents(data);
            })
            .catch(error => {
                console.error('Error fetching incident data:', error);
            });
    }

    // Function to fetch summary data
    function fetchSummaryData() {
        showLoadingMessage(); // Display loading message
        const url = 'https://status.digitalocean.com/api/v2/summary.json';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch summary data');
                }
                return response.json();
            })
            .then(data => {
                displaySummary(data);
            })
            .catch(error => {
                console.error('Error fetching summary data:', error);
            });
    }

    // Function to handle changes in radio button selection
    filterRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            currentFilter = this.value;
            switch (currentFilter) {
                case 'summary':
                    fetchSummaryData();
                    break;
                case 'incidents':
                    fetchIncidentData();
                    break;
                case 'maintenance':
                    fetchScheduledMaintenances();
                    break;
            }
        });
    });

    // Function to handle search
    function handleSearch() {
        const searchTerm = searchBox.value.trim().toLowerCase();
        switch (currentFilter) {
            case 'summary':
                searchSummaryData(searchTerm);
                break;
            case 'incidents':
                searchIncidentData(searchTerm);
                break;
            case 'maintenance':
                searchMaintenanceData(searchTerm);
                break;
        }
        searchBox.value = ''; // Clear search box
    }

    // Function to search for a term in summary data
    function searchSummaryData(searchTerm) {
        showLoadingMessage(); // Display loading message
        const url = 'https://status.digitalocean.com/api/v2/summary.json';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch summary data');
                }
                return response.json();
            })
            .then(data => {
                const filteredData = data.components.filter(server => {
                    return server.name.toLowerCase().includes(searchTerm);
                });
                displaySummary({ components: filteredData });
            })
            .catch(error => {
                console.error('Error fetching summary data:', error);
            });
    }

    // Function to search for a term in incident data
    function searchIncidentData(searchTerm) {
        showLoadingMessage(); // Display loading message
        const url = 'https://status.digitalocean.com/api/v2/incidents/unresolved.json';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch incident data');
                }
                return response.json();
            })
            .then(data => {
                const filteredData = data.incidents.filter(incident => {
                    return incident.name.toLowerCase().includes(searchTerm);
                });
                displayIncidents({ incidents: filteredData });
            })
            .catch(error => {
                console.error('Error fetching incident data:', error);
            });
    }

    // Function to search for a term in scheduled maintenance data
    function searchMaintenanceData(searchTerm) {
        showLoadingMessage(); // Display loading message
        const url = 'https://status.digitalocean.com/api/v2/scheduled-maintenances.json';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch scheduled maintenance data');
                }
                return response.json();
            })
            .then(data => {
                const filteredData = data.scheduled_maintenances.filter(maintenance => {
                    return maintenance.name.toLowerCase().includes(searchTerm);
                });
                displayScheduledMaintenances({ scheduled_maintenances: filteredData });
            })
            .catch(error => {
                console.error('Error fetching scheduled maintenance data:', error);
            });
    }

    // Add event listener for search button
    searchButton.addEventListener('click', handleSearch);

    // Event listener for Enter key press in the search box
    searchBox.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Fetch summary data by default
    fetchSummaryData();
});