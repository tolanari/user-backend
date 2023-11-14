import db from '../config/database'
import { allAsync, runAsync } from '../utils/dbHelpers'

export interface User {
    id?: number
    username: string
    password: string
    role?: string
    createdAt?: string
}

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

export async function getAllUsers(): Promise<User[]> {
    try {
        const users = await allAsync('SELECT * FROM users')

        if (!users) {
            throw new Error('Пользователи не найдены')
        }

        return users as User[]
    } catch (error) {
        throw error
    }
}

export async function createUser(user: User): Promise<number> {
    try {
        const { username, password } = user
        const query = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`
        const result = await runAsync(query, [username, password, 'user'])
        return result.lastID as number
    } catch (error) {
        console.error('Create user error', error)
        throw error
    }
}

export async function findUserById(id: number): Promise<User | null> {
    try {
        const query = `SELECT * FROM users WHERE id = ?`
        const user = await allAsync(query, [id])
        return user[0] || null
    } catch (error) {
        console.error('Find user by ID error', error)
        throw error
    }
}

export async function updateUser(userId: number, userData: Partial<User>): Promise<boolean> {
    try {
        const { username, password } = userData
        const query = `
        UPDATE users
        SET username = ?,
            password = ?
        WHERE id = ?
      `

        await runAsync(query, [username, password, userId])
        return true
    } catch (error) {
        console.error('Update user error', error)
        return false
    }
}

export async function deleteUser(userId: number): Promise<boolean> {
    try {
        const query = 'DELETE FROM users WHERE id = ?'
        await runAsync(query, [userId])
        return true
    } catch (error) {
        console.error('Delete user error', error)
        return false
    }
}

process.on('exit', () => {
    db.close()
})
