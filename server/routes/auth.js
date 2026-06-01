import Router from 'koa-router'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = new Router({ prefix: '/api/auth' })

const USERS_FILE = path.join(__dirname, '../data/users.json')

const getUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body
  
  if (!username || !password) {
    ctx.body = { success: false, message: '请输入账号和密码' }
    return
  }

  const users = getUsers()
  const user = users.find(u => u.username === username && u.status === 'active')

  if (!user) {
    ctx.body = { success: false, message: '账号不存在或已禁用' }
    return
  }

  if (user.password !== password) {
    ctx.body = { success: false, message: '密码错误' }
    return
  }

  const token = generateToken()
  user.token = token

  saveUsers(users)

  ctx.body = {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: user.permissions || []
      }
    }
  }
})

router.post('/logout', async (ctx) => {
  const authorization = ctx.headers.authorization
  const token = authorization ? authorization.replace('Bearer ', '') : null
  
  if (token) {
    const users = getUsers()
    const user = users.find(u => u.token === token)
    if (user) {
      user.token = null
      saveUsers(users)
    }
  }

  ctx.body = { success: true }
})

router.get('/users', async (ctx) => {
  const authorization = ctx.headers.authorization
  const token = authorization ? authorization.replace('Bearer ', '') : null
  
  if (!token) {
    ctx.body = { success: false, message: '未登录' }
    return
  }

  const users = getUsers()
  const currentUser = users.find(u => u.token === token)

  if (!currentUser) {
    ctx.body = { success: false, message: '登录已失效' }
    return
  }

  if (currentUser.role !== 'admin') {
    ctx.body = { success: false, message: '无权限' }
    return
  }

  const userList = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    status: u.status
  }))

  ctx.body = { success: true, data: userList }
})

router.post('/users', async (ctx) => {
  const authorization = ctx.headers.authorization
  const token = authorization ? authorization.replace('Bearer ', '') : null
  
  if (!token) {
    ctx.body = { success: false, message: '未登录' }
    return
  }

  const users = getUsers()
  const currentUser = users.find(u => u.token === token)

  if (!currentUser || currentUser.role !== 'admin') {
    ctx.body = { success: false, message: '无权限' }
    return
  }

  const { username, name, password, role = 'user', status = 'active' } = ctx.request.body

  if (!username || !name || !password) {
    ctx.body = { success: false, message: '请填写完整信息' }
    return
  }

  if (users.find(u => u.username === username)) {
    ctx.body = { success: false, message: '账号已存在' }
    return
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    name,
    password,
    role,
    status,
    token: null,
    permissions: role === 'admin' ? ['manage_users', 'manage_settings', 'manage_quickoptions'] : ['view_calendar']
  }

  users.push(newUser)
  saveUsers(users)

  ctx.body = { success: true, data: newUser }
})

router.put('/users/:id', async (ctx) => {
  const authorization = ctx.headers.authorization
  const token = authorization ? authorization.replace('Bearer ', '') : null
  
  if (!token) {
    ctx.body = { success: false, message: '未登录' }
    return
  }

  const users = getUsers()
  const currentUser = users.find(u => u.token === token)

  if (!currentUser || currentUser.role !== 'admin') {
    ctx.body = { success: false, message: '无权限' }
    return
  }

  const { id } = ctx.params
  const { name, role, status } = ctx.request.body

  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    ctx.body = { success: false, message: '用户不存在' }
    return
  }

  const user = users[userIndex]
  
  if (name) user.name = name
  if (role) {
    user.role = role
    user.permissions = role === 'admin' 
      ? ['manage_users', 'manage_settings', 'manage_quickoptions'] 
      : ['view_calendar']
  }
  if (status) user.status = status

  saveUsers(users)

  ctx.body = { success: true, data: user }
})

router.delete('/users/:id', async (ctx) => {
  const authorization = ctx.headers.authorization
  const token = authorization ? authorization.replace('Bearer ', '') : null
  
  if (!token) {
    ctx.body = { success: false, message: '未登录' }
    return
  }

  const users = getUsers()
  const currentUser = users.find(u => u.token === token)

  if (!currentUser || currentUser.role !== 'admin') {
    ctx.body = { success: false, message: '无权限' }
    return
  }

  const { id } = ctx.params

  if (currentUser.id === id) {
    ctx.body = { success: false, message: '不能删除自己的账号' }
    return
  }

  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    ctx.body = { success: false, message: '用户不存在' }
    return
  }

  users.splice(userIndex, 1)
  saveUsers(users)

  ctx.body = { success: true }
})

export default router
