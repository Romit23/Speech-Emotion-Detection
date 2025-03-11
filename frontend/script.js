const recordBtn = document.getElementById('recordBtn');
const textDisplay = document.getElementById('text');
const emotionDisplay = document.getElementById('detectedEmotion');
const status = document.getElementById('status');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;

recordBtn.addEventListener('click', () => {
  status.textContent = 'Listening...';
  recognition.start();
});

recognition.onresult = async (event) => {
  const speechText = event.results[0][0].transcript;
  textDisplay.textContent = speechText;
  status.textContent = 'Processing...';

  try {
    const response = await fetch('http://127.0.0.1:8000/emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: speechText }),
    });

    const data = await response.json();
    emotionDisplay.textContent = data.emotion;
    status.textContent = 'Done!';
  } catch (error) {
    console.error('Error:', error);
    status.textContent = 'Error occurred.';
  }
};

recognition.onerror = (event) => {
  console.error('Error:', event.error);
  status.textContent = 'An error occurred.';
};
