import { createContext, useContext } from 'react';
import { client } from '@/utils/supabaseClient';
import { useAuth } from '@clerk/clerk-expo';
import { Board, Task, TaskList } from '@/types/enums';
export const BOARDS_TABLE = 'boards';
export const USER_BOARDS_TABLE = 'user_boards';
export const LISTS_TABLE = 'lists';
export const CARDS_TABLE = 'cards';
export const USERS_TABLE = 'users';

type ProviderProps = {
  userId: string | null;
  createBoard: (title: string) => Promise<any>;
  getBoards: () => Promise<any>;
  getBoardInfo: (boardId: string) => Promise<any>;
  updateBoard: (board: Board) => Promise<any>;
  deleteBoard: (id: string) => Promise<any>;
  getBoardLists: (boardId: string) => Promise<any>;
  addBoardList: (boardId: string, title: string, position?: number) => Promise<any>;
  updateBoardList: (list: TaskList) => Promise<any>;
  deleteBoardList: (id: string) => Promise<any>;
  getListCards: (listId: string) => Promise<any>;
  addListCard: (listId: string, boardId: string, title: string, position?: number) => Promise<any>;
  updateCard: (task: Task) => Promise<any>;
  deleteCard: (id: string) => Promise<any>;
  findUsers: (search: string) => Promise<any>;
  addUserToBoard: (boardId: string, userId: string) => Promise<any>;
};

const SupabaseContext = createContext<Partial<ProviderProps>>({});

export function useSupabase() {
  return useContext(SupabaseContext);
}

export const SupabaseProvider = ({ children }: any) => {
  const { userId } = useAuth();

  const createBoard = async (title: string) => {
    const { data, error } = await client.from(BOARDS_TABLE).insert({ title, creator: userId });

    if (error) {
      console.error('Error creating board:', error);
    }

    return data;
  };

  const getBoards = async () => {
    // const { data, error } = await client.from(BOARDS_TABLE).select('*').eq('creator', userId);

    // if (error) {
    //   console.error('Error getting boards:', error);
    // }

    // return data;
    const { data } = await client.from(USER_BOARDS_TABLE).select(
      `
      boards ( title, id, background )
    `
    );
    const boards = data?.map((b: any) => b.boards);

    return boards || [];
  };

  const getBoardInfo = async (boardId: string) => {
    const { data } = await client
      .from(BOARDS_TABLE)
      .select(`*, users (first_name)`)
      .match({ id: boardId })
      .single();
    return data;
  };

  const updateBoard = async (board: Board) => {
    const { data } = await client
      .from(BOARDS_TABLE)
      .update({ title: board.title })
      .match({ id: board.id })
      .select('*')
      .single();

    return data;
  };

  const deleteBoard = async (id: string) => {
    return await client.from(BOARDS_TABLE).delete().match({ id });
  };

  // CRUD Lists
  const getBoardLists = async (boardId: string) => {
    const lists = await client
      .from(LISTS_TABLE)
      .select('*')
      .eq('board_id', boardId)
      .order('position');

    return lists.data || [];
  };

  const addBoardList = async (boardId: string, title: string, position = 0) => {
    return await client
      .from(LISTS_TABLE)
      .insert({ board_id: boardId, position, title })
      .select('*')
      .single();
  };

  const updateBoardList = async (list: TaskList) => {
    return await client.from(LISTS_TABLE).update(list).match({ id: list.id });
  };

  const deleteBoardList = async (id: string) => {
    return await client.from(LISTS_TABLE).delete().match({ id: id });
  };

  // CRUD Cards
  const addListCard = async (listId: string, boardId: string, title: string, position = 0) => {
    console.log('Adding card:', { listId, boardId, title, position });

    return await client
      .from(CARDS_TABLE)
      .insert({ board_id: boardId, list_id: listId, title, position })
      .select('*')
      .single();
  };

  const getListCards = async (listId: string) => {
    const lists = await client
      .from(CARDS_TABLE)
      .select('*')
      .eq('list_id', listId)
      .order('position');

    return lists.data || [];
  };

  const updateCard = async (task: Task) => {
    return await client.from(CARDS_TABLE).update(task).match({ id: task.id });
  };

  const deleteCard = async (id: string) => {
    return await client.from(CARDS_TABLE).delete().match({ id: id });
  };

  const findUsers = async (search: string) => {
    // Use the search_users stored procedure to find users by email
    const { data } = await client.rpc('search_users', { search: search });
    return data;
  };

  const addUserToBoard = async (boardId: string, userId: string) => {
    return await client.from(USER_BOARDS_TABLE).insert({
      user_id: userId,
      board_id: boardId,
    });
  };

  const value = {
    userId,
    createBoard,
    getBoards,
    getBoardInfo,
    updateBoard,
    deleteBoard,
    getBoardLists,
    addBoardList,
    updateBoardList,
    deleteBoardList,
    getListCards,
    addListCard,
    updateCard,
    deleteCard,
    findUsers,
    addUserToBoard,
  };

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
};
