import sys
import json

def calculate_word_overlap(transcript_file, summary_file):
    with open(transcript_file, 'r') as f_transcript, open(summary_file, 'r') as f_summary:
        transcript = f_transcript.read()
        summary = f_summary.read()

    transcript_tokens = transcript.split()
    summary_tokens = summary.split()

    overlapping_words = set(transcript_tokens) & set(summary_tokens)

    if len(summary_tokens) == 0:
        overlap_percentage = 0
    else:
        overlap_percentage = (len(overlapping_words) / len(summary_tokens)) * 100

    return overlap_percentage

if __name__ == "__main__":
    transcript_file = sys.argv[1]
    summary_file = sys.argv[2]
    overlap_percentage = calculate_word_overlap(transcript_file, summary_file)
    print(overlap_percentage)