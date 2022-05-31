const bcrypt = require('bcryptjs')

class Server {
    constructor() {
        this.database = null
        this.start()
        this.validateInstance = async (token, instance) => {
            if (token) {
                const result = {}

                if (instance == 'user') {

                    let { rows } = await this.database.query(`
                    SELECT * FROM LoggedUsers
                    WHERE token='${token}'
                    `)

                    if (rows[0]) {
                        result.status = true
                        result.id_instance = rows[0].id_user
                    }
                }

                if (instance == 'place') {
                    let { rows } = await this.database.query(`
                    SELECT * FROM LoggedPlaces
                    WHERE token='${token}'
                    `)

                    if (rows[0]) {
                        result.status = true
                        result.id_instance = rows[0].id_place
                    }
                }
                
                return result
            }
        }
    }

    createToken() {
        const higher_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        const lower_chars = 'abcdefghijklmnopqrstuvwxyz'.split('')
        const numbers = '1234567890'.split('')

        const token = (() => {
            let token_string = ''
            for (let i = 0; i < 16; i++) {
                let typeList = Math.floor(Math.random() * 3)
                if (typeList == 0) token_string += higher_chars[Math.floor(Math.random() * 26)]
                if (typeList == 1) token_string += lower_chars[Math.floor(Math.random() * 26)]
                if (typeList == 2) token_string += numbers[Math.floor(Math.random() * 10)]
            }

            return token_string
        })()

        return token
    }

    async start() {
        this.database = await this.connectDatabase()
        await this.createTables()
    }

    async connectDatabase() {
        const { Client } = require('pg')

        console.log('connecting to database...')

        const client = new Client({
            host: 'localhost',
            database: 'projeto-bolsa',
            user: 'postgres',
            password: 'joaodev',
            port: 5432
        })

        await client.connect()

        console.log('connected!')

        return client
    }

    async createTables() {

        try {
            await this.database.query(
            `
            CREATE TABLE IF NOT EXISTS Users (
                id serial PRIMARY KEY, 
                username VARCHAR NOT NULL,
                email VARCHAR NOT NULL, 
                password_hash VARCHAR NOT NULL
            );`
            )

            await this.database.query(`
            CREATE TABLE IF NOT EXISTS Places (
                id serial PRIMARY KEY,
                placename VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                password_hash VARCHAR NOT NULL,
                address VARCHAR NOT NULL,
                city VARCHAR NOT NULL
            )`)
    
            await this.database.query(`CREATE TABLE IF NOT EXISTS Comments (
                id SERIAL PRIMARY KEY,
                id_user INTEGER NOT NULL,
                id_place INTEGER NOT NULL,
                comment VARCHAR,
                timestamp TIMESTAMP
            )`)
    
            await this.database.query(`CREATE TABLE IF NOT EXISTS Photos (
                id SERIAL PRIMARY KEY,
                id_place INTEGER NOT NULL,
                photo_url VARCHAR
            )`)
    
            await this.database.query(`CREATE TABLE IF NOT EXISTS LoggedPlaces (
                id SERIAL PRIMARY KEY,
                id_place INTEGER NOT NULL,
                token VARCHAR NOT NULL
            )`)
    
            await this.database.query(`CREATE TABLE IF NOT EXISTS LoggedUsers (
                id SERIAL PRIMARY KEY,
                id_user INTEGER NOT NULL,
                token VARCHAR NOT NULL
            )`)
    
        } catch(e) {
            console.log(e)
        }
        

        
        return true
    }

    async createUser({username, password, email}) {
        try {
            const passwordHash = await bcrypt.hash(password, 8)
            await this.database.query(`
            INSERT INTO Users (username, email, password_hash)
            VALUES ('${username}', '${email}' , '${passwordHash}')
            RETURNING *
            `)

            return true
        } catch(e) {
            console.log(e)
            return false
        }
        
    } 

    // IMPLEMENTAR A ADIÇÃO DE FOTOS 
    async createPlace({placename, email, password, photos, address, city}) {
        const passwordHash = await bcrypt.hash(password, 8)

        try {
            const {rows} = await this.database.query(`
            INSERT INTO Places (placename, email, password_hash, address, city)
            VALUES ('${placename}', '${email}' ,'${passwordHash}', '${address}', '${city}')
            RETURNING *
            `)

            photos.forEach(async photo => {
                await this.database.query(`
                INSERT INTO Photos (id_place, photo_url)
                VALUES (${rows[0].id}, '${photo}')
                `)
            })

        } catch (error) {
            console.log(error)
        }
    }

    async createComment({token, id_place, comment, grade, timestamp}) {
        const result = this.validateInstance(token, 'user')

        if (result.status) {
            await this.database.query(`
            INSERT INTO Comments (id_user, id_place, comment, grade, timestamp)
            VALUES (${result.id_instance}, ${id_place}, ${comment}, ${grade}, ${timestamp})
            `)
        }
    }

    async getUser({id, token}) {

        if (id) {
            let { rows } = await this.database.query(`
            SELECT * FROM Users
            WHERE id = ${id}
            `)

            rows.forEach(row => {
                row.email = null
                row.password_hash = null
            })

            return rows

        } else if (token) {
            const loggedUser = await this.database.query(`
            SELECT * FROM LoggedUsers 
            WHERE token = '${token}'
            `)

            console.log(loggedUser.rows[0].id_user)

            const user = await this.database.query(`
            SELECT * FROM Users
            WHERE id = ${loggedUser.rows[0].id_user}
            `)

            user.rows[0].password_hash = null

            return user.rows[0]
        }

    }

    async getUsers() {

        const { rows } = await this.database.query(`
        SELECT * FROM Users
        `)

        rows.forEach(row => {
            row.email = null
            row.password_hash = null
        })

        return rows
    }

