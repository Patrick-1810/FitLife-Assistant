import { createSlice } from "@reduxjs/toolkit";

let messagesSlice = createSlice({
    name: 'messages',
    initialState: {
        prompt: '',
        content: '',
        _id: null,
        latest: {
            id: null,
            prompt: '',
            content: '',
            image: null // Guarda a imagem provisória (blob local) durante o envio
        },
        all: []
    },
    reducers: {
        emptyAllRes: () => {
            return {
                prompt: '',
                content: '',
                _id: null,
                latest: {
                    id: null,
                    prompt: '',
                    content: '',
                    image: null
                },
                all: []
            }
        },
        addList: (state, { payload }) => {
            const { _id, items } = payload;
            // Garante que o ID ativo no estado global seja guardado sempre como número inteiro
            state._id = Number(_id);
            
            // Mapeia o histórico do banco de dados unificando os IDs e injetando a imagem se houver
            state.all = items.map(item => ({
                id: Number(item.id),
                prompt: item.prompt,
                content: item.content,
                image: item.image || null
            }));
            return state;
        },
        insertNew: (state, { payload }) => {
            const { chatsId, content = null,
                resume = false, fullContent = null,
                _id = null, prompt = null, image = null } = payload; // Recebe o parâmetro image do formulário

            if (_id) {
                state._id = Number(_id);
            }

            // Normaliza o ID temporário ou definitivo para numérico, evitando o bug de String vs Int
            const targetId = chatsId ? Number(chatsId) : (_id ? Number(_id) : null);
            state.latest.id = targetId;

            if (prompt) {
                state.latest.prompt = prompt;
            }

            // Mantém a referência estável do link da imagem local no estado ativo
            if (image) {
                state.latest.image = image;
            }

            const addToList = (latest) => {
                const numId = Number(latest.id);
                // Busca se a mensagem provisória já está na listagem corrente
                const existing = state['all'].find(obj => Number(obj.id) === numId);
                
                if (existing) {
                    state['all'].forEach(obj => {
                        if (Number(obj.id) === numId) {
                            obj.content = latest.content;
                            // Sincroniza e atualiza a imagem no histórico local da conversa
                            if (latest.image) obj.image = latest.image; 
                        }
                    });
                } else {
                    state['all'].push({
                        id: numId,
                        prompt: latest.prompt,
                        content: latest.content,
                        image: latest.image || null // Fixa a imagem no balão do usuário da sessão
                    });
                }
            };

            if (content && resume) {
                state.latest.content += content;
                addToList(state.latest);

            } else if (content) {
                state.latest.content = content;
                addToList(state.latest);
            }

            if (fullContent) {
                state.content = fullContent;
            }

            return state;
        },
        livePrompt: (state, { payload }) => {
            state.prompt = payload;
            return state;
        }
    }
});

export const { emptyAllRes, insertNew, livePrompt, addList } = messagesSlice.actions;
export default messagesSlice.reducer;