from wordcloud import WordCloud
import matplotlib.pyplot as plt
import sys
import json
import os

def visualize_top_keywords(keywords_path):
    # Extract keywords and scores
    with open(keywords_path, 'r') as f:
        keywords_data = json.load(f)
    top_keywords = [entry[0] for entry in keywords_data]
    scores = [entry[1] for entry in keywords_data]
    # Plot the top keywords
    plt.figure(figsize=(10, 5))
    plt.barh(range(len(top_keywords)), scores, align='center')
    plt.yticks(range(len(top_keywords)), top_keywords)
    plt.xlabel('TF-IDF Score')
    plt.ylabel('Keywords')
    plt.title('Top Keywords by TF-IDF Score')
    plt.gca().invert_yaxis()
    images_dir = os.path.join(os.getcwd(), 'images')
    os.makedirs(images_dir, exist_ok=True)
    plot_path = os.path.join(images_dir, 'top_keywords_plot.png')
    plt.savefig(plot_path)
    plt.close()


def visualize_word_cloud(keywords_path):
    with open(keywords_path, 'r') as f:
        keywords_data = json.load(f)
    word_freq = {entry[0]: entry[1] for entry in keywords_data}
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate_from_frequencies(word_freq)

    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title('Word Cloud of Top Keywords')
    images_dir = os.path.join(os.getcwd(), 'images')
    os.makedirs(images_dir, exist_ok=True)
    plot_path = os.path.join(images_dir, 'word_cloud.png')
    plt.savefig(plot_path)
    plt.close()

if __name__ == "__main__":
    keywords_path = sys.argv[1]
    result = visualize_top_keywords(keywords_path)
    cloudresult = visualize_word_cloud(keywords_path)