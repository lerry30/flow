export const requestHandler = (controller) => {
    return async (req, res, next) => {
        try {
            await controller(req, res, next); 
        } catch(error) {
            let message = error?.message;
            let status = error?.status || 500;
            if(error instanceof Error) message = 'There\'s something wrong.';

            console.log(status, message);
            res.status(status).json({message});
        }
    }
}
