const bcrypt = require('bcryptjs')
const fs = require('fs')

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
                        result.success = true
                        result.id_instance = rows[0].id_user
                    }
                }

                if (instance == 'place') {
                    let { rows } = await this.database.query(`
                    SELECT * FROM LoggedPlaces
                    WHERE token='${token}'
                    `)

                    if (rows[0]) {
                        result.success = true
                        result.id_instance = rows[0].id_place
                        result.isUser = false
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

    createFilename(extension) {
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

        return token + '.' + extension
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
            database: 'projeto_bolsa',
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
                id_city INTEGER NOT NULL,
                latitude FLOAT8 NOT NULL,
                longitude FLOAT8 NOT NULL
            )`)
    
            await this.database.query(`CREATE TABLE IF NOT EXISTS Comments (
                id SERIAL PRIMARY KEY,
                id_user INTEGER NOT NULL,
                id_place INTEGER NOT NULL,
                comment VARCHAR,
                entranceGrade INTEGER NOT NULL,
                bathroomGrade INTEGER NOT NULL,
                interiorGrade INTEGER NOT NULL,
                parkingGrade INTEGER NOT NULL,
                timestamp TIMESTAMP
            )`)

            await this.database.query(`CREATE TABLE IF NOT EXISTS Feedback (
                id SERIAL PRIMARY KEY,
                id_comment INTEGER NOT NULL,
                feedback VARCHAR NOT NULL,
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

            await this.database.query(`CREATE TABLE IF NOT EXISTS Cities (
                id SERIAL PRIMARY KEY,
                latitude FLOAT8 NOT NULL,
                longitude FLOAT8 NOT NULL,
                name VARCHAR NOT NULL
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

    // IMPLEMENTAR A ADIÇÃO DE FOTOS - IMPLEMENTADO
    async createPlace({placename, email, password, photos, address, id_city, position}) {
        const passwordHash = await bcrypt.hash(password, 8)

        try {
            const {rows} = await this.database.query(`
            INSERT INTO Places (placename, email, password_hash, address, id_city, latitude, longitude)
            VALUES ('${placename}', '${email}' ,'${passwordHash}', '${address}', ${id_city}, ${position.latitude}, ${position.longitude})
            RETURNING *
            `)

            try {
                photos.forEach(async photo => {
                    const filename = this.createFilename(photo.name.split('.')[photo.name.split('.').length - 1])
                    const url = './public/uploads/' + filename
                    photo.mv(url, async (err) => {
                        if (err) return err
                        await this.database.query(`
                        INSERT INTO Photos (id_place, photo_url)
                        VALUES (${rows[0].id}, '${'/uploads/' + filename}')
                        `)
                    })
                })
            } catch {
                console.log(photos)
                const filename = this.createFilename(photos.name.split('.')[photos.name.split('.').length - 1])
                const url = './public/uploads/' + filename
                photos.mv(url, async (err) => {
                    if (err) return err
                    await this.database.query(`
                    INSERT INTO Photos (id_place, photo_url)
                    VALUES (${rows[0].id}, '${'/uploads/' + filename}')
                    `)
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    async createComment({token, id_place, comment, entranceGrade, bathroomGrade, interiorGrade, parkingGrade, timestamp}) {
        const result = await this.validateInstance(token, 'user')

        if (result.success) {
            await this.database.query(`
            INSERT INTO Comments (id_user, id_place, comment, entranceGrade, bathroomGrade, interiorGrade, parkingGrade, timestamp)
            VALUES (${result.id_instance}, ${id_place}, '${comment}', ${entranceGrade}, ${bathroomGrade}, ${interiorGrade}, ${parkingGrade}, '${timestamp}')
            `)

            return {
                success: true
            }
        }

        return { success: false }
    }

    async createFeedback({token, feedback, timestamp, id_comment}) {
        const result = await this.validateInstance(token, 'place')

        if (result.success) {
            const comments = await this.database.query(`
            SELECT id, id_place FROM Comments WHERE id_place = ${result.id_instance} AND id = ${id_comment}
            `)

            if (comments.rows.length) {
                await this.database.query(`
                INSERT INTO Feedback (id_comment, feedback, timestamp)
                VALUES (${id_comment}, '${feedback}', '${timestamp}')
                `)
    
                return {
                    success: true
                }
            } 
        }

        return { success: false }
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

    async getCities() {

        const { rows } = await this.database.query(`SELECT * FROM Cities`)

        return rows
    }

    async getPlaces({city}) {
        const places = []

        if (city) {
            const id_city = await this.database.query(`SELECT id FROM Cities WHERE name = '${city}'`)

            await this.database.query(`
            SELECT * FROM Places WHERE id_city = ${id_city.rows[0].id}
            `).then(async results => {
                for (let place of results.rows) {
                    await this.database.query(`
                    SELECT * FROM Photos WHERE id_place = ${place.id}
                    `).then(el => places.push({place_details: place, photos: el.rows}))
                }
            })
        }
        else
            await this.database.query(`
            SELECT * FROM Places
            `).then(results => {
                for (let place of results.rows)
                    places.push({latitude: place.latitude, longitude: place.longitude, placename: place.placename})
            })
        console.log(places)
        return places
    }

    async getPlace({id, token}) {
        if (id) {
            const currentPlace = await this.database.query(`
            SELECT * FROM Places
            WHERE id = ${id}
            `)

            const photos = await this.database.query(`
            SELECT * FROM Photos
            WHERE id_place = ${id}
            `)

            currentPlace.rows[0].password_hash = null

            console.log({
                place_details: currentPlace.rows[0],
                photos: photos.rows
            })

            return {
                place_details: currentPlace.rows[0],
                photos: photos.rows
            }
        } else if (token) {
            const currentPlace = await this.database.query(`
            SELECT * FROM LoggedPlaces
            WHERE token ='${token}'
            `)

            const id = currentPlace.rows[0].id_place

            const data = await this.database.query(`
            SELECT P.*, C.name FROM Places AS P, Cities AS C
            WHERE P.id = ${id} AND P.id_city = C.id
            `)

            const photos = await this.database.query(`
            SELECT * FROM Photos
            WHERE id_place = ${id}
            `)

            data.rows[0].password_hash = null

            return {
                place_details: data.rows[0],
                photos: photos.rows
            }
        } else {
            return {
                place_details: null,
                photos: null
            }
        }
    }

    async getComments({id_place}) {

        try {
            let { rows } = await this.database.query(`
            SELECT C.id, comment, entranceGrade, bathroomGrade, interiorGrade, parkingGrade, C.timestamp, id_place, U.username, F.feedback FROM Comments AS C
            LEFT JOIN Users AS U ON C.id_user = U.id
            LEFT JOIN Feedback AS F ON C.id = F.id_comment
            WHERE C.id_place = ${id_place};
            `)
            return rows
            
        } catch(e) {
            console.log(e)
            return []
        }
    }

    async updateUser({token, dataToUpdate}) {
        const {success, id_instance} = await this.validateInstance(token, 'user')

        if (success) {
            const keys = Object.keys(dataToUpdate)

            keys.forEach( async key => {

                if (key != 'password')
                    await this.database.query(`
                    UPDATE Users
                    SET ${key} = '${dataToUpdate[key]}'
                    WHERE id = ${id_instance}
                    `)
                else {
                    if (dataToUpdate.password !== '') return { success: false}
                    const passwordHash = await bcrypt.hash(dataToUpdate[key], 8)
                    await this.database.query(`
                    UPDATE Users
                    SET password_hash = '${passwordHash}'
                    WHERE id = ${id_instance}
                    `)
                }

            })

            return {
                success: true,
            }
        }

        return {
            success: false,
        }
    }

    // IMPLEMENTAR ALTERAÇÃO DE FOTOS
    async updatePlace({token, dataToUpdate, files}) {
        const {success, id_instance} = await this.validateInstance(token, 'place')

        try {
            if (success) {
                const keys = Object.keys(dataToUpdate)

                keys.forEach( async key => {
    
                    if (key === 'password' && dataToUpdate[key].length) {
                        const passwordHash = await bcrypt.hash(dataToUpdate[key], 8)
                        console.log(dataToUpdate[key])
                        console.log(passwordHash)
                        await this.database.query(`
                        UPDATE Places
                        SET password_hash = '${passwordHash}'
                        WHERE id = ${id_instance}
                        `)
                    }
                    else if (key !== 'password') {
                        console.log(dataToUpdate[key])
                        await this.database.query(`
                        UPDATE Places
                        SET ${key} = '${dataToUpdate[key]}'
                        WHERE id = ${id_instance}
                        `)
                    }
                })

                try {
                    files.forEach(async photo => {
                        const filename = this.createFilename(photo.name.split('.')[photo.name.split('.').length - 1])
                        const url = './public/uploads/' + filename
                        photo.mv(url, async (err) => {
                            if (err) return err
                            await this.database.query(`
                            INSERT INTO Photos (id_place, photo_url)
                            VALUES (${id_instance}, '${'/uploads/' + filename}')
                            `)
                        })
                    })
                } catch {
                    const filename = this.createFilename(files.name.split('.')[files.name.split('.').length - 1])
                    const url = './public/uploads/' + filename
                    files.mv(url, async (err) => {
                        if (err) return err
                        await this.database.query(`
                        INSERT INTO Photos (id_place, photo_url)
                        VALUES (${id_instance}, '${'/uploads/' + filename}')
                        `)
                    })
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    async updateComment({id_comment, token, comment, grade}) {
        const {success, id_instance} = await this.validateInstance(token, 'user')

        if (success) {
            await this.database.query(`
            UPDATE Comments
            SET comment = "${comment}",
            timestamp = ${new Date().toJSON()},
            grade = ${grade}
            WHERE id = ${id_comment} AND id_user = ${id_instance}
            `)

            return { success: true }
        }

        return { success: false }
    }

    async deleteUser({token}) {
        const {success, id_instance} = await this.validateInstance(token, 'user')

        if (success) {
            await this.database.query(`
            DELETE FROM Users
            WHERE id = ${id_instance}
            `)

            return { success: true }
        }

        return { success: false }
    }

    async deletePlace({token}) {
        const {success, id_instance} = await this.validateInstance(token, 'place')

        if (success) {
            await this.database.query(`
            DELETE FROM Places
            WHERE id = ${id_instance}
            `)
            return { success: true }
        }

        return { success: false }
    }

    async deleteComment({id_comment, token}) {
        const {success, id_instance} = await this.validateInstance(token, 'user')

        if (success) {
            await this.database.query(`
            DELETE FROM Comments
            WHERE id_user = ${id_instance} AND id = ${id_comment}
            `)

            return { success: true }
        }

        return { success: false }
    }

    async deletePhoto({id_photo, token}) {
        const {success, id_instance} = await this.validateInstance(token, 'place')

        if (success) {
            let {rows} = await this.database.query(`
                SELECT * FROM Photos
                WHERE id = ${id_photo}
            `)

            console.log('./public' + rows[0].photo_url)
            fs.unlinkSync('./public' + rows[0].photo_url)

            await this.database.query(`
                DELETE FROM Photos
                WHERE id = ${id_photo}
            `)

            return { success: true }
        }

        return { success: false }
    }

    async authenticateUser({email, password}) {
        let obj
        try {
            obj = await this.database.query(`
            SELECT * FROM Users WHERE email = '${email}'
            `)

            let row = obj.rows[0]
            console.log(row)

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
                } else {
                    return {success: false, message: 'Email ou senha incorretos'} 
                }
            } else return {success: false, message: 'Email ou senha incorretos'}
        } catch (e) {
            console.log('The error is here')
            return {success: false}
        }
    }

    async authenticatePlace({email, password}) {
        let {rows} = await this.database.query(`
        SELECT * FROM Places WHERE email = '${email}'
        `)

        try {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].email === email) {
                    let match = await bcrypt.compare(password, rows[i].password_hash)
    
                    if (match) {
                        const token = this.createToken()
    
                        await this.database.query(`
                        INSERT INTO LoggedPlaces (id_place, token)
                        VALUES (${rows[i].id}, '${token}')
                        `)
    
                        return {token, success: true}
                    } else {
                        console.log('Any user has founded!')
                        return {success: false, message: 'Email ou senha incorretos'}
                    }
                } else return {success: false, message: 'Email ou senha incorretos'}
            }

            return {success: false, message: 'Email ou senha incorretos'}
        } catch (e) {
            console.log(e)
            return {success: false, message: 'Ops... Algo deu errado! Tente novamente mais tarde'}
        }
    }

    async authenticateToken({token}) {
        const user = await this.database.query(`
        SELECT * FROM LoggedUsers
        WHERE token='${token}'
        `)

        const place = await this.database.query(`
        SELECT * FROM LoggedPlaces
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
            SELECT * FROM Places
            WHERE id = ${place.rows[0].id_place}
            `)

            if (rows[0]) {
                return { authorized: true, isUser: false }
            }

            return { authorized: false }
        }
    }

}

module.exports = new Server()