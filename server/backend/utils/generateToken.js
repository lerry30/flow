import jwt from 'jsonwebtoken';

const generateToken = (value) => {
    const token = jwt.sign({ value }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    return token;
}

export default generateToken;
