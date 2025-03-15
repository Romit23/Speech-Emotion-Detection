const recordBtn = document.getElementById('recordBtn');
const textDisplay = document.getElementById('text');
const emotionDisplay = document.getElementById('detectedEmotion');
const status = document.getElementById('status');
const resultCards = document.querySelectorAll('.result-card');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;

const emojiMap = {
  'sadness':'😢',
  'joy':'😃',
  'love': '🥰',
  'anger':'😡',
  'fear':'😱',
  'surprise':'😯'
};

const emotionBackgrounds = {
    'sadness': 'linear-gradient(135deg, #ffeb3b 0%, #ff9800 100%)',
    'joy': 'linear-gradient(135deg, #2196f3 0%, #0288d1 100%)',
    'anger': 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
    'love': 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)',
    'surprise': 'linear-gradient(135deg, #00e676 0%, #00c853 100%)',
    'fear': 'linear-gradient(135deg, #bdbdbd 0%, #757575 100%)'
};

function updateStatus(icon, text) {
    status.innerHTML = `<i class="${icon}"></i> ${text}`;
    status.className = 'status ' + text.toLowerCase().replace(' ', '-');
}

recordBtn.addEventListener('click', () => {
    updateStatus('fas fa-microphone', 'Listening now');
    resultCards.forEach(card => card.classList.remove('visible'));
    recognition.start();
});

recognition.onstart = () => {
    recordBtn.classList.add('recording');
};

recognition.onend = () => {
    recordBtn.classList.remove('recording');
};

recognition.onresult = async (event) => {
    const speechText = event.results[0][0].transcript;
    textDisplay.textContent = speechText;
    updateStatus('fas fa-spinner fa-spin', 'Processing vibe');

    try {
        const response = await fetch('http://127.0.0.1:8000/emotion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: speechText }),
        });

        const data = await response.json();
        const emotion = data.emotion.toLowerCase();
        const emoji = emojiMap[emotion] ;
        
        emotionDisplay.innerHTML = `<span class="emoji">${emoji}</span><span class="emotion-text">${emotion}</span>`;
        const emotionCard = document.querySelector('.emotion-card');
        emotionCard.className = 'result-card emotion-card emotion-' + emotion;
        document.body.style.background = emotionBackgrounds[emotion] || 'linear-gradient(135deg, #1e1e2f 0%, #2a4066 100%)';
        
        updateStatus('fas fa-check-circle', 'Vibe detected');
        resultCards.forEach(card => card.classList.add('visible'));
    } catch (error) {
        console.error('Error:', error);
        emotionDisplay.innerHTML = `<span class="emoji">❌</span><span class="emotion-text">Error</span>`;
        document.body.style.background = 'linear-gradient(135deg, #d64550 0%, #ff6b6b 100%)';
        updateStatus('fas fa-exclamation-circle', 'Something broke');
    }
};

recognition.onerror = (event) => {
    console.error('Error:', event.error);
    updateStatus('fas fa-exclamation-circle', 'Oops, error hit');
    document.body.style.background = 'linear-gradient(135deg, #d64550 0%, #ff6b6b 100%)';
};