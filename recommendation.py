from youtubesearchpython import VideosSearch
import sys
import json

def search_videos(keyword, max_results=1):
    videos_search = VideosSearch(keyword, limit=max_results)
    result = videos_search.result()

    videos = []
    if result['result']:
        item = result['result'][0]
        video = {
            'title': item['title'],
            'video_url': f"https://www.youtube.com/watch?v={item['id']}",
            'thumbnail': item['thumbnails'][0]['url']
        }
        videos.append(video)

    return videos

if __name__ == "__main__":
    file_path = sys.argv[1] 
    with open(file_path, 'r') as file:
        keyword_data = json.load(file)
    recommendations = []
    for keyword in keyword_data:
        videos = search_videos(keyword[0])
        recommendations.extend(videos)
    print(json.dumps(recommendations))
