import { CourseBuilderV2 } from '@/components/course-builder-v2';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseBuilderV2Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <CourseBuilderV2 courseId={id} />
    </div>
  );
}
