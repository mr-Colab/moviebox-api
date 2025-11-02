#!/usr/bin/env python
"""
Utility script to check available subtitle languages and downloadable options for a movie.

This script helps verify what language options are available through the moviebox API.

Usage:
    python check_language_support.py "Movie Title"
    
Example:
    python check_language_support.py "Avatar"
"""

import asyncio
import sys
import traceback

from moviebox_api import (
    DownloadableMovieFilesDetail,
    Search,
    Session,
    SubjectType,
)

# Constants for French language detection (ISO 639-1 and ISO 639-2 codes)
# ISO 639-1: fr (2-letter code)
# ISO 639-2: fre/fra (3-letter codes - both bibliographic and terminological)
FRENCH_LANGUAGE_CODES = ['fr', 'fre', 'fra']


async def check_movie_languages(title: str, year: int = None):
    """
    Check available subtitle languages and download options for a movie.
    
    Args:
        title: Movie title to search for
        year: Optional year filter
    """
    print(f"\n{'='*80}")
    print(f"Checking language support for: {title}")
    if year:
        print(f"Year filter: {year}")
    print(f"{'='*80}\n")
    
    try:
        # Create session
        session = Session()
        
        # Search for the movie
        print(f"🔍 Searching for '{title}'...")
        search = Search(session, title, subject_type=SubjectType.MOVIES)
        results = await search.get_content_model()
        
        if not results.items:
            print(f"❌ No results found for '{title}'")
            return
        
        print(f"✅ Found {len(results.items)} result(s)\n")
        
        # Filter by year if specified
        target_movie = None
        if year:
            for item in results.items:
                if item.releaseDate.year == year:
                    target_movie = item
                    break
            if not target_movie:
                print(f"⚠️  No movie found for year {year}, using first result instead")
                target_movie = results.first_item
        else:
            target_movie = results.first_item
        
        # Display movie info
        print(f"📽️  Movie: {target_movie.title}")
        print(f"📅 Release Date: {target_movie.releaseDate}")
        print(f"⭐ IMDB Rating: {target_movie.imdbRatingValue}")
        print(f"🎭 Genre: {', '.join(target_movie.genre)}")
        print(f"🌍 Country: {target_movie.countryName}")
        print()
        
        # Get downloadable files
        print("⏳ Fetching downloadable files information...")
        downloadable = DownloadableMovieFilesDetail(session, target_movie)
        details = await downloadable.get_content_model()
        
        # Video quality options
        print(f"\n{'─'*80}")
        print("📺 AVAILABLE VIDEO QUALITY OPTIONS:")
        print(f"{'─'*80}")
        if details.downloads:
            print(f"✅ {len(details.downloads)} quality option(s) available:\n")
            for i, download in enumerate(details.downloads, 1):
                size_mb = download.size / (1024 * 1024)
                print(f"  {i}. Resolution: {download.resolution}p")
                print(f"     Size: {size_mb:.2f} MB")
                print(f"     Format: {download.ext}")
                print()
        else:
            print("❌ No video quality options available")
        
        # Subtitle languages
        print(f"{'─'*80}")
        print("💬 AVAILABLE SUBTITLE LANGUAGES:")
        print(f"{'─'*80}")
        if details.captions:
            print(f"✅ {len(details.captions)} subtitle language(s) available:\n")
            
            french_found = False
            for i, caption in enumerate(details.captions, 1):
                size_kb = caption.size / 1024
                is_french = caption.lan.lower() in FRENCH_LANGUAGE_CODES
                if is_french:
                    french_found = True
                    marker = "🇫🇷"
                else:
                    marker = "  "
                    
                print(f"{marker} {i}. {caption.lanName} ({caption.lan})")
                print(f"     Size: {size_kb:.2f} KB")
                print(f"     Format: {caption.ext}")
                print()
            
            if french_found:
                print("✅ French subtitles ARE available!")
            else:
                print("❌ French subtitles NOT found in available options")
        else:
            print("❌ No subtitles available")
        
        # Audio information
        print(f"\n{'─'*80}")
        print("🔊 AUDIO TRACK INFORMATION:")
        print(f"{'─'*80}")
        print("ℹ️  The moviebox API does NOT provide separate audio track options.")
        print("   Audio tracks are embedded in the video files themselves.")
        print()
        print("🎵 What this means:")
        print("   • You CANNOT select VF (French audio) vs VO (original audio) through the API")
        print("   • The video file you download will have whatever audio track(s) were")
        print("     uploaded with it")
        print("   • Some video files MAY contain multiple audio tracks that can be")
        print("     selected in media players like VLC or MPV")
        print()
        print("💡 To find French audio versions:")
        print("   • Try searching for '[Movie Title] VF' or '[Movie Title] French'")
        print("   • Check if the video file has multiple audio tracks after download")
        print("   • Use French subtitles as an alternative")
        print()
        
        # Summary
        print(f"{'='*80}")
        print("📋 SUMMARY:")
        print(f"{'='*80}")
        has_french_subs = any(c.lan.lower() in FRENCH_LANGUAGE_CODES for c in details.captions)
        print(f"✅ French Subtitles: {'YES' if has_french_subs else 'NO'}")
        print("❌ French Audio Selection: NO (not supported by API)")
        print(f"{'='*80}\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
        return


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python check_language_support.py \"Movie Title\" [year]")
        print("\nExample:")
        print('  python check_language_support.py "Avatar"')
        print('  python check_language_support.py "Avatar" 2009')
        sys.exit(1)
    
    title = sys.argv[1]
    year = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    asyncio.run(check_movie_languages(title, year))


if __name__ == "__main__":
    main()
