const db = require('../dbconfig/db');

// Function to get all todos
const getAllTodos = async () => {
    try {
        const results = await db.query(`
            SELECT todos.title, todos.created_at, todos.completed, todos.description_id 
            FROM todos
            LEFT JOIN descriptions ON todos.description_id = descriptions.id
        `);
        return results;
    } catch (error) {
        console.error("Error fetching todos:", error);
        throw error;
    }
};

// Function to create a new todo
const createTodo = async (title, description) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Insert the description
        const descriptionQuery = `INSERT INTO descriptions (description) VALUES (?)`;
        const [descriptionResult] = await connection.query(descriptionQuery, [description]);
        const descriptionId = descriptionResult.insertId;

        // Step 2: Insert the todo
        const todoQuery = `INSERT INTO todos (title, description_id) VALUES (?, ?)`;
        const [todoResult] = await connection.query(todoQuery, [title, descriptionId]);

        // Commit the transaction
        await connection.commit();
        return { todoId: todoResult.insertId, descriptionId };
    } catch (error) {
        await connection.rollback();
        console.error("Error creating todo:", error);
        throw error; // Rethrow for further handling
    } finally {
        connection.release();
    }
};

// Function to update a todo
const updateTodo = async (id, completed) => {
    try {
        const results = await db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id]);
        return results;
    } catch (error) {
        console.error("Error updating todo:", error);
        throw error;
    }
};

// Function to delete a todo
const deleteTodo = async (id) => {
    try {
        const results = await db.query('DELETE FROM todos WHERE id = ?', [id]);
        return results;
    } catch (error) {
        console.error("Error deleting todo:", error);
        throw error;
    }
};

module.exports = { getAllTodos, createTodo, updateTodo, deleteTodo };
