const db = require('../config/database');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { object, string, date } = require('yup');

const validTypes = ["admin", "usuario"];

let UserSchema = object({
    nombre: string().required("Nombre es obligatorio"),
    apellido: string().required("Apellido es obligatorio"),
    email: string().email("Email no es válido").required("Email obligatorio"),
    password: string()
        .min(5, "La contraseña debe contener al menos 5 caracteres")
        .required("Contraseña es obligatoria")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/,
            "La contraseña debe tener al menos una letra mayúscula, una minúscula y un número"
        ),
    type: string().required("Tipo es obligatorio")
});

const UserSchemaEdit = object({
    nombre: string().required("Nombre es obligatorio"),
    apellido: string().required("Apellido es obligatorio"),
    email: string().email("Email no es válido").required("Email obligatorio"),
    password: string()
        .min(5, "La contraseña debe tener al menos 5 caracteres")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/,
            "La contraseña debe tener al menos una letra mayúscula, una minúscula y un número"
        )
        .notRequired(), // ← porque es opcional
});

const createUser = async (req, res) => {
    const conn = db.promise();

    try {
        // Validación del esquema
        await UserSchema.validate(req.body, { abortEarly: false });

        // Verificar si el email ya existe
        const [existing] = await conn.query(`SELECT * FROM users WHERE email = ?`, [req.body.email]);
        if (existing.length > 0) {
            return res.status(400).json({ Email: 'Correo ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Insertar nuevo usuario
        await conn.query(
            `INSERT INTO users (nombre, apellido, email, password, type) VALUES (?, ?, ?, ?, ?)`,
            [req.body.nombre, req.body.apellido, req.body.email, hashedPassword, req.body.type]
        );

        return res.status(200).json({ message: "Usuario creado exitosamente" });

    } catch (error) {
        if (error.inner) {
            const formattedErrors = error.inner.reduce((acc, err) => {
                acc[err.path] = err.message;
                return acc;
            }, {});
            return res.status(400).json(formattedErrors);
        }

        console.error('Error:', error);
        return res.status(500).json({ Error: 'Error en el servidor' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ Error: "Email y contraseña son obligatorios" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        try {
            if (err) throw err;

            if (results.length === 0) {
                return res.status(404).json({ Error: "Credenciales incorrectas" });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ Error: "Credenciales incorrectas" });
            }

            const token = jwt.sign(
                { userId: user.id, Type: user.type },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "72h" }
            );

            res.cookie('Authorization', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 3600000 * 72
            });

            res.cookie('Type', user.type, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 3600000 * 72
            });

            return res.status(200).json({ message: "Sesión iniciada correctamente" });

        } catch (queryError) {
            console.error("Error en la consulta:", queryError);
            return res.status(500).json({ Error: "Error en el servidor" });
        }
    });
};


const logout = async (req, res) => {
    res.clearCookie('Authorization', {
        httpOnly: true,
        sameSite: 'strict',
        //secure: process.env.NODE_ENV === 'production'
    });

    res.clearCookie('Type', {
        httpOnly: true,
        sameSite: 'strict',
        //secure: process.env.NODE_ENV === 'production'
    });

    res.json({ message: 'Logout exitoso.' });
};

const protected = async (req, res) => {
    const token = req.cookies.Authorization;
    const type = req.cookies.Type;
    if (!token || !type) return res.status(401).json({ Error: 'Acceso denegado' });
    try {
        const decoded = await jwt.verify(token, 'secret');
        res.json({ message: 'Acceso concedido' });
    } catch (error) {
        res.status(401).json({ Error: 'Invalid token' });
    }
}

const getUser = async (req, res) => {
    const ID = req.userId;

    try {
        db.query(
            "SELECT ID, nombre, apellido, email, type FROM users WHERE ID = ?",
            [ID],
            (err, results) => {
                if (err) {
                    console.error('Error en la consulta:', err);
                    return res.status(500).json({ Error: 'Error en la consulta' });
                }
                return res.status(200).json(results[0]);
            }
        );
    } catch (error) {
        console.error("Error en getUser:", error);
        return res.status(500).json({ Error: "Error interno del servidor" });
    }
};

const getUsers = async (req, res) => {
    if (req.userType !== "admin") return res.status(403).json({ Error: 'Acceso denegado' });

    try {
        db.query("SELECT ID, nombre, apellido, email, type FROM users", (err, results) => {
            if (err) return res.status(500).json({ Error: "Error en la consulta" });
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en getUsers:", error);
        return res.status(500).json({ Error: "Error interno del servidor" });
    }
};

const modify = async (req, res) => {
    const conn = db.promise();

    try {
        await UserSchemaEdit.validate(req.body, { abortEarly: false });

        const { nombre, apellido, email, password } = req.body;
        const ID = req.userId;

        const [existing] = await conn.query(
            "SELECT * FROM users WHERE email = ? AND ID != ?",
            [email, ID]
        );
        if (existing.length > 0) {
            return res.status(400).json({ email: 'Correo ya existe' });
        }

        let updateFields = [];
        let values = [];

        if (nombre) {
            updateFields.push("nombre = ?");
            values.push(nombre);
        }
        if (apellido) {
            updateFields.push("apellido = ?");
            values.push(apellido);
        }
        if (email) {
            updateFields.push("email = ?");
            values.push(email);
        }
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updateFields.push("password = ?");
            values.push(hashed);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ Error: "No se enviaron cambios para actualizar" });
        }

        values.push(ID);

        await conn.query(`UPDATE users SET ${updateFields.join(", ")} WHERE ID = ?`, values);

        return res.status(200).json({ message: "Tus datos fueron actualizados correctamente" });

    } catch (error) {
        if (error.inner) {
            const formattedErrors = error.inner.reduce((acc, err) => {
                acc[err.path] = err.message;
                return acc;
            }, {});
            return res.status(400).json(formattedErrors);
        }

        console.error("Error en modify:", error);
        return res.status(500).json({ Error: "Error interno del servidor" });
    }
};

module.exports = { createUser, login, logout, getUser, getUsers, modify, protected };