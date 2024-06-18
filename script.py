import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
from gtts import gTTS

def process_video(youtube_url):
    transcript_list = get_youtube_transcript(youtube_url)
    
    transcript = clean_transcript(transcript_list)

    summary = get_summary(transcript)

    tts = gTTS(summary, lang='en')
    tts.save("summary_audio.mp3")
    
    return {
        "transcript": transcript,
        "summary": summary
    }

def get_youtube_transcript(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = [item["text"] for item in transcript_list]
        return ' '.join(transcript_text)
    except Exception as e:
        print(f"Error retrieving transcript: {e}")
        return None

def get_summary(transcript):
    summarizer = pipeline('summarization')
    summary=''
    for i in range(0, (len(transcript)//1000)+1):
        summary_text = summarizer(transcript[i*1000:(i+1)*1000])[0]['summary_text'] 
        summary = summary + summary_text + ' '
    return summary

def clean_transcript(transcript):
    transcript_text = transcript.replace('\n', '  ') 
    transcript_text = transcript_text.replace('\r', '') 
    transcript_text = transcript_text.strip()     
    return transcript_text

if __name__ == "__main__":
    youtube_url = sys.argv[1]
    result = process_video(youtube_url)
    print(json.dumps(result))