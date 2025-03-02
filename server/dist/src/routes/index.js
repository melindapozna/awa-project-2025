"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const google_passport_config_1 = __importDefault(require("../middleware/google-passport-config"));
const validateToken_1 = require("../middleware/validateToken");
const Board_1 = require("../models/Board");
require("mongoose");
const Column_1 = require("../models/Column");
const Card_1 = require("../models/Card");
const router = (0, express_1.Router)();
//check if user has permission to access a board
async function checkPermission(userId, boardId) {
    const board = await Board_1.Board.findOne({ _id: boardId, owner: userId });
    if (board) {
        return true;
    }
    return false;
}
//test connection
router.get("/test", async (req, res) => {
    try {
        return res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.log(`Error: ${error}`);
        return res.status(500).json({ message: "Internal sever eror" });
    }
});
//login: return 404 if user doesn't exist, if credentials match then create a JWT token with expiry = 10 mins
router.post("/login", (0, express_validator_1.body)("username").trim().escape(), (0, express_validator_1.body)("password").escape(), async (req, res) => {
    try {
        const user = await User_1.User.findOne({ username: req.body.username });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.password) {
            return res.status(404).json({ message: "Password is required" });
        }
        if (bcrypt_1.default.compareSync(req.body.password, user.password)) {
            const jwtPayload = {
                _id: user._id,
                username: user.username
            };
            const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: "10m" });
            console.log(token);
            return res.status(200).json({ success: true, token });
        }
        return res.status(401).json({ message: "Login failed" });
    }
    catch (error) {
        console.error(`Error during user login: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
//registration
router.post("/register", (0, express_validator_1.body)("username").trim().isLength({ min: 3 }).escape(), (0, express_validator_1.body)("password").isLength({ min: 5 }), async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const existingUser = await User_1.User.findOne({ username: req.body.username });
        console.log(existingUser);
        if (existingUser) {
            return res.status(403).json({ message: "Username already in use" });
        }
        const salt = bcrypt_1.default.genSaltSync(10);
        const hash = bcrypt_1.default.hashSync(req.body.password, salt);
        await User_1.User.create({
            username: req.body.username,
            password: hash
        });
        return res.status(200).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error(`Error during registration: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
// Google login
router.get("/google-client-id", (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});
router.get("/auth/google", google_passport_config_1.default.authenticate("google", { scope: ['profile'] }));
router.get("/auth/google/callback", google_passport_config_1.default.authenticate("google", {
    session: false,
    failureRedirect: "/login"
}), async (req, res) => {
    try {
        const user = await User_1.User.findOne({ googleId: req.user.id });
        const jwtPayload = {};
        if (!user) {
            const newUser = await User_1.User.create({
                username: req.user.displayName,
                googleId: req.user.id
            });
            jwtPayload.username = newUser.username;
            jwtPayload._id = newUser._id;
        }
        else {
            jwtPayload.username = user.username;
            jwtPayload._id = user._id;
        }
        const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: "10m" });
        res.redirect(`http://localhost:5173/login/success?token=${token}`);
        //return res.status(200).json({ success: true, token })
    }
    catch (error) {
        console.error(`Error during external login: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
//Board routes
//get all boards per user
router.get("/boards", validateToken_1.validateToken, async (req, res) => {
    try {
        console.log(req.user);
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        //console.log(user._id)
        const boards = await Board_1.Board.find({ owner: user._id });
        res.status(200).json({ message: boards });
    }
    catch (error) {
        console.error(`Error during fetching the boards: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//create a new board
router.post("/boards/new", validateToken_1.validateToken, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const existingBoard = await Board_1.Board.findOne({ title: req.body.title, owner: user._id });
        if (existingBoard) {
            return res.status(403).json({ message: "Board title is already in use" });
        }
        console.log(user);
        await Board_1.Board.create({
            title: req.body.title,
            owner: user
        });
        return res.status(200).json({ message: "Board registered successfully" });
    }
    catch (error) {
        console.error(`Error during creating board: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
//get board by id
//return 403 if the user doesn't have permission to view it
router.get("/boards/id/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const boardId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const board = await Board_1.Board.findOne({ _id: boardId, owner: user._id });
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        res.status(200).json({ message: board });
    }
    catch (error) {
        console.error(`Error during fetching the board: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//get all columns that belong to a board
router.get("/boards/id/:id/columns", validateToken_1.validateToken, async (req, res) => {
    try {
        const boardId = req.params.id;
        console.log(req.user);
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        if (!checkPermission(user._id, boardId)) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        //console.log(user._id)
        const columns = await Column_1.Column.find({ boardId: boardId });
        //console.log(columns)
        return res.status(200).json({ message: columns });
    }
    catch (error) {
        console.error(`Error during fetching the boards: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.post("/boards/:id/columns/new", validateToken_1.validateToken, async (req, res) => {
    try {
        const boardId = req.params.id;
        console.log(req.user);
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const board = await Board_1.Board.findOne({ _id: boardId, owner: user._id });
        if (!board) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        //console.log(user._id)
        const columns = await Column_1.Column.findOne({ boardId: boardId, title: req.body.title });
        if (columns) {
            return res.status(403).json({ message: "Column title is already in use" });
        }
        await Column_1.Column.create({
            title: req.body.title,
            boardId: boardId
        });
        return res.status(200).json({ message: "Column registered successfully" });
    }
    catch (error) {
        console.error(`Error during fetching the boards: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//get column by ID
router.get("/columns/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const columnId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const board = await Column_1.Column.findOne({ _id: columnId });
        if (!board) {
            return res.status(404).json({ message: "Column not found" });
        }
        res.status(200).json({ message: board });
    }
    catch (error) {
        console.error(`Error during fetching the column: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//get card by ID
router.get("/cards/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const cardId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const card = await Card_1.Card.findOne({ _id: cardId });
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }
        res.status(200).json({ message: card });
    }
    catch (error) {
        console.error(`Error during fetching the card: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//save new card to database
router.post("/columns/:id/cards/new", validateToken_1.validateToken, async (req, res) => {
    try {
        const columnId = req.params.id;
        console.log(req.user);
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const column = await Column_1.Column.findOne({ _id: columnId });
        if (!column) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const board = await Board_1.Board.findOne({ owner: user._id, _id: column.boardId });
        if (!board) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const cards = await Card_1.Card.findOne({ columnId: columnId, title: req.body.title });
        if (cards) {
            return res.status(403).json({ message: "Card title is already in use for this column" });
        }
        await Card_1.Card.create({
            columnId: columnId,
            title: req.body.title,
            subtitle: req.body.subtitle,
            description: req.body.description,
            color: req.body.color,
            workload: req.body.workload
        });
        console.log("card created");
        return res.status(200).json({ message: "Card registered successfully" });
    }
    catch (error) {
        console.error(`Error during fetching the cards: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//get all cards by column ID
router.get("/columns/:id/cards", validateToken_1.validateToken, async (req, res) => {
    try {
        const columnId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const cards = await Card_1.Card.find({ columnId: columnId }).sort({ order: 1 });
        if (!cards.length) {
            return res.status(200).json({ message: [] });
        }
        const column = await Column_1.Column.findOne({ _id: cards[0].columnId });
        if (!column) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const board = await Board_1.Board.findOne({ owner: user._id, _id: column.boardId });
        if (!board) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        return res.status(200).json({ message: cards });
    }
    catch (error) {
        console.error(`Error during fetching the cards: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
//DELETE routes
router.delete("/delete/cards/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const cardId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const card = await Card_1.Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const column = await Column_1.Column.findOne({ _id: card.columnId });
        if (!column) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const board = await Board_1.Board.findOne({ owner: user._id, _id: column.boardId });
        if (!board) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        await Card_1.Card.findByIdAndDelete(card._id);
        return res.status(200).json({ message: "Card deleted successfully" });
    }
    catch (error) {
        console.error(`Error during deleting card: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.delete("/delete/columns/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const columnId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const column = await Column_1.Column.findById(columnId);
        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }
        const board = await Board_1.Board.findOne({ owner: user._id, _id: column.boardId });
        if (!board) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const cards = await Card_1.Card.find({ columnId: columnId });
        if (cards) {
            await Card_1.Card.deleteMany({ columnId: cards[0].columnId });
        }
        await Column_1.Column.findByIdAndDelete(columnId);
        return res.status(200).json({ message: "Column deleted successfully" });
    }
    catch (error) {
        console.error(`Error during deleting column: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.delete("/delete/boards/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const boardId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const board = await Board_1.Board.findOne({ _id: boardId, owner: user._id });
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        const columns = await Column_1.Column.find({ boardId: boardId });
        if (columns.length) {
            const cards = await Card_1.Card.find({ columnId: columns[0]._id });
            if (cards.length) {
                await Card_1.Card.deleteMany({ columnId: cards[0].columnId });
            }
            await Column_1.Column.deleteMany({ boardId: boardId });
        }
        await Board_1.Board.findByIdAndDelete(boardId);
        return res.status(200).json({ message: "Board deleted successfully" });
    }
    catch (error) {
        console.error(`Error during deleting board: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
//EDIT routes
//update card values
router.put("/cards/:id/update", validateToken_1.validateToken, async (req, res) => {
    try {
        const cardId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const filter = { _id: cardId };
        let updateValues;
        if (req.body.order) {
            updateValues = {
                order: req.body.order
            };
        }
        else {
            updateValues = {
                title: req.body.title,
                subtitle: req.body.subtitle,
                description: req.body.description,
                color: req.body.color,
                order: req.body.order,
                workload: req.body.workload
            };
        }
        console.log(updateValues);
        const card = await Card_1.Card.findOneAndUpdate(filter, updateValues);
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }
        res.status(200).json({ message: "Card updated successfully" });
    }
    catch (error) {
        console.error(`Error during updating the card: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//update board title
router.put("/columns/:id/update", validateToken_1.validateToken, async (req, res) => {
    try {
        const columnId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const filter = { _id: columnId };
        let updateValues;
        if (req.body.order) {
            updateValues = {
                order: req.body.order
            };
        }
        else {
            updateValues = {
                title: req.body.title
            };
        }
        const column = await Column_1.Column.findOneAndUpdate(filter, updateValues);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }
        res.status(200).json({ message: "Column updated successfully" });
    }
    catch (error) {
        console.error(`Error during updating the column: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//update board title
router.put("/boards/:id/update", validateToken_1.validateToken, async (req, res) => {
    try {
        const boardId = req.params.id;
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: 'No user found' });
        }
        const filter = { _id: boardId };
        const updateValues = {
            title: req.body.title
        };
        const board = await Board_1.Board.findOneAndUpdate(filter, updateValues);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        res.status(200).json({ message: "Board updated successfully" });
    }
    catch (error) {
        console.error(`Error during updating the board: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
