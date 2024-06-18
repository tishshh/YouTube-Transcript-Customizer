import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer

def extract_top_keywords(text, n=10):
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')

    # Fit and transform the text
    tfidf_matrix = tfidf_vectorizer.fit_transform([text])

    # Get feature names (words)
    feature_names = tfidf_vectorizer.get_feature_names_out()

    # Get TF-IDF scores
    tfidf_scores = tfidf_matrix.toarray()[0]

    # Combine feature names with their TF-IDF scores
    keywords = [(feature_names[i], tfidf_scores[i]) for i in range(len(feature_names))]

    # Sort keywords by TF-IDF scores in descending order
    keywords = sorted(keywords, key=lambda x: x[1], reverse=True)

    # Return top n keywords
    return [list(keyword) for keyword in keywords[:n]]

if __name__ == "__main__":
    summary = sys.argv[1]
    result = extract_top_keywords(summary)
    print(json.dumps(result))
