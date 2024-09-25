import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import util from 'util';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Variable to store the data
let storedData: { prerenderAllSite: boolean; routes: string[] } | null = null;

// Promisify exec for better async/await usage
const execPromise = util.promisify(exec);

// Function to generate static site
const generateStaticSite = async (): Promise<void> => {
  try {
    const { stdout, stderr } = await execPromise('npx nuxt generate', {
      cwd: 'C:\\ZD\\Projects\\trainings\\nuxt-training\\nuxt-training SSG\\nuxt3-training',
      shell: 'C:\\Windows\\System32\\cmd.exe',
      maxBuffer: 1024 * 1024 // Increase buffer size to 1MB
    });
    console.log(`v00 stdout: ${stdout}`);
    if (stderr) {
      if (stderr.toLowerCase().includes('error')) {
        console.error(`v00 error in stderr: ${stderr}`);
        throw new Error(stderr);
      } else if (stderr.toLowerCase().includes('warn')) {
        console.warn(`v00 warning in stderr: ${stderr}`);
      } else {
        console.log(`v00 stderr: ${stderr}`);
      }
    }
    
  } catch (error: any) {
    console.error(`Error executing command: ${error}`);
    throw error;
  }
};

// POST endpoint to log routes and trigger Nuxt generate
app.post('/log-routes', async (req: Request, res: Response) => {
  const { prerenderAllSite, routes } = req.body;
  console.log('Prerender All Site:', prerenderAllSite);
  console.log('Routes:', routes);

  // Store the data
  storedData = { prerenderAllSite, routes };

  // Execute the Nuxt generate command
  try {
    await generateStaticSite();
    res.send(`Routes logged and static site generated successfully! Routes changed= [${routes}]`);
  } catch (error: any) {
    res.status(500).send(`Error generating static site: ${error.message}`);
  }
});

// GET endpoint to retrieve the stored data
app.get('/get-routes', (req: Request, res: Response) => {
  // Log information about the request
  const requesterIP = req.ip;
  const requestTime = new Date().toISOString();
  console.log(`Endpoint accessed by ${requesterIP} at ${requestTime}`);
  if (storedData) {
    res.json(storedData);
  } else {
    res.status(404).send('No data found');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
