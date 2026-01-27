'use client';

import { useState } from 'react';
import type { LessonNote, NoteListResult } from '@/lib/notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { extractPlainText } from '@/lib/richtext';

interface NotesDashboardProps {
  initialData: NoteListResult;
}

export function NotesDashboard({ initialData }: NotesDashboardProps) {
  const [notes, setNotes] = useState<LessonNote[]>(initialData.docs);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const searchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      const response = await fetch(`/api/notes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search notes');
      const data: NoteListResult = await response.json();
      setNotes(data.docs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (note: LessonNote, format: 'markdown' | 'pdf') => {
    if (format === 'markdown') {
      const content = `# ${note.title}\n\n${note.plainText}\n\n- Course: ${note.course.title}\n- Lesson: ${note.lesson.title}`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title.replace(/\s+/g, '-')}.md`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(note.title, 14, 20);
    doc.setFontSize(11);
    const metadata = [`Course: ${note.course.title}`, `Lesson: ${note.lesson.title}`];
    if (note.videoTimestamp !== undefined) {
      metadata.push(`Timestamp: ${note.videoTimestamp}s`);
    }
    doc.text(metadata, 14, 30);
    const text = doc.splitTextToSize(note.plainText || extractPlainText(note.contentHtml), 180);
    doc.text(text, 14, 50);
    doc.save(`${note.title.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="Search notes" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button onClick={searchNotes} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>
      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {note.course.title} · {note.lesson.title}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/student/courses/${note.course.id}/lessons/${note.lesson.id}`}>
                      Open lesson
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleExport(note, 'markdown')}>
                    Markdown
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleExport(note, 'pdf')}>
                    PDF
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {note.plainText.length > 200 ? `${note.plainText.slice(0, 197)}…` : note.plainText}
              </p>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes found. Try another search.</p>}
      </div>
    </div>
  );
}
