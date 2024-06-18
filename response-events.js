document.addEventListener('click', async(event) => {

    if (event.target.id === 'updateSummaryBtn') {
        const editableSummary = document.getElementById('editableSummary');
        const updatedSummary = editableSummary.innerHTML;
        const videoId = await getVideoIdFromUrl();
        await updateSummaryinmongo(videoId,updatedSummary);
    }

    if(event.target.id === 'playAudioBtn'){
        var audio = document.getElementById("audioPlayer");
        audio.play();
    }

    if(event.target.id === 'notes'){
        const videoId = await getVideoIdFromUrl();
        const notesWindow = window.open(`/notes?videoId=${videoId}`,'_blank'); 
    }

    if(event.target.id === 'calculateAccuracyBtn'){
        const videoId = await getVideoIdFromUrl();
        try {
            const response = await fetch(`/accuracy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "videoId": videoId })
            });
            
            if (!response.ok) {
                throw new Error('Failed to calculate accuracy');
            }

            const data = await response.json();
            const accuracy = data.overlapPercentage;

            const accuracyElement = document.getElementById('Accuracy');
            accuracyElement.textContent = `           ${accuracy}`;
        } catch (error) {
            console.error('Error calculating accuracy:', error);
            alert('Failed to calculate accuracy. Please try again.');
        }
    }

    if(event.target.id === 'download'){
        const videoId = await getVideoIdFromUrl();
        const transcript = document.getElementById('editableTranscript').innerHTML;
        const summary = document.getElementById('editableSummary').innerHTML;

        const data = new Blob([transcript+'\n\nSummary:\n'+summary], {type: 'text/plain'});

        const url = window.URL.createObjectURL(data);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${videoId}.txt`;
        link.click();

        window.URL.revokeObjectURL(url);
    }

    if(event.target.id === 'keywords'){
        const videoId = await getVideoIdFromUrl();
        const summary = document.getElementById('editableSummary').innerHTML;

        try{
            const response = await fetch('/keyword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"videoId": videoId, "summary": summary})
            })
    
            const html = await response.text();

            const newWindow = window.open(`/keyword?videoId=${videoId}`, '_blank');
            if (!newWindow) {
                throw new Error('Failed to open new window');
            }
            newWindow.onload = function() {
                newWindow.document.body.innerHTML = html;
            };
        }
        catch(error){
            console.error('Error: ',error);
        }
    }

    if(event.target.id === 'translate'){
        const summary = document.getElementById('editableSummary').innerHTML;
        const language = document.getElementById('language').value;

        try{
            const response = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"summary": summary, "language": language})
            })

            const container = document.getElementById('translationContainer');

            const translation = await response.json();
            console.log(translation);
            container.innerHTML = `${translation}`;
        }
        catch(error){
            console.error('Error: ',error);
        }
    }

    if(event.target.id === 'search'){
        const searchInput = document.getElementById('searchInput').value;
        const editableSummary = document.getElementById('editableSummary').innerHTML;
        setTimeout(() => {
            removeHighlights();
        }, 2000);
        highlightOccurrences(editableSummary, searchInput);
    }

    if(event.target.id === 'highlightText'){
        highlightText();
    }

    if(event.target.id === 'removeHighlightText'){
        removeHighlightedText();
    }

    const url = window.location.href;
    const state = { title: document.title, url: url };
    window.history.replaceState(state, document.title, url);

    window.onload = loadHighlights;
});

async function updateSummaryinmongo(videoId, updatedSummary) {
    try {
        const response = await fetch(`/updateSummary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "videoId": videoId, "updatedSummary": updatedSummary })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update summary in MongoDB');
        }

        alert('Summary Updated.');
    } catch (error) {
        console.error('Error updating summary in MongoDB:', error);
    }
}

function getVideoIdFromUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('videoId');
}

async function highlightOccurrences(content, searchTerm) {
    const regex = new RegExp(searchTerm, 'gi'); // 'gi' for global and case-insensitive search
    const highlightedContent = content.replace(regex, match => `<span class="highlight">${match}</span>`);
    document.getElementById('editableSummary').innerHTML = highlightedContent;
}

function removeHighlights() {
    const highlightedElements = document.querySelectorAll('.highlight');
    highlightedElements.forEach(element => {
        element.parentNode.replaceChild(document.createTextNode(element.textContent), element);
    });
}

function highlightText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'highlight';
        range.surroundContents(span);
        selection.removeAllRanges();
    }
}

function removeHighlightedText(){
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = range.startContainer.parentNode;
        if (span.classList.contains('highlight')) {
            const text = span.innerHTML;
            span.outerHTML = text;
        }
        selection.removeAllRanges();
    }
}