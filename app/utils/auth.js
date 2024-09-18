import { sendJSON } from '@/utils/send';

export const authUserInput = (userData, setError, exclusion=[]) => {
    let stop = false;
    for(const field in userData) {
        if(!exclusion.includes(field)) {
            if(!userData[field]) {
                let nField = field === 'firstname' || field === 'lastname' ? field.replace('name', ' name') : field;
                nField = `${nField[0].toUpperCase()}${nField.substring(1)}`;
                setError(data => ({...data, [field]: `${nField} is empty.`}));
                stop = true;
            }
        }
    }

    return stop;
}

export const authUser = async ({ userData, setError, callback, url }) => {
    try {
        const shouldStop = authUserInput(userData, setError);
        if(shouldStop) throw new Error('Empty Fields');
        
        const response = await sendJSON(url, userData, 'POST');
        if(Object.values(response).length > 0) callback(response);
    } catch(error) {
        const message = error?.message || 'There\'s something wrong.';
        setError(data => ({...data, server: message}));
        console.log('Function authUser ', message);
    }
}
