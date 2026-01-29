'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { LessonBookmark } from '@/lib/bookmarks';
import type { FavoriteCourse } from '@/lib/favorites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Bookmark, BookmarkX, Heart, HeartOff, Play, Clock, BookOpen, Trash2 } from 'lucide-react';

interface BookmarksAndFavoritesProps {
  initialBookmarks: LessonBookmark[];
  initialFavorites: FavoriteCourse[];
}

type Tab = 'bookmarks' | 'favorites';

function formatSeconds(seconds?: number) {
  if (typeof seconds !== 'number') return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function BookmarksAndFavorites({
  initialBookmarks,
  initialFavorites,
}: BookmarksAndFavoritesProps) {
  const [activeTab, setActiveTab] = useState<Tab>('bookmarks');
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removing, setRemoving] = useState<string | null>(null);

  const removeBookmark = async (lessonId: string) => {
    setRemoving(lessonId);
    try {
      const response = await fetch(`/api/bookmarks/${lessonId}`, { method: 'DELETE' });
      if (response.ok) {
        setBookmarks((prev) => prev.filter((b) => b.lesson.id !== lessonId));
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    } finally {
      setRemoving(null);
    }
  };

  const removeFavorite = async (courseId: string) => {
    setRemoving(courseId);
    try {
      const response = await fetch(`/api/favorites/${courseId}`, { method: 'DELETE' });
      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.course.id !== courseId));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'bookmarks'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Bookmarks
          <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
            {bookmarks.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'favorites'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className="w-4 h-4" />
          Favorites
          <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
            {favorites.length}
          </span>
        </button>
      </div>

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <BookmarkX className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">No bookmarks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bookmark lessons to easily find them later.
                </p>
              </CardContent>
            </Card>
          ) : (
            bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">
                          {bookmark.lesson.title || 'Untitled Lesson'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground truncate">
                          {bookmark.course.title || 'Untitled Course'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {bookmark.videoTimestamp !== undefined && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatSeconds(bookmark.videoTimestamp)}
                            </span>
                          )}
                          <span>Saved {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="default" asChild>
                        <Link
                          href={`/student/courses/${bookmark.course.id}/lessons/${bookmark.lesson.id}${
                            bookmark.videoTimestamp ? `?t=${bookmark.videoTimestamp}` : ''
                          }`}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Continue
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBookmark(bookmark.lesson.id)}
                        disabled={removing === bookmark.lesson.id}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.length === 0 ? (
            <Card className="border-dashed md:col-span-2 lg:col-span-3">
              <CardContent className="py-10 text-center">
                <HeartOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">No favorite courses</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mark courses as favorites for quick access.
                </p>
              </CardContent>
            </Card>
          ) : (
            favorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-md transition-shadow overflow-hidden">
                {favorite.course.thumbnailUrl && (
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={favorite.course.thumbnailUrl}
                      alt={favorite.course.title || 'Course thumbnail'}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => removeFavorite(favorite.course.id)}
                      disabled={removing === favorite.course.id}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                )}
                <CardContent className="py-4">
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {favorite.course.title || 'Untitled Course'}
                  </CardTitle>
                  {favorite.course.shortDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {favorite.course.shortDescription}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Added {new Date(favorite.createdAt).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/student/courses/${favorite.course.id}/lessons`}>
                        View Course
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
