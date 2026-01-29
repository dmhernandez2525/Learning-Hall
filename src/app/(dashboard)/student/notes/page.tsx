import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listLessonNotes } from '@/lib/notes';
import { NotesDashboard } from '@/components/notes/NotesDashboard';

export default async function StudentNotesPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const data = await listLessonNotes({ page: 1, limit: 50 }, user);

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
