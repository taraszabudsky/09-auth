import { cookies } from 'next/headers';
import { nextServer } from './api';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';

export interface NotesResponse {
  notes: Note[];
  totalPages: number;
}

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

export const fetchNotes = async (
  page: number = 1,
  search: string = '',
  tag?: string,
): Promise<NotesResponse> => {
  const cookie = await getCookieHeader();
  const { data } = await nextServer.get<NotesResponse>('/notes', {
    params: {
      page,
      search,
      perPage: 12,
      ...(tag && tag !== 'All' ? { tag } : {}),
    },
    headers: { Cookie: cookie },
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookie = await getCookieHeader();
  const { data } = await nextServer.get<Note>(`/notes/${id}`, {
    headers: { Cookie: cookie },
  });
  return data;
};

export const getMe = async (): Promise<User> => {
  const cookie = await getCookieHeader();
  const { data } = await nextServer.get<User>('/users/me', {
    headers: { Cookie: cookie },
  });
  return data;
};

export const checkSession = async () => {
  const cookie = await getCookieHeader();
  const response = await nextServer.get('/auth/session', {
    headers: { Cookie: cookie },
  });
  return response;
};