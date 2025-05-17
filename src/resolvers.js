const jwt  = require('jsonwebtoken');
const User = require('./models/user');
const Todo = require('./models/todo');

const makeToken = user =>
  jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

module.exports = {
  Query: {
    getUsers: () => User.find(),
    getUser: (_, { id }) => User.findById(id),
    getTodos: () => Todo.find(),
    getTodo: (_, { id }) => Todo.findById(id),
    getTodosByUser: (_, { userId }) => Todo.find({ user: userId })
  },

  Mutation: {
    // Auth
    register: async (_, args) => {
      const user = await User.create(args);
      return { token: makeToken(user), user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePass(password)))
        throw new Error('Invalid credentials');
      return { token: makeToken(user), user };
    },

    // for Users 
    addUser: (_, args, { auth }) => {
      if (!auth) throw new Error('Not authorized');
      return User.create(args);
    },
    updateUser: (_, { id, ...data }, { auth }) => {
      if (!auth) throw new Error('Not authorized');
      return User.findByIdAndUpdate(id, data, { new: true });
    },
    deleteUser: (_, { id }, { auth }) => {
      if (!auth) throw new Error('Not authorized');
      return !!User.findByIdAndDelete(id);
    },

    addTodo: (_, { title }, { auth }) => {
      if (!auth) throw new Error('Login first');
      return Todo.create({ title, user: auth.userId });
    },
    updateTodo: (_, { id, ...data }, { auth }) => {
      if (!auth) throw new Error('Login first');
      return Todo.findOneAndUpdate({ _id: id, user: auth.userId }, data, { new: true });
    },
    deleteTodo: async (_, { id }, { auth }) => {
      if (!auth) throw new Error('Login first');
      const res = await Todo.findOneAndDelete({ _id: id, user: auth.userId });
      return !!res;
    }
  },

  User: {
    todos: parent => Todo.find({ user: parent.id })
  },
  Todo: {
    user: parent => User.findById(parent.user)
  }
};
