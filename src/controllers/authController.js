import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });

        const payload = { user: { id: user._id, role: user.role } };

        jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
            if (err) throw err;
            res.json({token, userId: user._id, role: user.role});
        }
        );
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
}

export const register = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const exist = await User.findOne({username});
        if(exist) return res.status(400).json({msg: 'Nombre de usuario existente, utilice otro por favor.'});

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role: role
        })

        await newUser.save();
        return res.status(201).json(newUser);
    } catch (error) {
    res.status(400).json({ msg: error.message });
    }
}
