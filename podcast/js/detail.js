// --- Element References ---
const starBtn = document.getElementById('star');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const audioPlayer = document.getElementById('audioPlayer');
const transcriptContainer = document.getElementById('transcript');
const transcriptMyContainer = document.getElementById('transcriptMy');

// --- State Variables ---
let currentEpisodeIndex = -1;
let lineElements = []; // Stores references to all generated transcript lines
let currentHighlightedLine = null;


// Function to update the page content based on the array index
function updateEpisode(index) {
    if (index < 0) {
        alert("첫 번째 에피소드입니다.");
        return;
    }
    if (index >= PODCASTS.length) {
        alert("마지막 에피소드입니다.");
        return;
    }

    currentEpisodeIndex = index;
    const currentEp = PODCASTS[currentEpisodeIndex];
    const currentId = currentEp.id;

    // 1. Update UI Content
    document.getElementById('episodeTitle').textContent = currentEp.title;
    document.getElementById('episodeDesc').textContent = currentEp.description;
    audioPlayer.src = currentEp.audio;
    
    // Check if transcriptMy exists before setting (it's optional)
    if (transcriptMyContainer && currentEp.transcriptMy) {
        transcriptMyContainer.textContent = currentEp.transcriptMy;
    } else if (transcriptMyContainer) {
        transcriptMyContainer.textContent = '문법/노트 없음';
    }
    
    // 3. Update URL without reloading the page
    history.pushState(null, '', `?id=${currentId}`);
    
    // 4. Reset audio and render transcript
    audioPlayer.load();
    currentHighlightedLine = null;
    lineElements = []; 

    // Render the transcript immediately with the full data array
    renderTranscript(currentEp.transcript);
}


// Function to render the transcript using the new array format
function renderTranscript(timedTranscriptArray) {
    transcriptContainer.innerHTML = ''; // Clear previous content
    
    // Check if the data is in the expected new format (an array)
    if (!Array.isArray(timedTranscriptArray) || timedTranscriptArray.length === 0) {
        transcriptContainer.textContent = '대본 데이터가 올바르지 않습니다.';
        return;
    }

    timedTranscriptArray.forEach((lineData, index) => {
        const lineContainer = document.createElement('div');
        lineContainer.className = 'transcript-line-container';
        lineContainer.setAttribute('data-start-time', lineData.start);
        
        // Korean Line
        const koSpan = document.createElement('span');
        koSpan.className = 'ko-line';
        koSpan.textContent = lineData.ko;
        
        // Burmese Line (optional, based on your data)
        const mySpan = document.createElement('span');
        mySpan.className = 'my-line';
        mySpan.textContent = lineData.my;
        
        lineContainer.appendChild(koSpan);
        lineContainer.appendChild(document.createElement('br')); // Separator
        lineContainer.appendChild(mySpan);
        lineContainer.appendChild(document.createElement('br')); // Extra space between segments
        
        transcriptContainer.appendChild(lineContainer);
        lineElements.push(lineContainer); // Store reference to the container
    });
}


// Function to highlight the line based on audio time (ACCURATE VERSION)
function highlightCurrentLine() {
    const currentTime = audioPlayer.currentTime;
    let lineToHighlight = null;
    
    for (let i = 0; i < lineElements.length; i++) {
        const lineElement = lineElements[i];
        const startTime = parseFloat(lineElement.getAttribute('data-start-time'));
        
        // Use the next line's start time as the current line's end time
        const endTime = (i < lineElements.length - 1) 
            ? parseFloat(lineElements[i+1].getAttribute('data-start-time')) 
            : audioPlayer.duration || Infinity;

        if (currentTime >= startTime && currentTime < endTime) {
            lineToHighlight = lineElement;
            break;
        }
    }

    // Apply or remove the highlight class
    if (lineToHighlight !== currentHighlightedLine) {
        if (currentHighlightedLine) {
            currentHighlightedLine.classList.remove('current-line');
        }
        if (lineToHighlight) {
            lineToHighlight.classList.add('current-line');
            
            // Scroll the transcript container to the current line
            lineToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        currentHighlightedLine = lineToHighlight;
    }
}


// --- Event Listeners ---

// Listen to the audio time update for highlighting
audioPlayer.addEventListener('timeupdate', highlightCurrentLine);


// Previous Button
prevBtn.onclick = () => {
    updateEpisode(currentEpisodeIndex - 1);
};

// Next Button
nextBtn.onclick = () => {
    updateEpisode(currentEpisodeIndex + 1);
};


// --- Initial Load ---
const params = new URLSearchParams(location.search);
const urlId = Number(params.get('id')); 

currentEpisodeIndex = PODCASTS.findIndex(p => p.id === urlId);

if (currentEpisodeIndex === -1) {
    location.href = 'index.html'; 
} else {
    // Only call updateEpisode once on initial load
    updateEpisode(currentEpisodeIndex);
}