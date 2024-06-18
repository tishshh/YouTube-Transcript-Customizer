document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('transcriptForm');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const videoId = document.getElementById('videoId').value;

        fetch(`/process?videoId=${videoId}`, {
            method: 'POST',
            body: JSON.stringify({ videoId })
        })
        .then(response => response.text())
        .then(html => {
            document.documentElement.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
