import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  activeConversationId: string | null;
  toggleChat: (open?: boolean) => void;
  setActiveConversation: (id: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  activeConversationId: null,
  toggleChat: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
