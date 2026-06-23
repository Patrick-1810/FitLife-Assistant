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
            content: ''
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
                    content: ''
                },
                all: []
            }
        },
        addList: (state, { payload }) => {
            const { _id, items } = payload
            state._id = Number(_id)
      
            state.all = items.map(item => ({
                id: Number(item.id),
                prompt: item.prompt,
                content: item.content
            }))
            return state
        },
        insertNew: (state, { payload }) => {
            const { chatsId, content = null,
                resume = false, fullContent = null,
                _id = null, prompt = null } = payload

            if (_id) {
                state._id = Number(_id)
            }

            const targetId = chatsId ? Number(chatsId) : (_id ? Number(_id) : null);
            state.latest.id = targetId

            if (prompt) {
                state.latest.prompt = prompt
            }

            const addToList = (latest) => {
                const numId = Number(latest.id)
                
                const existing = state['all'].find(obj => Number(obj.id) === numId)
                if (existing) {
                    state['all'].forEach(obj => {
                        if (Number(obj.id) === numId) {
                            obj.content = latest.content
                        }
                    })
                } else {
                    state['all'].push({
                        id: numId,
                        prompt: latest.prompt,
                        content: latest.content
                    })
                }
            }

            if (content && resume) {
                state.latest.content += content
                addToList(state.latest)

            } else if (content) {
                state.latest.content = content
                addToList(state.latest)
            }

            if (fullContent) {
                state.content = fullContent
            }

            return state
        },
        livePrompt: (state, { payload }) => {
            state.prompt = payload
            return state
        }
    }
})

export const { emptyAllRes, insertNew, livePrompt, addList } = messagesSlice.actions
export default messagesSlice.reducer