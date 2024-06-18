document.addEventListener('click', async(event) => {
    if(event.target.id === 'saveNotesBtn'){
        const editor = CKEDITOR.instances.userNotes;
        const userNotes = editor.getData();
        const videoId = await getVideoIdFromUrl();
        const cleanedNotes = userNotes.replace(/<p>/g, '').replace(/<\/p>/g, '');

        try{
            const response = await fetch('/updateNotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "videoId": videoId, "userNotes": cleanedNotes })
            });

            if (!response.ok) {
                throw new Error('Failed to save notes');
            }

            alert('Notes saved successfully');
        }
        catch(error){
            console.error('Error saving notes: ',error);
            alert('Failed to save notes. Please try again.');
        }
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    const userNotesTextarea = document.getElementById('userNotes');
    const videoId = await getVideoIdFromUrl();

    try {
        const response = await fetch(`/getNotes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "videoId": videoId })
        });
        if (!response.ok) {
            throw new Error('Failed to fetch notes from MongoDB');
        }
        const { notes } = await response.json();
        userNotesTextarea.value = notes;
    } catch (error) {
        console.error('Error fetching notes from MongoDB:', error);
        alert('Failed to fetch notes from MongoDB. Please try again.');
    }
});

function getVideoIdFromUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('videoId');
}