import pool from '../db/index.js';

// Validate input
const isValidUser = (user) => {
  const { name, email, age } = user;
  return (
    typeof name === 'string' &&
    name.trim() !== '' &&
    typeof email === 'string' &&
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) &&
    Number.isInteger(age) &&
    age > 0
  );
};


// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid user ID' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// CREATE user
export const createUser = async (req, res) => {
  const { name, email, age } = req.body;

  if (!isValidUser(req.body)) {
    return res.status(400).json({ error: 'Invalid user data' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
      [name, email, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, age } = req.body;

  if (!id || !isValidUser(req.body)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *',
      [name, email, age, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid user ID' });

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: `User with ID ${id} deleted` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};