import { nextServer } from './api';
import type { Note, CreateNote } from '@/types/note';
import type { User } from '@/types/user';

export interface NotesResponse {
  notes: Note[];
  totalPages: number;
}

export const fetchNotes = async (
  page: number = 1,
  search: string = '',
  tag?: string,
): Promise<NotesResponse> => {
  const { data } = await nextServer.get<NotesResponse>('/notes', {
    params: {
      page,
      search,
      perPage: 12,
      ...(tag && tag !== 'All' ? { tag } : {}),
    },
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await nextServer.get<Note>(`/notes/${id}`);
  return data;
};

export const createNote = async (note: CreateNote): Promise<Note> => {
  const { data } = await nextServer.post<Note>('/notes', note);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await nextServer.delete<Note>(`/notes/${id}`);
  return data;
};

export const register = async (payload: {
  email: string;
  password: string;
}): Promise<User> => {
  const { data } = await nextServer.post<User>('/auth/register', payload);
  return data;
};

export const login = async (payload: {
  email: string;
  password: string;
}): Promise<User> => {
  const { data } = await nextServer.post<User>('/auth/login', payload);
  return data;
};

export const logout = async (): Promise<void> => {
  await nextServer.post('/auth/logout');
};

export const checkSession = async (): Promise<boolean> => {
  const { data } = await nextServer.get('/auth/session');
  return Boolean(data);
};

export const getMe = async (): Promise<User> => {
  const { data } = await nextServer.get<User>('/users/me');
  return data;
};

export const updateMe = async (payload: {
  username: string;
}): Promise<User> => {
  const { data } = await nextServer.patch<User>('/users/me', payload);
  return data;
};