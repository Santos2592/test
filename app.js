// Function to handle the Fetch request and display location information
function fetchLocationInfo(locationId) {
    fetch(`https://rickandmortyapi.com/api/location/${locationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No data found for the entered ID.');
            }
            return response.json();
        })
        .then(data => {
            // Check if the response contains valid data
            if (!data || !data.name || !data.residents) {
                throw new Error('No valid data found for the entered ID.');
            }

            // Change background color based on location ID
            if (locationId < 50) {
                $("body").css("background-color", "green");
            } else if (locationId >= 50 && locationId < 80) {
                $("body").css("background-color", "blue");
            } else {
                $("body").css("background-color", "red");
            }

            // Process and display location and residents information
            displayLocationInfo(data);
        })
        .catch(error => {
            // Handle the error and display an error message to the user
            console.error(error);
            const errorMessage = `<p class="text-danger">${error.message}</p>`;
            $("#location-info").html(errorMessage);
        });
}

// Function to display location and character information on the page
function displayLocationInfo(locationData) {
    // Get relevant location information
    const locationName = locationData.name;
    const residents = locationData.residents.slice(0, 5); // Take the first 5 residents

    // Create an HTML element to display location information
    const locationInfoHtml = `
        <h2>Location Information</h2>
        <p><strong>Name:</strong> ${locationName}</p>
        <h3>Residents:</h3>
        <ul id="resident-list"></ul>
    `;

    // Add location information to the #location-info element
    $("#location-info").html(locationInfoHtml);

    // Display the names of residents and their additional information
    const residentList = $("#resident-list");
    residents.forEach(residentUrl => {
        fetch(residentUrl)
            .then(response => response.json())
            .then(residentData => {
                // Get relevant resident information
                const residentName = residentData.name;
                const residentStatus = residentData.status;
                const residentSpecies = residentData.species;
                const residentOrigin = residentData.origin.name;
                const residentImage = residentData.image;
                const residentEpisodes = residentData.episode.slice(0, 3); // Take the first 3 episodes

                // Create an HTML element to display resident information
                const residentInfoHtml = `
                    <li>
                        <img src="${residentImage}" alt="${residentName}" class="img-fluid">
                        <p><strong>Name:</strong> ${residentName}</p>
                        <p><strong>Status:</strong> ${residentStatus}</p>
                        <p><strong>Species:</strong> ${residentSpecies}</p>
                        <p><strong>Origin:</strong> ${residentOrigin}</p>
                        <p><strong>Episodes:</strong></p>
                        <ul id="episode-list-${residentName}"></ul>
                    </li>
                `;

                // Add resident information to the resident list
                residentList.append(residentInfoHtml);

                // Display links to resident's episodes
                const episodeList = $(`#episode-list-${residentName}`);
                const episodePromises = residentEpisodes.map(episodeUrl =>
                    fetch(episodeUrl)
                        .then(response => response.json())
                );

                Promise.all(episodePromises)
                    .then(episodeDataList => {
                        // Sort episodes alphabetically by name
                        episodeDataList.sort((a, b) => a.name.localeCompare(b.name));

                        // Display sorted episode links
                        episodeDataList.forEach(episodeData => {
                            const episodeName = episodeData.name;
                            const episodeLink = `<a href="${episodeData.url}" target="_blank">${episodeName}</a>`;
                            const episodeItem = `<li>${episodeLink}</li>`;
                            episodeList.append(episodeItem);
                        });
                    })
                    .catch(error => console.error(error));
            })
            .catch(error => console.error(error));
    });
}

// Add click event handler for character image
$("#location-info").on("click", "img", function () {
    const imageUrl = $(this).attr("src");
    const characterName = $(this).attr("alt");

    // Get character information from nearby HTML elements
    const $characterInfoContainer = $(this).closest("li");
    const characterStatus = $characterInfoContainer.find("p:contains('Status:')").text().replace("Status:", "").trim();
    const characterSpecies = $characterInfoContainer.find("p:contains('Species:')").text().replace("Species:", "").trim();
    const characterOrigin = $characterInfoContainer.find("p:contains('Origin:')").text().replace("Origin:", "").trim();
    const $episodeList = $characterInfoContainer.find("ul");

    // Create modal content
    const modalContent = `
        <div class="modal fade" id="characterModal" tabindex="-1" role="dialog" aria-labelledby="characterModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="characterModalLabel">${characterName}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <img src="${imageUrl}" alt="${characterName}" class="img-fluid">
                        <p><strong>Status:</strong> ${characterStatus}</p>
                        <p><strong>Species:</strong> ${characterSpecies}</p>
                        <p><strong>Origin:</strong> ${characterOrigin}</p>
                        <p><strong>Episodes:</strong></p>
                        <ul>
                            ${$episodeList.html()} <!-- Copy the character's episode list -->
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add the modal to the page body
    $("body").append(modalContent);

    // Show the modal
    $("#characterModal").modal("show");

    // Clean up the modal when it is closed
    $("#characterModal").on("hidden.bs.modal", function () {
        $(this).remove();
    });
});

// Close the modal when clicking the close button
$("body").on("click", ".modal .close", function () {
    $("#characterModal").modal("hide");
});

// Add event handler for the form submission
$("#location-form").submit(function (event) {
    event.preventDefault(); // Prevent form submission

    const locationId = $("#location-id").val();
    fetchLocationInfo(locationId);
});
