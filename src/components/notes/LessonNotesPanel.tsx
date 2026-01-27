'use client';

import { useState, useMemo, useRef } from 'react';
import type { LessonNote } from '@/lib/notes';
import { sanitizeNoteHtml, extractPlainText } from '@/lib/richtext';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LessonNotesPanelProps {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  initialNotes: LessonNote[];
  currentVideoTime?: number;
  onSeek?: (seconds: number) => void;
}

interface EditingState {
  id?: string;
  title: string;
  contentHtml: string;
  videoTimestamp?: number;
}

const formatSeconds = (seconds?: number) => {
  if (typeof seconds !== 'number') return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function LessonNotesPanel({
  lessonId,
  courseId,
  lessonTitle,
  initialNotes,
  currentVideoTime,
  onSeek,
}: LessonNotesPanelProps) {
  const [notes, setNotes] = useState<LessonNote[]>(initialNotes);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<EditingState>({ title: `${lessonTitle} note`, contentHtml: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [notes]
  );

  const resetEditor = () => {
    setEditing({ title: `${lessonTitle} note`, contentHtml: '' });
    setEditorVisible(false);
    setError(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleApplyFormat = (command: string) => {
    document.execCommand(command);
    editorRef.current?.focus();
  };

  const handleUseTimestamp = () => {
    if (typeof currentVideoTime === 'number') {
      setEditing((prev) => ({ ...prev, videoTimestamp: Math.max(0, Math.floor(currentVideoTime)) }));
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const rawHtml = editorRef.current.innerHTML;
      const sanitized = sanitizeNoteHtml(rawHtml);
      const payload = {
        lessonId,
        title: editing.title || `${lessonTitle} note`,
        contentHtml: sanitized,
        videoTimestamp: editing.videoTimestamp,
      };

      const response = await fetch(editing.id ? `/api/notes/${editing.id}` : '/api/notes', {
        method: editing.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editing.id
            ? {
                title: payload.title,
                contentHtml: payload.contentHtml,
                videoTimestamp: payload.videoTimestamp,
              }
            : payload
        ),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save note');
        return;
      }

      setNotes((prev) => {
        if (editing.id) {
          return prev.map((note) => (note.id === editing.id ? (data.doc as LessonNote) : note));
        }
        return [data.doc as LessonNote, ...prev];
      });
      resetEditor();
    } catch (err) {
      console.error(err);
      setError('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: LessonNote) => {
    setEditorVisible(true);
    setEditing({ id: note.id, title: note.title, contentHtml: note.contentHtml, videoTimestamp: note.videoTimestamp });
    if (editorRef.current) {
      editorRef.current.innerHTML = note.contentHtml;
    }
  };

  const handleDelete = async (note: LessonNote) => {
    if (!confirm('Delete this note?')) return;
    try {
      const response = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete note');
        return;
      }
      setNotes((prev) => prev.filter((item) => item.id !== note.id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete note');
    }
  };

  const handleExportMarkdown = (note: LessonNote) => {
    const content = `# ${note.title}\n\n${note.plainText}\n\n- Course: ${note.course.title || courseId}\n- Lesson: ${note.lesson.title || lessonTitle}\n- Timestamp: ${formatSeconds(note.videoTimestamp)}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = (note: LessonNote) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(note.title, 14, 20);
    doc.setFontSize(11);
    const details = [`Course: ${note.course.title || courseId}`, `Lesson: ${note.lesson.title || lessonTitle}`];
    if (note.videoTimestamp !== undefined) {
      details.push(`Timestamp: ${formatSeconds(note.videoTimestamp)}`);
    }
    doc.text(details, 14, 30);
    const body = doc.splitTextToSize(note.plainText || extractPlainText(note.contentHtml), 180);
    doc.text(body, 14, 50);
    doc.save(`${note.title.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Notes</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUseTimestamp} disabled={typeof currentVideoTime !== 'number'}>
            Use video timestamp
          </Button>
          <Button onClick={() => setEditorVisible((prev) => !prev)}>
            {editorVisible ? 'Close editor' : 'New note'}
          </Button>
        </div>
      </div>

      {editorVisible && (
        <Card>
          <CardHeader>
            <CardTitle>{editing.id ? 'Edit note' : 'Create note'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="note-title">
                Title
              </label>
              <Input
                id="note-title"
                value={editing.title}
                onChange={(event) => setEditing((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="note-timestamp">
                  Timestamp (seconds)
                </label>
                <Input
                  id="note-timestamp"
                  type="number"
                  min={0}
                  value={editing.videoTimestamp ?? ''}
                  onChange={(event) =>
                    setEditing((prev) => ({ ...prev, videoTimestamp: event.target.value ? Number(event.target.value) : undefined }))
                  }
                  placeholder="e.g., 120"
                />
              </div>
              <Button variant="ghost" className="mt-6" onClick={handleUseTimestamp} disabled={typeof currentVideoTime !== 'number'}>
                Capture current time
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => handleApplyFormat('bold')}>
                  Bold
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => handleApplyFormat('italic')}>
                  Italic
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => handleApplyFormat('underline')}>
                  Underline
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => handleApplyFormat('insertUnorderedList')}>
                  Bullets
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => handleApplyFormat('insertOrderedList')}>
                  Numbers
                </Button>
              </div>
              <div
                ref={editorRef}
                className="min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: editing.contentHtml }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={resetEditor}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Note'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sortedNotes.map((note) => (
          <Card key={note.id}>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(note.updatedAt).toLocaleString()} · {formatSeconds(note.videoTimestamp)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Button variant="outline" size="sm" onClick={() => note.videoTimestamp !== undefined && onSeek?.(note.videoTimestamp)}>
                    Jump to time
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleExportMarkdown(note)}>
                    Markdown
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleExportPdf(note)}>
                    PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(note)}>
                    Delete
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
            </CardContent>
          </Card>
        ))}
        {sortedNotes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Start writing to capture your insights.</p>}
      </div>
    </section>
  );
}
