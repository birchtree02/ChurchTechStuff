import youtube_dl


def download_ytvid_as_mp3(video_url):
    video_info = youtube_dl.YoutubeDL().extract_info(url=video_url, download=False)
    filename = f"{video_info['title']}1.mp3"
    options = {
        'format': 'bestaudio/best',
        'keepvideo': False,
        'outtmpl': filename,
    }

    with youtube_dl.YoutubeDL(options) as ydl:
        ydl.download([video_info['webpage_url']])

    print("Download complete... {}".format(filename))


if __name__ == "__main__":
    import sys

    for video in sys.argv[1:]:
        download_ytvid_as_mp3(video)
