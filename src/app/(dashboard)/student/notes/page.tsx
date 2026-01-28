import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listLessonNotes, NoteListResult } from '@/lib/notes';
import { NotesDashboard } from '@/components/notes/NotesDashboard';

export default async function StudentNotesPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  let data: NoteListResult = {
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  try {
    data = await listLessonNotes({ page: 1, limit: 50 }, user);
  } catch (error) {
    console.error('Error fetching notes:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Notes</h1>
        <p className="text-muted-foreground">Search across every note you have taken in your courses.</p>
      </div>
      <NotesDashboard initialData={data} />
    </div>
  );
}
