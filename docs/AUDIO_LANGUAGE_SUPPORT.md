# Audio Language Support in Moviebox API

## Overview

This document explains the audio language support available through the moviebox API.

## Current State

### What IS Supported ✅

1. **Subtitles/Captions in Multiple Languages**
   - The API fully supports downloading subtitles in various languages including French
   - Available through the `CaptionFileMetadata` model
   - Each subtitle file includes:
     - `lan`: Language code (e.g., "fr" for French)
     - `lanName`: Full language name (e.g., "French")
     - `url`: Direct download link for the subtitle file

**Example:**
```python
from moviebox_api import Session, Search, DownloadableMovieFilesDetail, SubjectType

async def get_subtitles():
    session = Session()
    search = Search(session, "Avatar", subject_type=SubjectType.MOVIES)
    results = await search.get_content_model()
    
    first_movie = results.first_item
    downloadable = DownloadableMovieFilesDetail(session, first_movie)
    details = await downloadable.get_content_model()
    
    # Get all available subtitle languages
    print("Available subtitle languages:")
    for caption in details.captions:
        print(f"  - {caption.lanName} ({caption.lan})")
```

### What is NOT Currently Exposed ❌

2. **Multiple Audio Tracks / Audio Language Selection**
   - The API responses do not currently provide explicit audio track information
   - Video files downloaded through the API come with their embedded audio tracks
   - **The API does not allow selecting different audio languages (like VF/VO) for the same video**

## Technical Details

### API Response Structure

When fetching downloadable files, the API returns:

```json
{
  "downloads": [
    {
      "id": "...",
      "url": "https://...",
      "resolution": 1080,
      "size": 1234567890
    }
  ],
  "captions": [
    {
      "id": "...",
      "lan": "en",
      "lanName": "English",
      "url": "https://...",
      "size": 123456,
      "delay": 0
    },
    {
      "id": "...",
      "lan": "fr",
      "lanName": "French",
      "url": "https://...",
      "size": 123456,
      "delay": 0
    }
  ],
  "limited": false,
  "limitedCode": "",
  "hasResource": true
}
```

**Note:** Each video quality option (`downloads`) contains a single video file URL. The audio tracks are embedded within the video file itself.

### Audio Field in API

The `PostListMediaModel` contains an `audio: list` field, but this appears to be related to media metadata on the item's detail page, not to downloadable audio track options. This field is typically empty or not used for providing alternative audio language tracks.

## Workaround for French Audio

If you need French audio (VF - Version Française):

1. **Search specifically for French versions**: Some movies may have separate entries for different language versions
   ```python
   search = Search(session, "Avatar VF", subject_type=SubjectType.MOVIES)
   # or
   search = Search(session, "Avatar French", subject_type=SubjectType.MOVIES)
   ```

2. **Check the video file**: After downloading, the video file may contain multiple audio tracks that can be selected in your media player (e.g., VLC, MPV)

3. **Use subtitles as an alternative**: While not the same as dubbed audio, French subtitles are fully supported

## Conclusion

**The moviebox API currently supports French subtitles but does NOT provide a way to select or filter by audio language (VF vs VO).** The audio tracks are embedded in the video files and cannot be selected through the API. Users need to either:

- Search for movies that are specifically uploaded with French audio
- Use the embedded audio tracks in the downloaded video files (if multiple tracks exist)
- Rely on French subtitles as an alternative

## Future Improvements

To add audio language support, the API would need to:

1. Expose audio track information in the `DownloadableFilesMetadata` response
2. Provide separate video URLs for different audio language versions
3. Include an `AudioTrackMetadata` model similar to `CaptionFileMetadata`

---

**Last Updated:** 2025-11-02
**API Version:** 0.3.4
