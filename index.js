const sdk = require("microsoft-cognitiveservices-speech-sdk");
const express = require('express');
const bodyParser = require('body-parser');
const subscriptionKey = "3c4121fca5c9472db7c84fc3e4442c0f";
const region = "eastus";

const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/synthesize', (req, res) => {
    const { text } = req.body;
    const visemeData = [];
    synthesizer.visemeReceived = function (s, e) {
        visemeData.push({
            audioOffset: Math.round(e.audioOffset / 10000),
            visemeId: e.visemeId,
        });
    };

    if (text) {
        synthesizer.speakTextAsync(text, function (result) {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                console.log("Synthesis finished.");
                const audioData = Buffer.from(result.audioData).toString('base64');
                res.json({ audioData, visemeData });
            } else {
                console.error(`Error synthesizing audio: ${result.reason}`);
                res.status(500).json({ error: "Error synthesizing audio" });
            }
        });
    } else {
        res.status(400).json({ error: 'Text not provided' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
