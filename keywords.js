document.addEventListener('click', async(event) => {
    const imagesContainer = document.getElementById('imagesContainer');
    if(event.target.id === 'visualize'){
        const videoId = await getVideoIdFromUrl();
        alert('Please wait for a moment.');
        fetch(`/visualize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "videoId": videoId })
        })
        .then(response => response.json())
        .then(data => {
            imagesContainer.innerHTML = '';

            for(const imageName in data){
                const img = document.createElement('img');
                img.src = data[imageName];
                img.alt = imageName;
                imagesContainer.appendChild(img);
            }
        })
        .catch(error => console.error('Error fetching images: ', error));
    }

    if(event.target.id === 'recommendations'){
        const videoId = await getVideoIdFromUrl();
        alert('Button clicked. This might take a few moments.');
        const response = await fetch(`/recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "videoId": videoId })
        });
        const recommendations = await response.json();
        const container = document.getElementById('recommendationsContainer');
        container.innerHTML = '';
        recommendations.forEach(video => {
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = video.thumbnail;
            thumbnailImg.alt = video.title;
            thumbnailImg.title = `Title: ${video.title}\nVideoURL: ${video.video_url}`;
            thumbnailImg.addEventListener('click', () => {
                window.open(video.video_url, '_blank');
            });
            container.appendChild(thumbnailImg);
        });
    }
});

document.querySelectorAll('#imagesContainer img').forEach(img => {
    img.addEventListener('click', function() {
        this.classList.toggle('expanded');
    });
});

async function getVideoIdFromUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('videoId');
}

// Function to attach event listeners to keyword elements
function attachKeywordEventListeners() {
    const tooltip = document.getElementById('tooltip');
    const keywords = document.querySelectorAll('.keyword-box');

    keywords.forEach(keyword => {
        keyword.addEventListener('mouseover', async (e) => {
            const word = e.target.getAttribute('data-keyword');
            const definition = await fetchDefinition(word);

            if (definition) {
                tooltip.innerHTML = `<strong>${word}</strong>: ${definition}`;
                tooltip.style.display = 'block';
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            }
        });

        keyword.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', attachKeywordEventListeners);

async function fetchDefinition(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        if (data && data[0] && data[0].meanings && data[0].meanings[0].definitions[0].definition) {
            return data[0].meanings[0].definitions[0].definition;
        } else {
            return 'Definition not found';
        }
    } catch (error) {
        return 'Error fetching definition';
    }
}
