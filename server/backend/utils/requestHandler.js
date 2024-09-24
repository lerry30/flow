export const requestHandler = (controller) => {
    return async (req, res, next) => {
        try {
            await controller(req, res, next); 
        } catch(error) {
            let message = error?.message;
            let status = error?.status || 500;
            console.log('Error: ', message);
            if(error instanceof Error) message = 'There\'s something wrong.';

            res.status(status).json({message});
        }
    }
}
