import type { Metadata } from 'next';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import NotesClient from './Notes.client';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const filter = slug[0] === 'all' ? 'All notes' : `Notes filtered by ${slug[0]}`;

  return {
    title: `${filter} | NoteHub`,
    description: `Browse ${filter.toLowerCase()} in NoteHub application.`,
    openGraph: {
      title: `${filter} | NoteHub`,
      description: `Browse ${filter.toLowerCase()} in NoteHub application.`,
      url: `https://notehub.com/notes/filter/${slug[0]}`,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: 'NoteHub notes',
        },
      ],
    },
  };
}

export default async function NotesPage({ params }: Props) {
  const { slug } = await params;
  const tagFromUrl = slug[0];
  const tag = tagFromUrl === 'all' ? undefined : tagFromUrl;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', { page: 1, search: '', tag: tagFromUrl }],
    queryFn: () => fetchNotes(1, '', tag),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tagFromUrl} />
    </HydrationBoundary>
  );
}