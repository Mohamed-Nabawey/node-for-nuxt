"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const app = (0, express_1.default)();
const port = 3000;
// Middleware to parse JSON bodies
app.use(body_parser_1.default.json());
// Variable to store the data
let storedData = null;
// Promisify exec for better async/await usage
const execPromise = util_1.default.promisify(child_process_1.exec);
// Function to generate static site
const generateStaticSite = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stdout, stderr } = yield execPromise('npx nuxt generate', {
            cwd: 'C:\\ZD\\Projects\\trainings\\nuxt-training\\nuxt-training SSG\\nuxt3-training',
            shell: 'C:\\Windows\\System32\\cmd.exe',
            maxBuffer: 1024 * 1024 // Increase buffer size to 1MB
        });
        console.log(`v00 stdout: ${stdout}`);
        if (stderr) {
            if (stderr.toLowerCase().includes('error')) {
                console.error(`v00 error in stderr: ${stderr}`);
                throw new Error(stderr);
            }
            else if (stderr.toLowerCase().includes('warn')) {
                console.warn(`v00 warning in stderr: ${stderr}`);
            }
            else {
                console.log(`v00 stderr: ${stderr}`);
            }
        }
    }
    catch (error) {
        console.error(`Error executing command: ${error}`);
        throw error;
    }
});
// POST endpoint to log routes and trigger Nuxt generate
app.post('/log-routes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prerenderAllSite, routes } = req.body;
    console.log('Prerender All Site:', prerenderAllSite);
    console.log('Routes:', routes);
    // Store the data
    storedData = { prerenderAllSite, routes };
    // Execute the Nuxt generate command
    try {
        yield generateStaticSite();
        res.send(`Routes logged and static site generated successfully! Routes changed= [${routes}]`);
    }
    catch (error) {
        res.status(500).send(`Error generating static site: ${error.message}`);
    }
}));
// GET endpoint to retrieve the stored data
app.get('/get-routes', (req, res) => {
    // Log information about the request
    const requesterIP = req.ip;
    const requestTime = new Date().toISOString();
    console.log(`Endpoint accessed by ${requesterIP} at ${requestTime}`);
    if (storedData) {
        res.json(storedData);
    }
    else {
        res.status(404).send('No data found');
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
