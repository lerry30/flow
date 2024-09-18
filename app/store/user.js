import { create } from 'zustand';

export const zUser = create(set => ({
    id: '',
    firstname: '',
    lastname: '',
    username: '',

    setUser: (user) => {
        const { id, firstname, lastname, username } = user;
        if(!id || !firstname || !lastname || !username) {
            return {ok: false, message: 'Unable to save user due to undefined properties.'};
        }

        set(user);
        return {ok: true, message: 'User data successfully saved.'};
    },

    removeAllData: () => {
        set({ id: '', firstname: '', lastname: '', username: '' });
    }
}));
