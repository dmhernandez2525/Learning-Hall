import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listLessonBookmarks } from '@/lib/bookmarks';
import { listFavoriteCourses } from '@/lib/favorites';
import { BookmarksAndFavorites } from '@/components/bookmarks/BookmarksAndFavorites';

export default async function StudentBookmarksPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const [bookmarks, favorites] = await Promise.all([
    listLessonBookmarks(user, 50),
    listFavoriteCourses(user.id, 50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Bookmarks & Favorites</h1>
        <p className="text-muted-foreground">
          Quick access to your saved lessons and favorite courses.
        </p>
      </div>
      <BookmarksAndFavorites initialBookmarks={bookmarks} initialFavorites={favorites} />
    </div>
  );
}
