'use client';

import { useState, useMemo } from 'react';
import type { LessonNote, NoteListResult } from '@/lib/notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { extractPlainText } from '@/lib/richtext';
import { Search, Download, Filter, FileText, BookOpen } from 'lucide-react';

interface NotesDashboardProps {
  initialData: NoteListResult;
}

interface CourseGroup {
  id: string;
  title: string;
  notes: LessonNote[];
}

export function NotesDashboard({ initialData }: NotesDashboardProps) {
  const [notes, setNotes] = useState<LessonNote[]>(initialData.docs);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [exporting, setExporting] = useState(false);

  // Extract unique courses from notes
  const courses = useMemo(() => {
    const courseMap = new Map<string, { id: string; title: string }>();
    notes.forEach((note) => {
      if (note.course.id && !courseMap.has(note.course.id)) {
        courseMap.set(note.course.id, { id: note.course.id, title: note.course.title || 'Untitled Course' });
      }
    });
    return Array.from(courseMap.values());
  }, [notes]);

  // Filter notes by selected course
  const filteredNotes = useMemo(() => {
    if (!selectedCourse) return notes;
    return notes.filter((note) => note.course.id === selectedCourse);
  }, [notes, selectedCourse]);

  // Group notes by course
  const groupedNotes = useMemo((): CourseGroup[] => {
    const groups = new Map<string, CourseGroup>();
    filteredNotes.forEach((note) => {
      const courseId = note.course.id;
      if (!groups.has(courseId)) {
        groups.set(courseId, { id: courseId, title: note.course.title || 'Untitled Course', notes: [] });
      }
      groups.get(courseId)!.notes.push(note);
    });
    return Array.from(groups.values());
  }, [filteredNotes]);

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

  const handleBulkExport = async (format: 'markdown' | 'pdf') => {
    if (filteredNotes.length === 0) return;
    setExporting(true);

    try {
      if (format === 'markdown') {
        // Create a single markdown file with all notes
        let content = `# My Notes\n\nExported on ${new Date().toLocaleDateString()}\n\n---\n\n`;

        // Group by course
        const grouped = new Map<string, LessonNote[]>();
        filteredNotes.forEach((note) => {
          const courseTitle = note.course.title || 'Untitled Course';
          if (!grouped.has(courseTitle)) grouped.set(courseTitle, []);
          grouped.get(courseTitle)!.push(note);
        });

        grouped.forEach((courseNotes, courseTitle) => {
          content += `## ${courseTitle}\n\n`;
          courseNotes.forEach((note) => {
            content += `### ${note.title}\n`;
            content += `*Lesson: ${note.lesson.title || 'Unknown'}*\n\n`;
            content += `${note.plainText}\n\n---\n\n`;
          });
        });

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `all-notes-${new Date().toISOString().split('T')[0]}.md`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Create a single PDF with all notes
        const doc = new jsPDF();
        let yPosition = 20;
        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(20);
        doc.text('My Notes', 14, yPosition);
        yPosition += 10;
        doc.setFontSize(10);
        doc.text(`Exported on ${new Date().toLocaleDateString()} - ${filteredNotes.length} notes`, 14, yPosition);
        yPosition += 15;

        filteredNotes.forEach((note, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(14);
          doc.text(note.title, 14, yPosition);
          yPosition += 7;

          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(`${note.course.title} > ${note.lesson.title}`, 14, yPosition);
          yPosition += 5;
          doc.setTextColor(0);

          doc.setFontSize(11);
          const text = doc.splitTextToSize(note.plainText || extractPlainText(note.contentHtml), 180);
          const textHeight = text.length * 5;

          // Check if text fits on current page
          if (yPosition + textHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text(text, 14, yPosition);
          yPosition += textHeight + 10;

          // Add separator line
          if (index < filteredNotes.length - 1) {
            doc.setDrawColor(200);
            doc.line(14, yPosition, 196, yPosition);
            yPosition += 10;
          }
        });

        doc.save(`all-notes-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && searchNotes()}
          />
        </div>
        <Button onClick={searchNotes} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>

        {/* Course Filter */}
        {courses.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value || null)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-r-none"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grouped' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grouped')}
            className="rounded-l-none"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>

        {/* Bulk Export */}
        {filteredNotes.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport('markdown')}
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-1" />
              Export All (.md)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport('pdf')}
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-1" />
              Export All (.pdf)
            </Button>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {filteredNotes.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</span>
          {selectedCourse && (
            <span className="flex items-center gap-1">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                {courses.find(c => c.id === selectedCourse)?.title}
              </span>
              <button type="button" onClick={() => setSelectedCourse(null)} className="hover:text-primary">×</button>
            </span>
          )}
        </div>
      )}

      {/* Notes List or Grouped View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
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
        </div>
      ) : (
        <div className="space-y-6">
          {groupedNotes.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">{group.title}</h2>
                <span className="text-sm text-muted-foreground">({group.notes.length} notes)</span>
              </div>
              <div className="ml-7 space-y-2">
                {group.notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{note.title}</p>
                          <p className="text-xs text-muted-foreground">{note.lesson.title}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/student/courses/${note.course.id}/lessons/${note.lesson.id}`}>
                              Open
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleExport(note, 'pdf')}>
                            PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredNotes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No notes found</p>
            <p className="text-sm mt-1">
              {selectedCourse ? 'Try selecting a different course or clear the filter.' : 'Start taking notes while watching lessons.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