    async getPlaces({city}) {
        let { rows } = await this.database.query(`
        SELECT * FROM Places
        WHERE city = '${city}'
        `)

        rows.forEach(async (row) => {
            row.password_hash = null
            const photos = await this.database.query(`
            SELECT photo_url FROM Photos
            WHERE id_place = ${row.id}
            `)
            console.log(photos)
        })

        return rows
    }

    async getPlace({id}) {
        const { rows } = await this.database.query(`
        SELECT * FROM Places
        WHERE id = ${id}
        `)

        rows.forEach((row) => {
            row.password_hash = null
        })

        console.log(rows)

        return rows
    }

    async getComments({id_place}) {
        let { rows } = await this.database.query(`
        SELECT * FROM Comments
        WHERE id = ${id_place}
        `)

        return rows
    }

    async updateUser({token, dataToUpdate}) {
        const {status, id_instance} = await this.validateInstance(token, 'user')

        if (status) {
            const keys = Object.keys(dataToUpdate)

            keys.forEach( async key => {

                if (key != 'password')
                    await this.database.query(`
                    UPDATE Users
                    SET ${key} = '${dataToUpdate[key]}'
                    WHERE id = ${id_instance}
                    `)
                else {
                    if (dataToUpdate.password !== '') return { status: false}
                    const passwordHash = await bcrypt.hash(dataToUpdate[key], 8)
                    await this.database.query(`
                    UPDATE Users
                    SET password_hash = '${passwordHash}'
                    WHERE id = ${id_instance}
                    `)
                }

            })

            return {
                status: true,
            }
        }

        return {
            status: false
        }
    }

    // IMPLEMENTAR ALTERAÇÃO DE FOTOS
    async updatePlace({token, dataToUpdate}) {
        const {status, id_instance} = this.validateInstance(token, 'place')

        delete dataToUpdate.token
        
        if (status) {
            const keys = Object.keys(dataToUpdate)

            keys.forEach( async key => {

                if (key != 'password')
                    await this.database.query(`
                    UPDATE Users
                    SET ${key} = "${dataToUpdate[key]}"
                    `)
                else {
                    const passwordHash = await bcrypt.hash(dataToUpdate[key], 8)
                    await this.database.query(`
                    UPDATE Users
                    SET password_hash = "${passwordHash}"
                    `)
                }

            })
        }
    }

    async updateComment({id_comment, token, comment, grade}) {
        const {status, id_instance} = this.validateInstance(token, 'user')

        if (status) {
            await this.database.query(`
            UPDATE Comments
            SET comment = "${comment}",
            timestamp = ${new Date().toJSON()},
            grade = ${grade}
            WHERE id = ${id_comment} AND id_user = ${id_instance}
            `)

            return {status: true}
        }

        return {status: false}
    }

    async deleteUser({token}) {
        const {status, id_instance} = await this.validateInstance(token, 'user')

        if (status) {
            await this.database.query(`
            DELETE FROM Users
            WHERE id = ${id_instance}
            `)

            return {status: true}
        }

        return {status: false}
    }

    async deletePlace({token}) {
        const {status, id_instance} = this.validateInstance(token, 'user')

        if (status) {
            await this.database.query(`
            DELETE FROM Places
            WHERE id = ${id_instance}
            `)

            return {status: true}
        }

        return { status: false }
    }

    async deleteComment({id_comment, token}) {
        const {status, id_instance} = this.validateInstance(token, 'user')

        if (status) {
            await this.database.query(`
            DELETE FROM Comments
            WHERE id_user = ${id_instance} AND id = ${id_comment}
            `)

            return { status: true }
        }

        return { status: false }
    }

    async authenticateUser({email, password}) {
        let obj
        try {
            obj = await this.database.query(`
            SELECT * FROM Users WHERE email = '${email}'
            `)
        } catch (e) {
            console.log('The error is here')
        }
        let row = obj.rows[0]

        if (row.email) {
            let match = await bcrypt.compare(password, row.password_hash)

            if (match) {
                const token = this.createToken()

                await this.database.query(`
                INSERT INTO LoggedUsers (id_user, token)
                VALUES (${row.id}, '${token}')
                `)
                console.log('User was found')
                return {token, success: true}
            }
        }

        return {success: false}

    }

    async authenticatePlace({email, password}) {
        let {rows} = await this.database.query(`
        SELECT * FROM Places
        `)

        for (let i = 0; i < rows.lenght; i++) {
            if (rows[i].email === email && bcrypt.compare(password, rows[i].password_hash)) {
                const token = this.createToken()

                await this.database.query(`
                INSERT INTO LoggedPlace (id_place, token)
                VALUES (${rows[i].id_user}, "${token}")
                `)

                return token
            }
        }
    }

    async authenticateToken({token}) {
        const user = await this.database.query(`
        SELECT id_user FROM LoggedUsers
        WHERE token='${token}'
        `)
        console.log(user)

        const place = await this.database.query(`
        SELECT id_place FROM LoggedPlaces
        WHERE token='${token}'
        `)

        if (user.rows[0]) {
            let { rows } = await this.database.query(`
            SELECT * FROM Users
            WHERE id = ${user.rows[0].id_user}
            `)

            if (rows[0]) {
                return { authorized: true, isUser: true }
            }

            return { authorized: false }
        }

        else if (place.rows[0]) {

            let { rows } = await this.database.query(`
            SELECT * FROM Users
            WHERE id = ${user.rows[0].id_user}
            `)

            if (rows[0]) {
                return { authorized: true, isUser: false }
            }

            return { authorized: false }
        }
    }

}

module.exports = new Server()