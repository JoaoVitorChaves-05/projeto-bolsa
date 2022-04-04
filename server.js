const bcrypt = require('bcriptjs')

class Server {
    constructor() {
        this.database = this.connectDatabase()
        this.createTables()
        this.validateInstance = async (token, instance) => {
            if (token) {
                const result = {}

                if (instance == 'user') {

                    let { rows } = await this.database.query(`
                    SELECT * FROM LoggedUser
                    WHERE token='${token}'
                    `)

                    if (rows[0]) {
                        result.status = true
                        result.id_instance = rows[0].id_user
                    }
                }

                if (instance == 'place') {
                    let { rows } = await this.database.query(`
                    SELECT * FROM LoggedPlace
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

    async connectDatabase() {
        const { Client } = require('pg')

        const client = new Client({
            host: 'localhost',
            database: 'projeto-bolsa',
            user: 'postgres',
            password: 'joaodev',
            port: 5432
        })

        await client.connect()

        return client
    }

    async createTables() {

        await this.database.query(`CREATE TABLE IF NOT EXISTS User (
            id SERIAL PRIMARY KEY,
            username VARCHAR NOT NULL,
            email VARCHAR NOT NULL,
            password_hash VARCHAR NOT NULL
        )`)

        await this.database.query(`CREATE TABLE IF NOT EXISTS Place (
            id SERIAL PRIMARY KEY,
            placename VARCHAR NOT NULL,
            email VARCHAR NOT NULL,
            password_hash VARCHAR NOT NULL,
            address VARCHAR NOT NULL,
            city VARCHAR NOT NULL
        )`)

        await this.database.query(`CREATE TABLE IF NOT EXISTS Comment (
            id SERIAL PRIMARY KEY,
            id_user INTEGER NOT NULL,
            id_place INTEGER NOT NULL,
            comment VARCHAR,
            timestemp TIMESTEMP
        )`)

        await this.database.query(`CREATE TABLE IF NOT EXISTS Photo (
            id SERIAL PRIMARY KEY,
            id_place INTEGER NOT NULL,
            photo_url VARCHAR
        )`)

        await this.database.query(`CREATE TABLE IF NOT EXISTS LoggedPlace (
            id SERIAL PRIMARY KEY,
            id_place INTEGER NOT NULL,
            token VARCHAR NOT NULL
        )`)

        await this.database.query(`CREATE TABLE IF NOT EXISTS LoggedUser (
            id SERIAL PRIMARY KEY,
            id_user INTEGER NOT NULL,
            token VARCHAR NOT NULL
        )`)
    }

    async createUser({username, password, email}) {
        const passwordHash = await bcrypt.hash(password, 8)
        await this.database.query(`
        INSERT INTO User (username, email, password_hash)
        VALUES ('${username}', '${email} ,'${passwordHash}')
        `)
    } 

    // IMPLEMENTAR A ADIÇÃO DE FOTOS 
    async createPlace({placename, email, password, photos}) {
        const passwordHash = await bcrypt.hash(password, 8)

        await this.database.query(`
        INSERT INTO Place (placename, email, password_hash)
        VALUES ('${placename}', '${email} ,'${passwordHash}')
        `)

        /*
        for (let photo of photos) {
            await this.database.query(`
            INSERT INTO Photo (id_place, photo_url)
            VALUES (${id_place}, '${photo}')
            `)
        }
        */

    }

    async createComment({token, id_place, comment, grade, timestemp}) {
        const result = this.validateInstance(token, 'user')

        if (result.status) {
            await this.database.query(`
            INSERT INTO Comment (id_user, id_place, comment, grade, timestemp)
            VALUES (${result.id_instance}, ${id_place}, ${comment}, ${grade}, ${timestemp})
            `)
        }
    }

    async getUser({id, token}) {

        if (id) {
            let { rows } = await this.database.query(`
            SELECT * FROM User
            WHERE id = ${id}
            `)

            rows.forEach(row => {
                row.email = null
                row.password_hash = null
            })

            return rows

        } else if (token) {
            let { rows } = await this.database.query(`
            SELECT * FROM LoggedUser 
            WHERE token = ${token}
            `)

            rows[0].password_hash = null

            return rows
        }

    }

    async getUsers() {

        let { rows } = await this.database.query(`
        SELECT * FROM User
        `)

        rows.forEach(row => {
            row.email = null
            row.password_hash = null
        })

        res.json(rows)
    }

    async getPlaces({city}) {
        let { rows } = await this.database.query(`
        SELECT * FROM Place
        WHERE city = '${city}'
        `)

        rows.forEach(row => {
            row.password_hash = null
        })

        return rows
    }

    async getPlace({id}) {
        let { rows } = await this.database.query(`
        SELECT id FROM Place
        WHERE id = ${id}
        `)

        return rows
    }

    async getComments({id_place}) {
        let { rows } = await this.database.query(`
        SELECT * FROM Comment
        WHERE id = ${id_place}
        `)

        return rows
    }

    async updateUser({token, dataToUpdate}) {
        const {status, id_instance} = this.validateInstance(token, 'user')

        if (status) {
            const keys = Object.keys(dataToUpdate)

            keys.forEach( async key => {

                if (key != 'password')
                    await this.database.query(`
                    UPDATE User
                    SET ${key} = "${dataToUpdate[key]}"
                    WHERE id = ${id_instance}
                    `)
                else {
                    const passwordHash = await bcrypt.hash(dataToUpdate[key], 8)
                    await this.database.query(`
                    UPDATE User
                    SET password_hash = "${passwordHash}"
                    WHERE id = ${id_instance}
                    `)
                }

            })

            return {
                status: 'success'
            }
        }

        return {
            status: 'erro'
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
                    UPDATE User
                    SET ${key} = "${dataToUpdate[key]}"
                    `)
                else {
                    const passwordHash = await bcrypt.hash(dataToUpdate[key], 8)
                    await this.database.query(`
                    UPDATE User
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
            UPDATE Comment
            SET comment = "${comment}",
            timestemp = ${new Date().toJSON()},
            grade = ${grade}
            WHERE id = ${id_comment} AND id_user = ${id_instance}
            `)
        }
    }

    async deleteUser({token}) {
        const {status, id_instance} = this.validateInstance(token, 'user')

        if (status) {
            await this.database.query(`
            DELETE FROM User 
            WHERE id = ${id_instance}
            `)
        }
    }

    async deletePlace({token}) {
        const {status, id_instance} = this.validateInstance(token, 'user')

        if (status) {
            await this.database.query(`
            DELETE FROM Place 
            WHERE id = ${id_instance}
            `)
        }
    }

    async deleteComment({id_comment, token}) {
        const {status, id_instance} = this.validateInstance(token, 'user')

        if (status) {
            await this.database.query(`
            DELETE FROM Comment 
            WHERE id_user = ${id_instance} AND id = ${id_comment}
            `)
        }
    }

    async authenticateUser({email, password}) {
        let {rows} = await this.database.query(`
        SELECT * FROM User
        `)

        for (let i = 0; i < rows.lenght; i++) {
            if (rows[i].email === email && bcrypt.compare(password, rows[i].password_hash)) {
                const token = this.createToken()

                await this.database.query(`
                INSERT INTO LoggedUser (id_user, token)
                VALUES (${rows[i].id_user}, "${token}")
                `)

                return token
            }
        }

    }

    async authenticatePlace({email, password}) {
        let {rows} = await this.database.query(`
        SELECT * FROM Place
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
        SELECT id_user FROM LoggedUser
        WHERE token='${token}'
        `)

        const place = await this.database.query(`
        SELECT id_place FROM LoggedPlace
        WHERE token='${token}'
        `)

        if (user.rows.lenght) {

            let { rows } = await this.database.query(`
            SELECT * FROM User
            WHERE id = ${user.rows[0].id_user}
            `)

            return rows[0]
        }

        else if (place.rows.lenght) {

            let { rows } = await this.database.query(`
            SELECT * FROM User
            WHERE id = ${user.rows[0].id_user}
            `)

            return rows[0]
        }
    }

}

module.exports = new Server()